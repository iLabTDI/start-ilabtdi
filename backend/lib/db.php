<?php
declare(strict_types=1);

final class DB {
  private static ?PDO $pdo = null;

  public static function connect(array $cfg): PDO {
    if (self::$pdo instanceof PDO) return self::$pdo;

    $dsn = sprintf(
      'mysql:host=%s;port=%d;dbname=%s;charset=%s',
      $cfg['host'], $cfg['port'], $cfg['database'], $cfg['charset']
    );

    self::$pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
      PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
      PDO::ATTR_EMULATE_PREPARES   => false,
      PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
    ]);

    return self::$pdo;
  }

  public static function uuid(): string {
    // UUID v4 sin depender de random_bytes? Sí, PHP 7+ lo tiene siempre.
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
  }
}
