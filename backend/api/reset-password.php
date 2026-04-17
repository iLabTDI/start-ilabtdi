<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  Response::error('Method not allowed', 405);
}

$body     = Response::readJsonBody();
$token    = (string) ($body['token'] ?? '');
$password = Validation::password($body['password'] ?? null, $ctx->cfg['security']['password_min_length']);

if ($token === '' || !$password) {
  Response::error('Token o contraseña inválidos.', 422, [
    'fields' => [
      'token'    => $token ? null : 'Token requerido',
      'password' => $password ? null : 'La contraseña no cumple los requisitos',
    ],
  ]);
}

$userId = Tokens::consume($ctx->pdo, $token, Tokens::KIND_RESET);
if ($userId === null) {
  Response::error('Token inválido o expirado.', 410);
}

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => $ctx->cfg['security']['bcrypt_cost']]);
$ctx->pdo->prepare('
  UPDATE users
     SET password_hash = ?, updated_at = UTC_TIMESTAMP()
   WHERE id = ?
')->execute([$hash, $userId]);

// Invalida tokens restantes (verify y reset) de este usuario
$ctx->pdo->prepare('
  UPDATE email_tokens
     SET used_at = UTC_TIMESTAMP()
   WHERE user_id = ? AND used_at IS NULL
')->execute([$userId]);

Response::ok(['message' => 'Contraseña actualizada.']);
