<?php
declare(strict_types=1);

final class Response {
  public static function json(array $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
  }

  public static function error(string $message, int $status = 400, array $extra = []): void {
    self::json(array_merge(['ok' => false, 'error' => $message], $extra), $status);
  }

  public static function ok(array $data = []): void {
    self::json(['ok' => true] + $data, 200);
  }

  public static function applyCors(array $allowedOrigins): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin && in_array($origin, $allowedOrigins, true)) {
      header("Access-Control-Allow-Origin: $origin");
      header('Vary: Origin');
      header('Access-Control-Allow-Credentials: true');
      header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
      header('Access-Control-Allow-Headers: Content-Type, Authorization');
      header('Access-Control-Max-Age: 600');
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
      http_response_code(204);
      exit;
    }
  }

  public static function readJsonBody(): array {
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
  }
}
