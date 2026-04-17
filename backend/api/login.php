<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  Response::error('Method not allowed', 405);
}

$body = Response::readJsonBody();
$email    = Validation::email($body['email'] ?? null);
$password = is_string($body['password'] ?? null) && strlen($body['password']) > 0
  ? $body['password']
  : null;

if (!$email || !$password) {
  Response::error('Credenciales inválidas.', 400);
}

// Rate limit por IP + email
$bucket = 'login:' . sha1(strtolower($email) . '|' . RateLimit::clientIp());
$rl = RateLimit::check(
  $ctx->pdo,
  $bucket,
  $ctx->cfg['security']['login_max_attempts'],
  $ctx->cfg['security']['login_window_secs']
);
if (!$rl['allowed']) {
  Response::error('Demasiados intentos. Espera antes de reintentar.', 429, [
    'retry_after' => $rl['retry_after'],
  ]);
}

$stmt = $ctx->pdo->prepare('SELECT id, email, password_hash, full_name, avatar_url FROM users WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
  // Mensaje genérico para no permitir enumeración
  Response::error('Credenciales inválidas. Verifica tu correo y contraseña.', 401);
}

// Rehash si el cost cambió (subida de seguridad)
if (password_needs_rehash($user['password_hash'], PASSWORD_BCRYPT, ['cost' => $ctx->cfg['security']['bcrypt_cost']])) {
  $newHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => $ctx->cfg['security']['bcrypt_cost']]);
  $ctx->pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$newHash, $user['id']]);
}

// Actualiza último login
$ctx->pdo->prepare('UPDATE users SET last_login_at = UTC_TIMESTAMP() WHERE id = ?')->execute([$user['id']]);

// Limpia rate limit en login exitoso
RateLimit::reset($ctx->pdo, $bucket);

$access = JWT::issueAccessToken(
  $user['id'],
  $user['email'],
  $ctx->cfg['jwt']['secret'],
  $ctx->cfg['jwt']['issuer'],
  $ctx->cfg['jwt']['access_ttl']
);

Response::ok([
  'user' => [
    'id'         => $user['id'],
    'email'      => $user['email'],
    'full_name'  => $user['full_name'],
    'avatar_url' => $user['avatar_url'],
  ],
  'access_token' => $access,
  'expires_in'   => $ctx->cfg['jwt']['access_ttl'],
]);
