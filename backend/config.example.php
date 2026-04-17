<?php
/**
 * Config backend PHP · iLab TDI
 *
 * Copia este archivo a `config.php` (no subas `config.php` al repo).
 * El bootstrap script lo genera automáticamente desde .credentials.txt
 * si lo corres con `pnpm bootstrap`.
 */

return [
  // ── Base de datos MySQL ─────────────────────────────────────
  'db' => [
    'host'     => getenv('DB_HOST') ?: 'localhost',
    'port'     => (int) (getenv('DB_PORT') ?: 3306),
    'database' => getenv('DB_NAME') ?: 'ilabtdi_app',
    'user'     => getenv('DB_USER') ?: 'ilabtdi_app',
    'password' => getenv('DB_PASS') ?: '',
    'charset'  => 'utf8mb4',
  ],

  // ── JWT ─────────────────────────────────────────────────────
  // Secreto HS256 — genera uno largo y único por proyecto.
  //   openssl rand -hex 64
  'jwt' => [
    'secret'            => getenv('JWT_SECRET') ?: '',
    'issuer'            => getenv('JWT_ISSUER') ?: 'ilabtdi',
    'access_ttl'        => 3600,          // 1 hora
    'refresh_ttl'       => 60 * 60 * 24 * 30, // 30 días
  ],

  // ── CORS ────────────────────────────────────────────────────
  'cors' => [
    'allowed_origins' => array_filter([
      getenv('APP_URL') ?: 'https://ilabtdi.com',
      'http://localhost:5172',
      'http://localhost:5173',
    ]),
  ],

  // ── Seguridad ───────────────────────────────────────────────
  'security' => [
    'login_max_attempts'  => 5,
    'login_window_secs'   => 60 * 15,   // 15 min
    'bcrypt_cost'         => 12,
    'password_min_length' => 10,
  ],

  // ── Correo electrónico ──────────────────────────────────────
  'mail' => [
    // driver: 'stub' (dev · guarda HTML local), 'resend' (prod), 'smtp' (PHPMailer)
    'driver'         => getenv('MAIL_DRIVER') ?: 'stub',

    // Identidad común
    'app_name'       => getenv('APP_NAME')  ?: 'iLab TDI',
    'app_url'        => getenv('APP_URL')   ?: 'https://ilabtdi.com',
    'logo_url'       => getenv('MAIL_LOGO_URL') ?: 'https://ilabtdi.com/logos/ilabtdi-logo.png',
    'primary_color'  => getenv('MAIL_PRIMARY') ?: '#22d3ee',
    'from_email'     => getenv('MAIL_FROM_EMAIL') ?: 'no-reply@ilabtdi.com',
    'from_name'      => getenv('MAIL_FROM_NAME')  ?: 'iLab TDI',
    'reply_to'       => getenv('MAIL_REPLY_TO') ?: null,
    'support_email'  => getenv('MAIL_SUPPORT') ?: 'soporte@ilabtdi.com',

    // Resend (driver=resend) — https://resend.com
    'resend_api_key' => getenv('RESEND_API_KEY') ?: '',

    // SMTP (driver=smtp · requiere PHPMailer · ver lib/mailer.php)
    'smtp_host'      => getenv('SMTP_HOST') ?: '',
    'smtp_port'      => (int) (getenv('SMTP_PORT') ?: 587),
    'smtp_user'      => getenv('SMTP_USER') ?: '',
    'smtp_pass'      => getenv('SMTP_PASS') ?: '',
    'smtp_secure'    => getenv('SMTP_SECURE') ?: 'tls',
  ],

  // ── Debug ──────────────────────────────────────────────────
  'debug' => filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOLEAN),
];
