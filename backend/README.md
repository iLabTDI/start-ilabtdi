# Backend PHP (MySQL) · iLab TDI

Backend mínimo para auth contra MySQL en GoDaddy cPanel. Se usa **solo** cuando el proyecto no puede / no quiere usar Supabase.

## Estructura

```
backend/
├── api/
│   ├── register.php      POST /api/register  → crear cuenta
│   ├── login.php         POST /api/login     → iniciar sesión
│   ├── me.php            GET  /api/me        → perfil del token actual
│   └── logout.php        POST /api/logout    → OK (JWT stateless)
├── lib/
│   ├── db.php            Conexión PDO + helper UUID
│   ├── jwt.php           JWT HS256 sin dependencias
│   ├── password.php      (bcrypt nativo de PHP — no hay archivo, se usa password_hash)
│   ├── rate-limit.php    Rate limit por IP (tabla rate_limits)
│   ├── response.php      JSON + CORS helpers
│   ├── validation.php    Validación de inputs
│   └── bootstrap.php     Carga config + conecta DB + aplica CORS
├── sql/
│   └── 001_init.sql      Schema inicial (users, refresh_tokens, rate_limits)
├── .htaccess             Routing + hardening
├── config.example.php    Plantilla de config
├── health.php            GET /api/health → estado del backend
├── index.php             404 por defecto
└── README.md
```

## Deploy

Se sube automáticamente a `/public_html/api/` con el GitHub Action del repo. No hace falta `composer install` — las libs son de PHP puro.

## Requisitos en GoDaddy

- PHP 8.1+ con extensiones `pdo_mysql`, `openssl`, `mbstring`.
- MySQL 5.7+ o MariaDB 10.3+ (ya lo viene con cPanel).
- Permitir `.htaccess` rewrites (estándar en cPanel).

## Variables de entorno

El `config.example.php` lee de `getenv(...)`. En cPanel puedes setearlas en:

- **cPanel → MultiPHP INI Editor** (variables runtime)
- O directamente hardcodeando el `config.php` generado (el script `bootstrap` lo hace por ti)

## Endpoints

### `POST /api/register`
```json
{ "email": "x@y.com", "password": "Segur@123!", "full_name": "María H." }
```
Respuesta:
```json
{ "ok": true, "user": {...}, "access_token": "eyJ...", "expires_in": 3600 }
```

### `POST /api/login`
```json
{ "email": "x@y.com", "password": "Segur@123!" }
```

### `GET /api/me`
Header: `Authorization: Bearer <access_token>`

### `POST /api/logout`
El token es stateless — el logout real lo hace el cliente descartándolo.

## Seguridad

- Passwords con `password_hash(BCRYPT, cost=12)`.
- JWT HS256 con secret de 64+ chars.
- Rate limit: 5 intentos de login / 15 min por IP+email.
- Mensajes genéricos para no filtrar existencia de usuarios.
- CORS solo para orígenes en config.
- `.htaccess` bloquea acceso directo a `lib/`, `sql/`, `config.php`, `.env*`, etc.

Ver `/docs/mysql-godaddy` dentro de la app para setup paso a paso.
