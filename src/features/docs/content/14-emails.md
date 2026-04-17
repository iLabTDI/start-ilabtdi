Esta página cubre **cómo se envían los correos de confirmación, reset de contraseña y bienvenida** en el backend PHP. Si usas Supabase, este sistema no aplica — Supabase maneja los correos en su dashboard.

## Arquitectura

```
┌───────────────────────┐   ┌────────────────────┐   ┌───────────────────┐
│ endpoint PHP          │→→ │ Mailer::send()     │→→ │ driver activo     │
│ (register, forgot…)   │   │ + Templates        │   │ stub · resend · smtp
└───────────────────────┘   └────────────────────┘   └───────────────────┘
                                  │
                                  ▼
                        backend/emails/*.html
                        backend/emails/*.txt
```

## Drivers de envío

El driver se define en **`backend/config.php` → `mail.driver`**.

### `stub` (default en desarrollo)

- **No envía correos reales.**
- Cada llamada guarda el HTML en `backend/logs/mail-{timestamp}-{destinatario}.html`.
- El `subject`, `to` y `timestamp` quedan loggeados a stderr.
- **Abre el archivo HTML en tu navegador** para ver exactamente cómo se vería el correo.
- Ideal para desarrollar y probar las plantillas sin pagar nada.

```bash
# En modo stub, tras registrarte verás algo como:
backend/logs/mail-20260417-150233-maria-x-com.html
```

### `resend` (recomendado para producción)

