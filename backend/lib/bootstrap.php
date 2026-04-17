<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/rate-limit.php';
require_once __DIR__ . '/validation.php';
require_once __DIR__ . '/tokens.php';
require_once __DIR__ . '/mailer.php';

final class AppCtx {
  public readonly PDO $pdo;
  public readonly array $cfg;

  public function __construct(PDO $pdo, array $cfg) {
    $this->pdo = $pdo;
    $this->cfg = $cfg;
  }
}

function app_boot(): AppCtx {
  $cfgPath = __DIR__ . '/../config.php';
  if (!file_exists($cfgPath)) {
    Response::error('Backend no configurado. Copia config.example.php → config.php.', 500);
  }

  /** @var array $cfg */
  $cfg = require $cfgPath;

  if (empty($cfg['jwt']['secret']) || strlen($cfg['jwt']['secret']) < 32) {
    Response::error('JWT_SECRET vacío o muy corto.', 500);
  }

  Response::applyCors($cfg['cors']['allowed_origins']);

  try {
    $pdo = DB::connect($cfg['db']);
  } catch (PDOException $e) {
    $message = $cfg['debug'] ? $e->getMessage() : 'Error de base de datos.';
    Response::error($message, 500);
  }

  return new AppCtx($pdo, $cfg);
}

function require_auth(AppCtx $ctx): array {
  $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
    Response::error('Token faltante.', 401);
  }
  $payload = JWT::decode($m[1], $ctx->cfg['jwt']['secret']);
  if (!$payload || empty($payload['sub'])) {
    Response::error('Token inválido o expirado.', 401);
  }
  return $payload;
}
