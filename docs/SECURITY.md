# Seguridad · modelo de amenazas y prácticas

Este documento explica qué protege cada pieza, cómo se aplica y cómo extenderla.

## Modelo de amenazas cubierto

| Amenaza | Mitigación |
|---|---|
| XSS (script injection) | CSP estricta, sin `dangerouslySetInnerHTML`, `DOMPurify` helper para cuando sea necesario |
| Clickjacking | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` |
| MITM / downgrade | HTTPS forzado + HSTS (`max-age=31536000; includeSubDomains`) |
| Leak de secrets | Vars públicas solo con prefijo `VITE_`; `.env` en `.gitignore` |
| Enumeración de usuarios | Mensajes genéricos en login y reset password |
| Rate-limit brute force | Cliente: 3 intentos / 30s. Servidor: Supabase rate limits en `config.toml` |
| SQL injection | Supabase usa prepared statements + RLS por usuario |
| CSRF | JWT en Authorization header; cookies no usadas para state-change |
| Permission leaks | RLS activa + forzada en todas las tablas |
| Dependencias con CVE | Dependabot + CodeQL + `pnpm audit --prod` en CI |
| Mime sniffing | `X-Content-Type-Options: nosniff` |

## Capas

### 1. Variables de entorno

Todo acceso a `import.meta.env` pasa por `src/lib/env.ts`, que valida con Zod.
Si falta una var crítica, la app **no arranca** (en lugar de romper en runtime).

Regla de oro: **solo las vars con prefijo `VITE_` llegan al cliente**.
La `service_role` de Supabase jamás va en el cliente — si necesitas privilegios elevados, crea una Edge Function.

### 2. Headers HTTP (`public/.htaccess`)

Revisa `public/.htaccess` — los headers aplican en el hosting Apache de GoDaddy.
Puntos clave:

- **CSP** permite `script-src 'self'` sin `unsafe-eval` ni `unsafe-inline` (Vite produce bundles sin eval)
- **`style-src 'unsafe-inline'`** se mantiene solo por los inline styles que Radix inyecta para posicionamiento. Si eliminaras Radix podrías quitarlo.
- **`connect-src`** solo permite tu dominio + `*.supabase.co`
- **`font-src`** incluye Google Fonts. Si migras a fuentes self-hosted puedes restringirlo a `'self'`.

### 3. Row Level Security (Supabase)

Cada tabla tiene RLS **activada y forzada** (`force row level security`). Las policies están separadas por operación (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) para que sean fáciles de auditar.

La tabla `profiles`:

- Un usuario solo puede `SELECT` su propio perfil
- Solo puede `UPDATE` su propio perfil (con `with check` que valida también después del update)
- No hay `INSERT` manual — lo hace el trigger `handle_new_user` con `SECURITY DEFINER` y `search_path` fijado (protege contra [CVE-2018-1058](https://www.postgresql.org/support/security/CVE-2018-1058/))

### 4. Autenticación

- **PKCE flow** (no implicit) — más seguro, permite refresh sin exponer el token largo
- **Refresh rotation** activa en Supabase
- **Logout global** (`scope: 'global'`) revoca todas las sesiones del usuario
- **Rate limit cliente** con cooldown de 30s después de 3 intentos
- **Password policy**: 10 caracteres, mayús, minús, número, símbolo
- **Mensajes genéricos** en login/reset (no filtramos si el email existe)

### 5. Validación de inputs

Siempre en dos capas:

1. **Cliente** — Zod en forms (`src/features/*/schemas/`)
2. **Servidor** — constraints SQL + RLS

Nunca asumas que el cliente validó. Incluso con RLS, añade `CHECK` constraints en columnas críticas (longitud, formato).

### 6. Sanitización de HTML

El template **no renderiza HTML user-generated** por defecto.
Si en el futuro lo necesitas (ej. rich text en un post), usa `sanitizeHtml()` de `src/lib/security.ts`. Nunca uses `dangerouslySetInnerHTML` sin pasar por esa función.

### 7. Logging

`src/lib/logger.ts` redacta automáticamente campos sensibles (password, token, api_key, etc.) y **silencia `debug`/`info` en producción**. Usa `logger.error()` para errores que necesites ver en Sentry, `logger.warn()` para cosas raras.

### 8. Pipeline de seguridad

| Check | Frecuencia | Archivo |
|---|---|---|
| CodeQL | Cada PR + weekly | `.github/workflows/codeql.yml` |
| Dependabot | Semanal | `.github/dependabot.yml` |
| `pnpm audit --prod` | Cada push | `.github/workflows/ci.yml` |
| Secret scanning | Siempre (GitHub) | automático en repos públicos |

## Checklist antes de producción

- [ ] `.env` real nunca commiteado (confirma con `git log --all -- .env`)
- [ ] Activar email confirmation en Supabase Auth
- [ ] Configurar `additional_redirect_urls` en Supabase (tu dominio real, no solo localhost)
- [ ] Revisar policies RLS con `supabase inspect db bloat` y `supabase inspect db index-usage`
- [ ] Headers de `.htaccess` verificables con https://securityheaders.com → A mínimo
- [ ] CSP testeada con https://csp-evaluator.withgoogle.com/
- [ ] Dominio con Cloudflare proxy activado
- [ ] Supabase → **Database → Backups** activo
- [ ] Rate limits revisados en `supabase/config.toml`
- [ ] `pnpm audit --prod --audit-level=high` sin findings

## Cómo extender

**¿Agregaste una nueva tabla?**

1. Crea migración con `CREATE TABLE` + constraints
2. Crea migración de RLS con policies separadas
3. Regenera tipos (`pnpm db:types:remote`)
4. Nunca accedas directo al cliente admin — siempre via `supabase` con RLS

**¿Necesitas webhooks / privilegios elevados?**

Usa Supabase Edge Functions. Nunca expongas la `service_role` en el cliente, ni siquiera detrás de un proxy.

**¿Formulario con rich text?**

Renderiza solo a través de `sanitizeHtml()`. Si aceptas HTML del usuario, guárdalo ya sanitizado.

## Reportar vulnerabilidades

Contacta privadamente al mantenedor del lab (ver `docs/CONTRIBUTING.md`). No abras issues públicos con detalles de explotación.
