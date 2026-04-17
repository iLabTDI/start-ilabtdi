<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'POST' && $method !== 'GET') {
  Response::error('Method not allowed', 405);
}

$token = $method === 'GET'
  ? (string) ($_GET['token'] ?? '')
  : (string) (Response::readJsonBody()['token'] ?? '');

if ($token === '') {
  Response::error('Token requerido.', 400);
}

$userId = Tokens::consume($ctx->pdo, $token, Tokens::KIND_VERIFY);
if ($userId === null) {
  Response::error('Token inválido o expirado.', 410);
}

$ctx->pdo->prepare('
  UPDATE users SET email_verified_at = UTC_TIMESTAMP()
   WHERE id = ? AND email_verified_at IS NULL
')->execute([$userId]);

// Email de bienvenida (non-fatal si falla)
$row = $ctx->pdo->prepare('SELECT email, full_name FROM users WHERE id = ? LIMIT 1');
$row->execute([$userId]);
$user = $row->fetch();
if ($user) {
  Mailer::send([
    'to'       => $user['email'],
    'to_name'  => $user['full_name'] ?? '',
    'subject'  => 'Bienvenido a ' . ($ctx->cfg['mail']['app_name'] ?? 'iLab TDI'),
    'template' => 'welcome',
    'vars'     => [
      'name'       => $user['full_name'] ?? 'tú',
      'action_url' => rtrim($ctx->cfg['mail']['app_url'], '/') . '/login',
      'title'      => 'Tu cuenta está lista',
      'preheader'  => 'Gracias por confirmar tu correo.',
    ],
  ], $ctx->cfg);
}

Response::ok(['verified' => true, 'user_id' => $userId]);
