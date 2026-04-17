<?php
header('Content-Type: application/json; charset=utf-8');
http_response_code(404);
echo json_encode([
  'ok' => false,
  'error' => 'Not found',
  'hint' => 'Endpoints disponibles: POST /api/login · POST /api/register · GET /api/me · POST /api/logout · GET /api/health',
]);
