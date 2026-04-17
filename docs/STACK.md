# Stack · qué, por qué, alternativas

Este documento explica cada pieza del stack y por qué quedó fuera lo que está fuera.

## Core

| Pieza | Versión | Por qué | Alternativa descartada |
|---|---|---|---|
| **Vite** | 6 | Build rápido, HMR instantáneo, sin opiniones innecesarias | Next.js, Remix (meta-frameworks que traen más de lo que necesitamos para un SPA) |
| **React** | 19 | API estable, Server Actions opcionales, `use` hook | Preact (menos ecosystem), Solid (team curve) |
| **TypeScript** | 5.7 | Modo estricto total (`exactOptionalPropertyTypes`) | — |
| **React Router** | v7 (declarativo) | Data router con loaders/actions si los necesitas después | TanStack Router (buena opción, menor adopción) |
| **Tailwind** | v4 | Plugin nativo de Vite, `@theme` en CSS, performance brutal | styled-components, Emotion (CSS-in-JS tiene costo runtime) |
| **shadcn/ui** | new-york | Componentes tuyos, no dependencia; tipografía y sombras pulidas | Radix themes, HeroUI (menos customizable) |

## Data & forms

| Pieza | Por qué |
|---|---|
| **Supabase JS v2** | Auth + Postgres + Storage con RLS nativa |
| **TanStack Query v5** | Cache + mutations + optimistic updates |
| **React Hook Form** | Performance (reduce re-renders), ergonomía con Zod |
| **Zod** | Validación compartida (forms + env + schemas) |

## UI

| Pieza | Por qué |
|---|---|
| **Lucide** | Iconos con `strokeWidth` editable, ligeros |
| **Sonner** | Toasts minimalistas, accesibles |
| **Fraunces + Inter** | Editorial (headings serif opsz) + UI (sans geométrico) |

## Tooling

| Pieza | Por qué |
|---|---|
| **pnpm** | Instalación rápida, store único, strict dependency resolution |
| **ESLint 9** (flat config) | Último estándar, mejor tree-shaking de reglas |
| **Prettier 3 + tailwind plugin** | Orden consistente de clases |
| **Vitest 2** | Jest-compatible, usa la config de Vite |
| **Testing Library** | Tests desde la perspectiva del usuario |
| **Husky 9 + commitlint** | Evita lint breaks en CI, enforza convencional commits |

## Lo que NO está (y por qué)

- **Redux / Zustand / Jotai** — Context + TanStack Query cubren 95% de casos; cuando no, no es un starter
- **NextAuth / Clerk / Auth0** — Supabase Auth es suficiente, menos dependencias, sin vendor lock extra
- **styled-components / Emotion** — Tailwind elimina la necesidad y tiene menos overhead
- **Axios** — `fetch` + Supabase client bastan
- **Date libs** (dayjs, date-fns) — `Intl.DateTimeFormat` y `Intl.RelativeTimeFormat` nativos
- **Framer Motion** — Transitions de Tailwind + CSS bastan para el 80%. Añádelo cuando realmente lo necesites
- **Zod + class-validator juntos** — Elige uno, aquí es Zod

## Para agregar después

- **i18n** — `i18next` con `react-i18next`
- **Email transaccional** — Resend o Supabase Edge Functions
- **Analytics** — PostHog self-hosted o Plausible
- **Pagos** — Stripe (con webhooks en Edge Functions)
