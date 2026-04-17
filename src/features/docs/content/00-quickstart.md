> **TL;DR** — Elige uno de los 3 caminos, copia-pega comandos, tienes login funcional. El camino A es para ver cómo se ve; el B es el recomendado; el C si el proyecto vive 100% en el hosting del lab.

---

## Camino A · Demo · 30 segundos

**¿Quieres solo ver cómo se ve? No configures nada.**

```bash
pnpm dlx degit ilabtdi/start-ilabtdi mi-proyecto
cd mi-proyecto
pnpm install
pnpm dev
```

Abre [localhost:5173](http://localhost:5173/login) y entra con:

```
demo@ilabtdi.com  ·  Demo2026!
```

Listo. Estás dentro. No hay backend, la sesión vive en tu navegador.

---

## Camino B · Supabase real · 3 minutos

**El recomendado.** Auth + DB + Storage + realtime por 0 USD al mes (plan free).

### 1. Clona

```bash
pnpm dlx degit ilabtdi/start-ilabtdi mi-proyecto
cd mi-proyecto
pnpm install
pnpm scaffold           # quita las docs del template
```

### 2. Crea el proyecto Supabase

Entra a [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**. Espera ~1 min.

### 3. Pega 2 valores

**Project Settings → API** → copia `Project URL` y `anon public`. Pégalos en `.env`:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Corre las migraciones

Abre el **SQL Editor** de Supabase → pega el contenido de `supabase/_setup.sql` → **Run**.

(O con la CLI: `supabase link --project-ref xxxx && pnpm db:push`)

### 5. Arranca

```bash
pnpm dev
```

Ve a [localhost:5173/register](http://localhost:5173/register), crea tu cuenta, confirma el email, y ya tienes **login funcional con base de datos real**.

---

## Camino C · MySQL en GoDaddy del lab · 10 minutos

**Cuando el cliente exige que todo viva en su hosting.**

### 1. Clona + crea DB en cPanel

```bash
pnpm dlx degit ilabtdi/start-ilabtdi mi-proyecto
cd mi-proyecto
pnpm install
```

En cPanel → **MySQL Databases** → crea DB + user + asigna privilegios.

### 2. Llena credenciales en un solo archivo

```bash
cp .credentials.example.txt .credentials.txt
```

Edita con valores reales:
```
AUTH_BACKEND=php
DB_HOST=sgXXX.md.iad1.mysql
DB_NAME=usuario_ilabtdi_app
DB_USER=usuario_ilabtdi_app
DB_PASS=xxx
FTP_HOST=ftp.tudominio.com
FTP_USER=deploy@tudominio.com
FTP_PASS=xxx
```

### 3. Corre los scripts

```bash
pnpm bootstrap        # genera .env + backend/config.php + sube secrets al repo
pnpm db:setup         # aplica migraciones MySQL al hosting
pnpm scaffold         # limpia el template (docs fuera)
```

### 4. Crea un usuario admin

```bash
pnpm db:user create -e admin@tudominio.com -p "Admin@2026!" -n "Admin"
```

### 5. Arranca en local o despliega

```bash
pnpm dev              # local apuntando al MySQL remoto via /api
# — o —
git init && git add . && git commit -m "init"
git push origin main  # el Action despliega a /public_html + /public_html/api
```

Login en `https://tudominio.com/login` contra MySQL del lab.

---

## ¿Cuál elijo?

| Situación | Camino |
|---|---|
| "Solo quiero ver cómo se ve antes de decidir" | **A** (demo) |
| "Proyecto nuevo, quiero lo más rápido y robusto" | **B** (Supabase) |
| "El cliente paga el hosting GoDaddy, todo vive ahí" | **C** (MySQL) |
| "No tengo claro qué quiere el cliente" | **B** — después puedes migrar |
| "Migración de un WordPress viejo con MySQL existente" | **C** con tabla legada reusable |

> El **Camino B** (Supabase) se puede convertir en C después migrando los datos. El C hacia B también pero con más trabajo. **Si dudas, arranca en B.**

---

## Después del login: ¿qué tienes?

Un proyecto con:

- Rutas públicas: landing (`/`) + login/registro/reset (`/login`, `/register`, etc).
- Rutas protegidas tras login: `/home`, `/profile`, `/settings`.
- Header con avatar, tema claro/oscuro, logout.
- Validación de forms con Zod, password strength meter, rate limiting del lado cliente.
- Deploy automático a GoDaddy preconfigurado (`git push` → Action lo sube).
- Headers de seguridad (CSP, HSTS, XSS protection) listos.

**Ahora sí, a construir tu feature encima.** Pasa por [Personalizar el template](/docs/customizar) para poner tu marca.

---

## ¿Algo no funcionó?

| Error | Fix |
|---|---|
| `Variables de entorno inválidas` | Copia `.env.example` → `.env` y llena las keys |
| Login redirecciona infinitamente | Activa "email confirmation" en Supabase o desactívalo para dev |
| `Failed to fetch` en login | Verifica que `VITE_SUPABASE_URL` esté correcto y la DB tenga RLS configurada |
| `CORS blocked` con backend PHP | Agrega tu URL al `allowed_origins` de `backend/config.php` |
| Puerto 5173 ocupado | `pnpm dev --port 5174` (o el que quieras) |

Para más: ve a [Primeros pasos](/docs/primeros-pasos) o pregunta en el canal del lab.
