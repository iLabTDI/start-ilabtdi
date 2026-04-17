<?php
declare(strict_types=1);

require_once __DIR__ . '/../lib/bootstrap.php';
$ctx = app_boot();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  Response::error('Method not allowed', 405);
}

// JWT stateless: el logout real es que el cliente descarte el token.
// Acá respondemos OK y, si estuvieras usando refresh tokens persistentes,
// aquí los revocarías con UPDATE en refresh_tokens.
Response::ok(['message' => 'logged_out']);
