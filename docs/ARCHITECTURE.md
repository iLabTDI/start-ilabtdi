# Architecture · decisiones de estructura

## Filosofía

El código se organiza **por dominio** (feature-based), no por tipo (components/, pages/, hooks/, services/). La razón: cuando trabajas en auth, quieres ver todo lo de auth junto. Cuando renombras una feature o la eliminas, todo va junto.

Excepción: primitivas compartidas (`components/ui/`, `components/layout/`, `hooks/` globales) viven fuera de features porque son realmente cross-cutting.

## Capas

```
┌─────────────────────────────────────────┐
│  pages/ · componentes delgados          │  ← solo composición, 0 lógica
├─────────────────────────────────────────┤
│  features/ · dominio                    │  ← components + hooks + services + schemas
├─────────────────────────────────────────┤
│  components/ · UI compartida            │  ← ui/ + layout/ + common/
├─────────────────────────────────────────┤
│  lib/ · funciones puras                 │  ← sin side effects de UI
└─────────────────────────────────────────┘
         ↓
      Supabase (DB + Auth + Storage)
```

## Reglas

1. **`pages/` NO contiene lógica de negocio.** Solo importa de `features/` y `components/`.
2. **`features/` es autocontenida.** Si eliminas la carpeta, la app debería seguir compilando (excepto donde se importe).
3. **`components/ui/` son primitivas shadcn** sin lógica de negocio. Si una card sabe de auth, va en `features/auth/components/`.
4. **`lib/` son funciones puras.** Sin React, sin hooks. Si necesitas React, es un hook (`hooks/`).
5. **Imports siempre con `@/`**, nunca `../../../`.
6. **Un componente por archivo**, `kebab-case.tsx`, export nombrado.

## Patrón de data fetching

Cada feature con data tiene esta capa:

```
features/profile/
├── services/profile-service.ts     ← funciones "puras" contra Supabase
├── hooks/use-profile.ts            ← envuelve el service con TanStack Query
├── components/profile-form.tsx     ← consume el hook
└── types.ts                        ← tipos de dominio
```

**El service nunca sabe de React.** El hook sí.
Eso permite probar el service aisladamente y reusarlo si algún día necesitas llamarlo desde un worker o un test server-side.

## Context vs. Query

- **Context** → para estado global estable y pequeño: auth session, theme
- **TanStack Query** → para todo dato que viene del backend
- **Local state** (`useState`) → para estado de UI de un componente

Regla: si vas a meter algo en Context, pregúntate si no es mejor una query cacheada.

## Routing

React Router v7 con `createBrowserRouter` y data router.

La estructura de rutas es plana (sin nested data routes) porque este template está optimizado para SPA, no app full-stack. Si escalas a loaders/actions para SSR, puedes migrar fácil a Remix.

Protección de rutas por layout:
- `<PublicOnlyRoute />` — redirige a `/dashboard` si ya hay sesión
- `<ProtectedRoute />` — redirige a `/login?returnTo=...` si no hay sesión
- `<AppShell />` — layout autenticado con sidebar + header

## Estilos

Tailwind v4 + tokens en `@theme` (CSS variables). Modo oscuro por defecto (`<html class="dark">`) con switch light/system.

Para componentes reutilizables complejos se usa `class-variance-authority` (ver `button.tsx`).
`cn()` en `lib/utils.ts` fusiona classes con `tailwind-merge`.

## Testing

Vitest + Testing Library. Dos tipos de tests:

- **Unit** — funciones puras de `lib/`, schemas de Zod (`*.test.ts`)
- **Component** — smoke tests de componentes críticos (`*.test.tsx`)

No hay E2E en el starter. Cuando los necesites, agrega Playwright.

## Type safety

- `strict: true` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`
- Tipos de Supabase generados con la CLI
- Zod como fuente de verdad para forms → `z.infer<typeof schema>` te da el tipo gratis
- Cero `any` permitido (ESLint lo bloquea)

## Extensiones sugeridas

| Cuando necesites | Agrega |
|---|---|
| Multi-tenant | Nuevo feature `features/organizations/` + RLS con `org_id` |
| Roles | Tabla `user_roles` + columna `role` en profiles + helper `useHasRole()` |
| i18n | `i18next` + `react-i18next` + archivos en `src/locales/` |
| Emails | Supabase Edge Functions con Resend |
| Analytics | `features/analytics/` con hook `useTrack()` |
