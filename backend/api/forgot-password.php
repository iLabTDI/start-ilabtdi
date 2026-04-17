<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  Response::error('Method not allowed', 405);
}

$email = Validation::email(Response::readJsonBody()['email'] ?? null);

// Siempre respondemos OK (no filtrar si el email existe)
if (!$email) {
  Response::ok(['message' => 'Si el correo existe, te enviamos un enlace.']);
}

// Rate limit por IP — evita spam a buzones
$rl = RateLimit::check($ctx->pdo, 'forgot:' . RateLimit::clientIp(), 5, 60 * 15);
if (!$rl['allowed']) {
  Response::error('Demasiadas solicitudes. Espera un momento.', 429, ['retry_after' => $rl['retry_after']]);
}

$stmt = $ctx->pdo->prepare('SELECT id, email, full_name FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user) {
  $token = Tokens::issue($ctx->pdo, $user['id'], Tokens::KIND_RESET, 60 * 60); // 1h
  $resetUrl = rtrim($ctx->cfg['mail']['app_url'], '/') . '/reset-password?token=' . urlencode($token);

  Mailer::send([
    'to'       => $user['email'],
    'to_name'  => $user['full_name'] ?? '',
    'subject'  => 'Restablece tu contraseña de ' . ($ctx->cfg['mail']['app_name'] ?? 'iLab TDI'),
    'template' => 'reset-password',
    'vars'     => [
      'name'       => $user['full_name'] ?? 'tú',
      'action_url' => $resetUrl,
      'title'      => 'Restablecer tu contraseña',
      'preheader'  => 'Enlace válido por 1 hora.',
    ],
  ], $ctx->cfg);
}

Response::ok(['message' => 'Si el correo existe, te enviamos un enlace.']);
