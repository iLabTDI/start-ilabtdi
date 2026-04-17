<?php
declare(strict_types=1);

/**
 * Tokens de un solo uso para verificación de email y reset de password.
 *
 * Seguridad:
 *   - El token plaintext se genera con random_bytes(32) → 64 chars hex.
 *   - En la DB guardamos solo el SHA-256 del token (columna token_hash).
 *     Si la DB se expone, los tokens no se pueden revertir.
 *   - Se marca `used_at` al consumirse (no se borra) — evita replay.
 *   - Expiración configurable por tipo: 24h para verify, 1h para reset.
 */
final class Tokens {
  public const KIND_VERIFY = 'verify';
  public const KIND_RESET  = 'reset';

  /** @return array{plaintext:string, hash:string} */
  public static function generate(): array {
    $plaintext = bin2hex(random_bytes(32)); // 64 chars hex
    return [
      'plaintext' => $plaintext,
      'hash'      => hash('sha256', $plaintext),
    ];
  }

  public static function hash(string $plaintext): string {
    return hash('sha256', $plaintext);
  }

  public static function issue(
    PDO $pdo,
    string $userId,
    string $kind,
    int $ttlSeconds
  ): string {
    self::invalidatePrevious($pdo, $userId, $kind);

    $token = self::generate();
    $expiresAt = (new DateTimeImmutable("+{$ttlSeconds} seconds", new DateTimeZone('UTC')))
      ->format('Y-m-d H:i:s');

    $stmt = $pdo->prepare('
      INSERT INTO email_tokens (token_hash, user_id, kind, expires_at)
      VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$token['hash'], $userId, $kind, $expiresAt]);

    return $token['plaintext'];
  }

  /**
   * Invalida tokens previos del mismo tipo para un usuario.
   * Se llama antes de emitir uno nuevo para que solo uno activo exista.
   */
  public static function invalidatePrevious(PDO $pdo, string $userId, string $kind): void {
    $pdo->prepare('
      UPDATE email_tokens
         SET used_at = UTC_TIMESTAMP()
       WHERE user_id = ?
         AND kind = ?
         AND used_at IS NULL
         AND expires_at > UTC_TIMESTAMP()
    ')->execute([$userId, $kind]);
  }

  /**
   * Consume un token (valida + marca como usado). Devuelve user_id si OK.
   * Retorna null si el token no existe, expiró, o ya fue usado.
   */
  public static function consume(PDO $pdo, string $plaintext, string $kind): ?string {
    $hash = self::hash($plaintext);

    $pdo->beginTransaction();
    try {
      $stmt = $pdo->prepare('
        SELECT user_id, expires_at, used_at
          FROM email_tokens
         WHERE token_hash = ? AND kind = ?
         FOR UPDATE
      ');
      $stmt->execute([$hash, $kind]);
      $row = $stmt->fetch();

      if (!$row || $row['used_at'] !== null) {
        $pdo->rollBack();
        return null;
      }
      if (strtotime($row['expires_at']) < time()) {
        $pdo->rollBack();
        return null;
      }

      $pdo->prepare('UPDATE email_tokens SET used_at = UTC_TIMESTAMP() WHERE token_hash = ?')
        ->execute([$hash]);
      $pdo->commit();
      return $row['user_id'];
    } catch (Throwable $e) {
      $pdo->rollBack();
      throw $e;
    }
  }

  /** Borra tokens expirados hace más de N días. Llamalo en un cron. */
  public static function gc(PDO $pdo, int $olderThanDays = 7): int {
    $stmt = $pdo->prepare('
      DELETE FROM email_tokens
       WHERE expires_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
    ');
    $stmt->execute([$olderThanDays]);
    return $stmt->rowCount();
  }
}
