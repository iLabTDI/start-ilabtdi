<?php
declare(strict_types=1);

/**
 * Template engine mínimo sin dependencias.
 *
 * Lee un archivo .html o .txt de backend/emails/ y reemplaza variables
 * {{foo}} y {{bar}} con los valores del array $vars.
 *
 * Para correos: también interpola `layout.html` (wrapper del email)
 * con el HTML específico del template interno.
 */
final class Templates {
  private const EMAILS_DIR = __DIR__ . '/../emails';

  /**
   * Renderiza el template HTML envuelto en el layout.
   *
   * @param array<string, string> $vars Variables para reemplazar. Además del
   *   cuerpo específico, el layout espera: subject, preheader, title, app_name,
   *   app_url, logo_url, primary_color.
   */
  public static function renderEmailHtml(string $template, array $vars): string {
    $body = self::renderFile("{$template}.html", $vars);
    $layout = self::renderFile('layout.html', array_merge($vars, ['body' => $body]));
    return $layout;
  }

  /**
   * Renderiza el template en texto plano (sin layout — el .txt es standalone).
   */
  public static function renderEmailText(string $template, array $vars): string {
    return self::renderFile("{$template}.txt", $vars);
  }

  /**
   * Lee un archivo y reemplaza variables {{foo}} por su valor.
   * Si una variable no está en $vars, se deja el placeholder literal.
   */
  private static function renderFile(string $relative, array $vars): string {
    $path = realpath(self::EMAILS_DIR . '/' . $relative);
    if (!$path || !str_starts_with($path, realpath(self::EMAILS_DIR) ?: '')) {
      throw new RuntimeException("Template no encontrado: {$relative}");
    }
    $raw = file_get_contents($path);
    if ($raw === false) {
      throw new RuntimeException("No se pudo leer template: {$relative}");
    }

    return preg_replace_callback(
      '/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/',
      static function (array $m) use ($vars): string {
        $key = $m[1];
        return array_key_exists($key, $vars) ? (string) $vars[$key] : $m[0];
      },
      $raw
    ) ?? $raw;
  }
}