[Resend](https://resend.com) es la opción más sencilla:

- **100 correos/día gratis, sin tarjeta**.
- API por HTTP, sin librerías externas (ya implementado con `curl` nativo de PHP).
- Excelente deliverability y dashboard para ver bounces/opens.

**Setup:**

1. Crea cuenta en [resend.com](https://resend.com).
2. **Domains → Add domain** → verifica tu dominio con los DNS que indica (SPF, DKIM).
3. **API Keys → Create** → copia la key (empieza con `re_`).
4. En `backend/config.php`:
   ```php
   'mail' => [
     'driver'         => 'resend',
     'resend_api_key' => 're_XXXXXXXXXXXX',
     'from_email'     => 'no-reply@tudominio.com',  // ¡debe ser del dominio verificado!
     'from_name'      => 'iLab TDI',
     // ...
   ],
   ```
5. Listo. El próximo registro mandará correo real.

### `smtp` (si ya tienes un servidor SMTP)

Usa PHPMailer. **Requiere** descargar PHPMailer:

```bash
# Opción Composer (si el hosting lo permite)
composer require phpmailer/phpmailer

# Opción manual: descarga phpmailer.zip de https://github.com/PHPMailer/PHPMailer
# y pega src/PHPMailer.php, src/SMTP.php, src/Exception.php en backend/vendor/phpmailer/
```

Luego en `backend/lib/mailer.php`, descomenta el bloque `// --- Descomenta cuando incluyas PHPMailer ---`.

Config mínima:

```php
'mail' => [
  'driver'      => 'smtp',
  'smtp_host'   => 'smtp.tudominio.com',   // cPanel suele dar este host
  'smtp_port'   => 587,
  'smtp_user'   => 'no-reply@tudominio.com',
  'smtp_pass'   => 'xxx',
  'smtp_secure' => 'tls',
  'from_email'  => 'no-reply@tudominio.com',
  // ...
],
```

## Los 3 correos que ya trae el template

### 1. Confirmación de cuenta · `verify-email`

- Se manda **al registrarse** (endpoint `POST /api/register`).
- Token vive **24 horas**.
- Usuario da clic → llega a `GET /verify-email?token=X` del frontend.
- Frontend llama a `POST /api/verify-email` → DB marca `email_verified_at = now()`.
- Al verificar, se manda el correo `welcome`.

### 2. Reset de contraseña · `reset-password`

- Se pide en `POST /api/forgot-password` (mandando `{ email }`).
- Siempre responde 200 (no filtra si el email existe).
- Si el email existe: token de 1 hora + correo.
- Usuario da clic → `/reset-password?token=X` en el frontend.
- Formulario llama a `POST /api/reset-password` con `{ token, password }`.

### 3. Bienvenida · `welcome`

- Se manda automático **tras confirmar el correo**.
- Opcional — es una cortesía, no bloquea nada.
- Puedes desactivarlo comentando el bloque en `backend/api/verify-email.php`.

## Editar las plantillas

Cada correo tiene **dos archivos** en `backend/emails/`:

| Plantilla | HTML | Texto plano |
|---|---|---|
| Verify | `verify-email.html` | `verify-email.txt` |
| Reset | `reset-password.html` | `reset-password.txt` |
| Welcome | `welcome.html` | `welcome.txt` |

Además hay un `layout.html` que envuelve todos los HTML (header con logo, footer).

### Variables disponibles en cualquier template

```
{{app_name}}        Nombre del producto (ej: "iLab TDI")
{{app_url}}         URL base pública (https://tudominio.com)
{{logo_url}}        URL absoluta del logo
{{primary_color}}   Hex del color de acento (ej: #22d3ee)
{{support_email}}   Email de soporte
{{subject}}         Asunto del correo
{{title}}           Título para el header
{{preheader}}       Texto de preview (oculto, visible en la lista del inbox)
{{name}}            Nombre del destinatario
{{action_url}}      URL del CTA (link de verify, reset, etc.)
```

Para agregar una variable: añádela al `vars` en el endpoint que llama a `Mailer::send()`, y referénciala en el HTML con `{{tu_variable}}`.

### Agregar un nuevo tipo de correo

1. Crea `backend/emails/mi-correo.html` y `mi-correo.txt`.
2. Desde cualquier endpoint:
   ```php
   Mailer::send([
     'to'       => $user['email'],
     'to_name'  => $user['full_name'],
     'subject'  => 'Asunto',
     'template' => 'mi-correo',
     'vars'     => ['foo' => 'bar'],
   ], $ctx->cfg);
   ```

## Buenas prácticas ya aplicadas

- **Tabla HTML** centrada 560px — compatible con Outlook, Gmail, Apple Mail.
- **Estilos inline** — muchos clientes de correo eliminan `<style>` del head.
- **Dark mode** con `@media (prefers-color-scheme: dark)` — respetado por Apple Mail / iOS 16+.
- **Bulletproof buttons** con VML para Outlook (`<!--[if mso]>`).
- **Plain text fallback** obligatorio — los filtros antispam lo usan para scoring.
- **Preheader** oculto para vista previa en el inbox.
- **Link del CTA** duplicado como texto plano abajo por si el botón falla.

## Configurar el dominio (anti-spam)

**Sin esto tu correo se va a spam.** Independiente del driver que uses:

1. **SPF** (TXT record): `v=spf1 include:_spf.resend.com ~all` (si usas Resend; para SMTP varía).
2. **DKIM**: registros que te da el proveedor.
3. **DMARC** (TXT record): `v=DMARC1; p=quarantine; rua=mailto:dmarc@tudominio.com`.

Todo esto lo configuras en el DNS (Cloudflare recomendado). Resend te muestra los registros exactos al verificar el dominio.

## Verificar que llegan

| Test | Cómo |
|---|---|
| Llega al inbox (no spam) | Prueba con Gmail, Outlook, Yahoo |
| Rinde HTML en móvil | Envíate a tu teléfono |
| Botón CTA funciona en Outlook | [Litmus.com](https://litmus.com) o [mail-tester.com](https://www.mail-tester.com) |
| SPF/DKIM/DMARC válidos | [mail-tester.com](https://www.mail-tester.com) (puntaje > 9/10) |

## Troubleshooting

| Síntoma | Causa probable |
|---|---|
| No se crean archivos en `backend/logs/` | Permisos: `chmod 775 backend/logs` |
| Gmail dice "remitente no verificado" | Falta DKIM o SPF |
| Botón CTA se ve cuadrado en Outlook | Faltan los condicionales VML |
| Textos cortados en móvil | El CSS inline no incluye `@media` en el wrapper |
| Resend responde 422 | `from_email` usa dominio no verificado |
| `token inválido` al verificar | Ya usó el link, expiró, o lo pidió desde otro usuario |

## Limpieza periódica

Los tokens usados no se borran (por auditoría). Para purgar los expirados hace más de 7 días:

```php
// en un script o cron
Tokens::gc($pdo, 7);
```
