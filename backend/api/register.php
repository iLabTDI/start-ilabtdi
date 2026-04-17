<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  Response::error('Method not allowed', 405);
}

$body = Response::readJsonBody();
$email     = Validation::email($body['email'] ?? null);
$password  = Validation::password($body['password'] ?? null, $ctx->cfg['security']['password_min_length']);
$fullName  = Validation::fullName($body['full_name'] ?? null);

if (!$email || !$password || !$fullName) {
  Response::error('Datos inválidos.', 422, [
    'fields' => [
      'email'     => $email    ? null : 'Correo inválido',
      'password'  => $password ? null : 'La contraseña no cumple los requisitos',
      'full_name' => $fullName ? null : 'Nombre requerido',
    ],
  ]);
}

$rl = RateLimit::check($ctx->pdo, 'register:' . RateLimit::clientIp(), 10, 3600);
if (!$rl['allowed']) {
  Response::error('Demasiados intentos. Intenta más tarde.', 429, ['retry_after' => $rl['retry_after']]);
}

$stmt = $ctx->pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
if ($stmt->fetch()) {
  Response::error('No fue posible crear la cuenta con esos datos.', 409);
}

$id = DB::uuid();
$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => $ctx->cfg['security']['bcrypt_cost']]);

$ins = $ctx->pdo->prepare('
  INSERT INTO users (id, email, password_hash, full_name, email_verified_at, created_at, updated_at)
  VALUES (?, ?, ?, ?, NULL, UTC_TIMESTAMP(), UTC_TIMESTAMP())
');
$ins->execute([$id, $email, $hash, $fullName]);

// Token de verificación · 24h
$token = Tokens::issue($ctx->pdo, $id, Tokens::KIND_VERIFY, 60 * 60 * 24);
$verifyUrl = rtrim($ctx->cfg['mail']['app_url'], '/') . '/verify-email?token=' . urlencode($token);

Mailer::send([
  'to'       => $email,
  'to_name'  => $fullName,
  'subject'  => 'Confirma tu correo en ' . ($ctx->cfg['mail']['app_name'] ?? 'iLab TDI'),
  'template' => 'verify-email',
  'vars'     => [
    'name'       => $fullName,
    'action_url' => $verifyUrl,
    'title'      => 'Confirma tu correo',
    'preheader'  => 'Un clic y tu cuenta queda activa.',
  ],
], $ctx->cfg);

Response::ok([
  'user' => [
    'id'                => $id,
    'email'             => $email,
    'full_name'         => $fullName,
    'avatar_url'        => null,
    'email_verified_at' => null,
  ],
  'message' => 'Cuenta creada. Revisa tu correo para confirmarla.',
]);
