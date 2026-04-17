# Setup · primeros 10 minutos

Guía para clonar, configurar y tener el proyecto corriendo en local.

## Requisitos

- Node **20.11+** (el repo incluye `.nvmrc`, recomendamos `fnm` o `nvm`)
- pnpm **9+** (`npm i -g pnpm`)
- Cuenta en [Supabase](https://supabase.com/) (plan free funciona)
- Git

## Pasos

### 1. Clona el repo

```bash
git clone https://github.com/ilabtdi/start-ilabtdi.git mi-proyecto
cd mi-proyecto
```

### 2. Usa la versión correcta de Node

```bash
nvm use      # o fnm use — lee .nvmrc automáticamente
```

### 3. Instala dependencias

```bash
pnpm install
```

### 4. Configura Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com/dashboard).
2. En el dashboard ve a **Project Settings → API**.
3. Copia `URL` y `anon public` key.
4. Copia `.env.example` a `.env` y pega los valores:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Aplica las migraciones

Instala la CLI de Supabase (una vez):

```bash
brew install supabase/tap/supabase
# o: npm i -g supabase
```

Enlaza el proyecto y aplica las migraciones:

```bash
supabase link --project-ref xxxxxxxx
pnpm db:push
```

> Si prefieres trabajar 100% local: `supabase start` levanta Postgres + Studio en Docker y `pnpm db:reset` aplica las migraciones locales.

### 6. Genera tipos

```bash
pnpm db:types:remote   # o pnpm db:types si usas local
```

### 7. Arranca el dev server

```bash
pnpm dev
```

Abre http://localhost:5173. Regístrate con tu correo, confirma el link que Supabase te mandó y entra al dashboard.

## Checklist para seguir

- [ ] Git init y primer commit
- [ ] Activar GitHub Actions (deploy, CI, CodeQL)
- [ ] Configurar secrets del repo (ver `docs/DEPLOY.md`)
- [ ] Revisar `docs/SECURITY.md`
- [ ] Configurar dominio en Cloudflare + GoDaddy

## Problemas comunes

| Problema | Solución |
|---|---|
| `❌ Variables de entorno inválidas` | Copia `.env.example` → `.env` y llena las vars |
| Redirect infinito en `/login` | Verifica que activaste email confirm en Supabase y confirmaste el enlace |
| Hot reload no refresca | Reinicia `pnpm dev` tras cambiar `.env` |
| Pre-commit hook falla | Corre `pnpm install` para instalar husky |
