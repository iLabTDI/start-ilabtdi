<?php
declare(strict_types=1);
require_once __DIR__ . '/lib/bootstrap.php';
$ctx = app_boot();

try {
  $ctx->pdo->query('SELECT 1');
  Response::ok(['db' => 'up', 'time' => gmdate('c')]);
} catch (Throwable $e) {
  Response::error('db_down', 503);
}
