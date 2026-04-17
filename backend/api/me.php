<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
  Response::error('Method not allowed', 405);
}

$payload = require_auth($ctx);

$stmt = $ctx->pdo->prepare('SELECT id, email, full_name, avatar_url, created_at FROM users WHERE id = ? LIMIT 1');
$stmt->execute([$payload['sub']]);
$user = $stmt->fetch();

if (!$user) {
  Response::error('Usuario no encontrado.', 404);
}

Response::ok(['user' => $user]);
