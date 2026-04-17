Lista mínima antes de ir a producción.

## Lo que el template ya resuelve

- **CSP estricta** + HSTS + X-Frame-Options (ver `public/.htaccess`)
- **RLS activa** en todas las tablas Supabase; equivalente en MySQL vía validación server-side
- **Rate limiting** cliente (3 intentos / 30s) + server (5 intentos / 15 min)
- **Validación con Zod** en forms + server
- **Passwords** con bcrypt cost 12 (PHP) o Supabase Auth (bcrypt interno)
- **JWT** HS256 con secrets de ≥64 chars
- **Mensajes genéricos** en login (anti-enumeración)
- **Logger** redacta campos sensibles automáticamente

## Reglas no negociables

### 1. Nunca exponer la `service_role` de Supabase

Solo `anon public` va al cliente. Para privilegios elevados: Edge Function.

### 2. RLS en TODAS las tablas (Supabase)

```sql
alter table public.mi_tabla enable row level security;
alter table public.mi_tabla force row level security;
```

Policies separadas por operación (SELECT, INSERT, UPDATE, DELETE).

### 3. Validar en ambos lados

Cliente (Zod) **y** servidor (constraints SQL + RLS + Zod en endpoints).

### 4. Sin secretos en el repo

- `.env`, `.credentials.txt`, `backend/config.php` en `.gitignore`.
- Si hiciste commit con un secret por accidente: **rota la key inmediato** (no basta con `git rm`).

## Checklist pre-producción

- [ ] Email confirmation activado en Supabase (o flujo equivalente en PHP)
- [ ] Redirect URLs en Supabase incluyen el dominio real
- [ ] Headers verificados en [securityheaders.com](https://securityheaders.com) → meta: **A o A+**
- [ ] CSP probada en [csp-evaluator.withgoogle.com](https://csp-evaluator.withgoogle.com)
- [ ] Supabase → Database → Backups activos
- [ ] Cloudflare proxy activo
- [ ] `pnpm audit --prod --audit-level=high` sin findings
- [ ] Sin `dangerouslySetInnerHTML` (`rg dangerouslySetInnerHTML src/`)
- [ ] Sin `service_role` en cliente (`rg service_role src/` vacío)

## Reportar vulnerabilidades

- **Externas**: contacta al mantenedor por email privado, no issue público.
- **Internas**: issue con label `security`.
