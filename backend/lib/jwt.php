<?php
declare(strict_types=1);

/**
 * JWT HS256 mínimo sin dependencias.
 * Implementa lo necesario para emitir y verificar tokens.
 * Para algo más robusto, migra a firebase/php-jwt vía Composer.
 */
final class JWT {
  public static function encode(array $payload, string $secret): string {
    $header = ['typ' => 'JWT', 'alg' => 'HS256'];

    $h = self::b64url(json_encode($header, JSON_UNESCAPED_SLASHES));
    $p = self::b64url(json_encode($payload, JSON_UNESCAPED_SLASHES));
    $sig = self::b64url(hash_hmac('sha256', "$h.$p", $secret, true));

    return "$h.$p.$sig";
  }

  /**
   * @return array payload si es válido, o null si no
   */
  public static function decode(string $token, string $secret): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $sig] = $parts;

    $expected = self::b64url(hash_hmac('sha256', "$h.$p", $secret, true));
    if (!hash_equals($expected, $sig)) return null;

    $payload = json_decode(self::b64url_decode($p), true);
    if (!is_array($payload)) return null;

    // Verifica exp si existe
    if (isset($payload['exp']) && time() >= (int) $payload['exp']) return null;
    if (isset($payload['nbf']) && time() < (int) $payload['nbf']) return null;

    return $payload;
  }

  public static function issueAccessToken(
    string $userId,
    string $email,
    string $secret,
    string $issuer,
    int $ttl
  ): string {
    $now = time();
    return self::encode([
      'sub'   => $userId,
      'email' => $email,
      'iss'   => $issuer,
      'iat'   => $now,
      'exp'   => $now + $ttl,
    ], $secret);
  }

  private static function b64url(string $raw): string {
    return rtrim(strtr(base64_encode($raw), '+/', '-_'), '=');
  }

  private static function b64url_decode(string $data): string {
    $remainder = strlen($data) % 4;
    if ($remainder) $data .= str_repeat('=', 4 - $remainder);
    $decoded = base64_decode(strtr($data, '-_', '+/'), true);
    return $decoded === false ? '' : $decoded;
  }
}
