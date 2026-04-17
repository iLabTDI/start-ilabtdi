## ¿Cuándo usar este camino?

El default del lab es **Supabase** porque es más rápido y seguro. Pero a veces no aplica:

- El cliente exige que todo viva en su hosting de GoDaddy (contrato, compliance, costos).
- No se quiere depender de un tercer servicio.
- Ya hay una base MySQL en el cPanel que hay que aprovechar.

En esos casos, el template trae un **backend PHP mínimo** (`backend/`) que replica auth contra MySQL. El frontend flipea via `VITE_AUTH_BACKEND=php`.

### Por qué sí
- Todo vive en el mismo hosting → un solo contrato.
- MySQL + PHP vienen incluidos en cPanel; no hay que contratar servicios nuevos.
- Sin vendor lock-in a Supabase.

### Por qué no (cuándo NO tomar este camino)
- Más código que mantener (bcrypt, JWT, rate limit… tú los cuidas).
- GoDaddy shared hosting es lento para DB con carga real.
- No tienes realtime, Storage, Edge Functions — tocaría construirlos.
- Para volver atrás implicaría migrar los datos.

## Preparar MySQL en cPanel

### 1. Crear la base de datos

cPanel → **MySQL Databases**:

1. En **Create New Database** → `ilabtdi_app` → Create.
2. En **MySQL Users → Add New User** → `ilabtdi_app` + password fuerte.
3. En **Add User To Database** → selecciona el user y la DB → **ALL PRIVILEGES**.

Anota:

- **DB_HOST**: por lo general `localhost` dentro del hosting. Para conexión remota, GoDaddy te da un host del tipo `sgXXX.md.iad1.mysql`.
- **DB_NAME**: `usuario_ilabtdi_app` (cPanel antepone el prefijo del cPanel user).
- **DB_USER**: `usuario_ilabtdi_app`.
- **DB_PASS**: la password que creaste.

### 2. (Opcional) Habilitar MySQL remoto

Si quieres correr `pnpm db:setup` desde tu laptop:

cPanel → **Remote MySQL** → agrega tu IP pública (o `%` si tu IP es dinámica, aunque menos seguro).

Si prefieres **no abrir MySQL al mundo**, usa el SSH tunnel automático del script:

```bash
# en .credentials.txt
DB_HOST=localhost
SSH_HOST=tudominio.com
SSH_USER=tucuser
SSH_KEY_PATH=~/.ssh/id_ed25519
```

Con eso `pnpm db:setup` abre un tunnel, aplica las migraciones, y lo cierra.

## Aplicar las migraciones

```bash
# 1. Copia credenciales
cp .credentials.example.txt .credentials.txt
# → llena DB_HOST, DB_NAME, DB_USER, DB_PASS, SSH_*, etc.

# 2. Genera .env + backend/config.php
pnpm bootstrap

# 3. Crea las tablas en el MySQL remoto
pnpm db:setup
```

Eso crea en tu MySQL:

- `users` — email, password_hash (bcrypt), full_name, avatar_url, timestamps
- `refresh_tokens` — scaffolding para sesiones persistentes (si luego las implementas)
- `rate_limits` — control de brute force server-side

## Crear usuarios manualmente

```bash
# Crear
pnpm db:user create -e maria@ilabtdi.com -p "Pass@2026!" -n "María H."

# Listar
pnpm db:user list

# Resetear password
pnpm db:user reset -e maria@ilabtdi.com -p "NuevaPass@2026!"

# Borrar
pnpm db:user delete -e maria@ilabtdi.com
```

## Desplegar el backend PHP

El GitHub Action detecta `VITE_AUTH_BACKEND=php` (variable del repo) y:

1. Genera `backend/config.php` en el runner con los secrets de MySQL + JWT.
2. Sube `dist/` a `/public_html/`.
3. Sube `backend/` a `/public_html/api/`.

Tu app queda servida en `https://tudominio.com` y los endpoints en `https://tudominio.com/api/login` · `/api/register` · `/api/me` · `/api/logout`.

### Secrets requeridos en GitHub

Además de los de FTP:

| Secret | Valor |
|---|---|
| `DB_HOST` | host MySQL (el que te dio cPanel para remote, o `localhost` si aplica dentro del hosting) |
| `DB_NAME` | nombre completo (con prefijo cPanel) |
| `DB_USER` | usuario MySQL |
| `DB_PASS` | password MySQL |
| `JWT_SECRET` | `openssl rand -hex 64` |

Variable del repo (Actions → Variables):

| Variable | Valor |
|---|---|
| `VITE_AUTH_BACKEND` | `php` |

## Endpoints disponibles

```
POST /api/register                { email, password, full_name }
POST /api/login                   { email, password }
GET  /api/me                      Authorization: Bearer <token>
POST /api/logout
POST /api/verify-email            { token }
POST /api/forgot-password         { email }
POST /api/reset-password          { token, password }
POST /api/resend-verification     { email }
GET  /api/health                  (ping de healthcheck)
```

Los 4 endpoints con correo (verify, forgot, reset, resend) mandan correos
transaccionales usando el mailer configurable. Ver [Correos transaccionales](/docs/emails).

Respuesta estándar:

```json
{ "ok": true, "user": {...}, "access_token": "eyJ...", "expires_in": 3600 }
```

En error:

```json
{ "ok": false, "error": "Credenciales inválidas." }
```

## Seguridad del backend PHP

Lo que ya trae resuelto:

- **bcrypt cost 12** — passwords se re-hashean si subes el cost.
- **JWT HS256** — token de 1 hora, sin refresh persistente (pon uno si lo necesitas).
- **Rate limit** — 5 intentos de login por IP+email cada 15 min (tabla `rate_limits`).
- **Mensajes genéricos** — no filtramos si el email existe.
- **CORS explícito** — solo orígenes en config.
- **.htaccess** — bloquea acceso a `lib/`, `sql/`, `config.php`, `.env*`, dotfiles.

Revisa `/docs/seguridad` para el checklist pre-producción — aplica igual que con Supabase.

## Troubleshooting

| Síntoma | Causa probable |
|---|---|
| `SQLSTATE[HY000] [1045] Access denied` | Usuario/password incorrecto o no asociado a la DB |
| `Connection refused` en `db:setup` | No habilitaste Remote MySQL (o la IP cambió) |
| `CORS blocked` al hacer login desde el frontend | Agrega tu `APP_URL` a `cors.allowed_origins` en `config.php` |
| JWT inválido después de redeploy | Cambiaste `JWT_SECRET` — cada deploy invalida sesiones anteriores |
| `.htaccess` no funciona | Verifica que `AllowOverride All` esté activo en el hosting |
