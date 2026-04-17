<?php
declare(strict_types=1);

require_once __DIR__ . '/templates.php';

/**
 * Mailer con 3 drivers intercambiables por config:
 *
 *   - 'stub'   → escribe el email a backend/logs/mail-*.html y lo loguea.
 *                Default en desarrollo. No envía nada real.
 *   - 'resend' → POST a Resend API (api.resend.com/emails) vía fetch.
 *                Recomendado para producción — 100 emails/día free.
 *   - 'smtp'   → delega a PHPMailer o a la función nativa mail().
 *                Stub implementado — descomenta el flujo SMTP real cuando
 *                tengas credenciales del servidor SMTP de cPanel.
 *
 * Uso:
 *   Mailer::send([
 *     'to'       => 'destinatario@x.com',
 *     'to_name'  => 'María H',
 *     'subject'  => 'Confirma tu correo',
 *     'template' => 'verify-email',    // busca verify-email.html y .txt
 *     'vars'     => [
 *       'name'       => 'María',
 *       'action_url' => 'https://…',
 *       'preheader'  => 'Confirma tu correo en 1 clic',
 *     ],
 *   ], $cfg);
 */
final class Mailer {
  public static function send(array $payload, array $cfg): bool {
    $vars = self::withDefaults($payload['vars'] ?? [], $cfg, $payload['subject']);

    $html = Templates::renderEmailHtml($payload['template'], $vars);
    $text = Templates::renderEmailText($payload['template'], $vars);

    $email = [
      'to'       => $payload['to'],
      'to_name'  => $payload['to_name'] ?? '',
      'from'     => $cfg['mail']['from_email'] ?? 'no-reply@localhost',
      'from_name'=> $cfg['mail']['from_name']  ?? 'iLab TDI',
      'reply_to' => $cfg['mail']['reply_to']   ?? null,
      'subject'  => $payload['subject'],
      'html'     => $html,
      'text'     => $text,
    ];

    $driver = strtolower($cfg['mail']['driver'] ?? 'stub');

    return match ($driver) {
      'resend' => self::sendResend($email, $cfg),
      'smtp'   => self::sendSmtp($email, $cfg),
      default  => self::sendStub($email),
    };
  }

  private static function withDefaults(array $vars, array $cfg, string $subject): array {
    return array_merge([
      'app_name'      => $cfg['mail']['app_name']      ?? 'iLab TDI',
      'app_url'       => $cfg['mail']['app_url']       ?? ($cfg['cors']['allowed_origins'][0] ?? ''),
      'logo_url'      => $cfg['mail']['logo_url']      ?? '',
      'primary_color' => $cfg['mail']['primary_color'] ?? '#22d3ee',
      'support_email' => $cfg['mail']['support_email'] ?? '',
      'preheader'     => '',
      'subject'       => $subject,
      'title'         => $subject,
    ], $vars);
  }

  /**
   * Driver stub: escribe el email en backend/logs/ y lo loguea a stderr.
   * En dev, abres el .html en tu navegador para ver cómo se ve.
   */
  private static function sendStub(array $email): bool {
    $dir = __DIR__ . '/../logs';
    if (!is_dir($dir)) mkdir($dir, 0775, true);

    $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($email['to']));
    $ts   = date('Ymd-His');
    $file = "{$dir}/mail-{$ts}-{$slug}.html";

    $banner = sprintf(
      '<!-- STUB MAILER · %s · to: %s · subject: %s -->',
      $ts,
      htmlspecialchars($email['to'], ENT_QUOTES),
      htmlspecialchars($email['subject'], ENT_QUOTES)
    );

    file_put_contents($file, $banner . "\n" . $email['html']);

    error_log(sprintf(
      '[mailer:stub] to=%s subject=%s · saved to %s',
      $email['to'], $email['subject'], $file
    ));

    return true;
  }

  /**
   * Driver Resend — https://resend.com/docs/api-reference/emails/send-email
   *
   * Requiere en config['mail']:
   *   driver         = 'resend'
   *   resend_api_key = 're_xxx'
   *   from_email     = 'no-reply@tudominio.com' (con dominio verificado)
   */
  private static function sendResend(array $email, array $cfg): bool {
    $apiKey = $cfg['mail']['resend_api_key'] ?? '';
    if ($apiKey === '') {
      error_log('[mailer:resend] api_key vacío — usando stub como fallback');
      return self::sendStub($email);
    }

    $from = $email['from_name']
      ? sprintf('%s <%s>', $email['from_name'], $email['from'])
      : $email['from'];

    $to = $email['to_name']
      ? sprintf('%s <%s>', $email['to_name'], $email['to'])
      : $email['to'];

    $body = [
      'from'    => $from,
      'to'      => [$to],
      'subject' => $email['subject'],
      'html'    => $email['html'],
      'text'    => $email['text'],
    ];
    if (!empty($email['reply_to'])) {
      $body['reply_to'] = $email['reply_to'];
    }

    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
      CURLOPT_POST           => true,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT        => 15,
      CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
      ],
      CURLOPT_POSTFIELDS     => json_encode($body),
    ]);
    $response = curl_exec($ch);
    $status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($status >= 200 && $status < 300) {
      return true;
    }

    error_log(sprintf(
      '[mailer:resend] HTTP %d · %s',
      $status,
      is_string($response) ? substr($response, 0, 400) : 'empty'
    ));
    return false;
  }

  /**
   * Driver SMTP — placeholder.
   *
   * Para activarlo:
   *   1. Baja PHPMailer: `composer require phpmailer/phpmailer` o incluye
   *      manualmente src/PHPMailer.php, src/SMTP.php, src/Exception.php.
   *   2. Configura en config['mail']: smtp_host, smtp_port, smtp_user,
   *      smtp_pass, smtp_secure ('tls'|'ssl').
   *   3. Descomenta el bloque de abajo.
   */
  private static function sendSmtp(array $email, array $cfg): bool {
    error_log('[mailer:smtp] driver no activo — revisa lib/mailer.php sendSmtp()');
    return self::sendStub($email);

    // --- Descomenta cuando incluyas PHPMailer --------------------------
    // $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    // try {
    //   $mail->isSMTP();
    //   $mail->Host       = $cfg['mail']['smtp_host'];
    //   $mail->Port       = (int) $cfg['mail']['smtp_port'];
    //   $mail->SMTPAuth   = true;
    //   $mail->Username   = $cfg['mail']['smtp_user'];
    //   $mail->Password   = $cfg['mail']['smtp_pass'];
    //   $mail->SMTPSecure = $cfg['mail']['smtp_secure'] ?? 'tls';
    //   $mail->CharSet    = 'UTF-8';
    //
    //   $mail->setFrom($email['from'], $email['from_name']);
    //   $mail->addAddress($email['to'], $email['to_name']);
    //   if (!empty($email['reply_to'])) $mail->addReplyTo($email['reply_to']);
    //
    //   $mail->isHTML(true);
    //   $mail->Subject = $email['subject'];
    //   $mail->Body    = $email['html'];
    //   $mail->AltBody = $email['text'];
    //
    //   return $mail->send();
    // } catch (\Throwable $e) {
    //   error_log('[mailer:smtp] ' . $e->getMessage());
    //   return false;
    // }
  }
}
