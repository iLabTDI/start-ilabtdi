<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  Response::error('Method not allowed', 405);
}

$email = Validation::email(Response::readJsonBody()['email'] ?? null);
if (!$email) {
  // Respuesta genérica para no filtrar existencia
  Response::ok(['message' => 'Si el correo existe y no está confirmado, te enviamos un enlace.']);
}

$rl = RateLimit::check($ctx->pdo, 'resend:' . RateLimit::clientIp(), 3, 60 * 15);
if (!$rl['allowed']) {
  Response::error('Demasiadas solicitudes. Espera un momento.', 429, ['retry_after' => $rl['retry_after']]);
}

$stmt = $ctx->pdo->prepare('
  SELECT id, email, full_name, email_verified_at
    FROM users WHERE email = ? LIMIT 1
');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && $user['email_verified_at'] === null) {
  $token = Tokens::issue($ctx->pdo, $user['id'], Tokens::KIND_VERIFY, 60 * 60 * 24);
  $verifyUrl = rtrim($ctx->cfg['mail']['app_url'], '/') . '/verify-email?token=' . urlencode($token);

  Mailer::send([
    'to'       => $user['email'],
    'to_name'  => $user['full_name'] ?? '',
    'subject'  => 'Confirma tu correo en ' . ($ctx->cfg['mail']['app_name'] ?? 'iLab TDI'),
    'template' => 'verify-email',
    'vars'     => [
      'name'       => $user['full_name'] ?? 'tú',
      'action_url' => $verifyUrl,
      'title'      => 'Confirma tu correo',
      'preheader'  => 'Un clic y tu cuenta queda activa.',
    ],
  ], $ctx->cfg);
}

Response::ok(['message' => 'Si el correo existe y no está confirmado, te enviamos un enlace.']);
