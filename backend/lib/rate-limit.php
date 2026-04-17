<?php
declare(strict_types=1);

final class RateLimit {
  /**
   * @return array{allowed:bool, retry_after:int, remaining:int}
   */
  public static function check(
    PDO $pdo,
    string $bucket,
    int $maxAttempts,
    int $windowSecs
  ): array {
    $now = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s');

    $pdo->beginTransaction();
    try {
      $stmt = $pdo->prepare('SELECT attempts, first_at FROM rate_limits WHERE bucket = ? FOR UPDATE');
      $stmt->execute([$bucket]);
      $row = $stmt->fetch();

      if (!$row) {
        $ins = $pdo->prepare('INSERT INTO rate_limits (bucket, attempts, first_at, last_at) VALUES (?, 1, ?, ?)');
        $ins->execute([$bucket, $now, $now]);
        $pdo->commit();
        return ['allowed' => true, 'retry_after' => 0, 'remaining' => $maxAttempts - 1];
      }

      $firstAtTs = strtotime($row['first_at']);
      $ageSecs   = time() - $firstAtTs;

      if ($ageSecs > $windowSecs) {
        // reset window
        $upd = $pdo->prepare('UPDATE rate_limits SET attempts = 1, first_at = ?, last_at = ? WHERE bucket = ?');
        $upd->execute([$now, $now, $bucket]);
        $pdo->commit();
        return ['allowed' => true, 'retry_after' => 0, 'remaining' => $maxAttempts - 1];
      }

      if ((int) $row['attempts'] >= $maxAttempts) {
        $pdo->commit();
        return ['allowed' => false, 'retry_after' => $windowSecs - $ageSecs, 'remaining' => 0];
      }

      $upd = $pdo->prepare('UPDATE rate_limits SET attempts = attempts + 1, last_at = ? WHERE bucket = ?');
      $upd->execute([$now, $bucket]);
      $remaining = $maxAttempts - ((int) $row['attempts'] + 1);
      $pdo->commit();
      return ['allowed' => true, 'retry_after' => 0, 'remaining' => $remaining];
    } catch (Throwable $e) {
      $pdo->rollBack();
      throw $e;
    }
  }

  public static function reset(PDO $pdo, string $bucket): void {
    $pdo->prepare('DELETE FROM rate_limits WHERE bucket = ?')->execute([$bucket]);
  }

  public static function clientIp(): string {
    $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($keys as $k) {
      if (!empty($_SERVER[$k])) {
        $ip = explode(',', $_SERVER[$k])[0];
        return trim($ip);
      }
    }
    return '0.0.0.0';
  }
}
