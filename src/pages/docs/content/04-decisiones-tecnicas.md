Por qué se eligió cada pieza del stack y qué se descartó. Evita investigaciones repetidas.

## Vite (no Next.js)

- **Sí Vite** — HMR instantáneo, build estándar, corre en hosting compartido (GoDaddy) sin Node en runtime.
- **No Next.js por default** — requiere Node en producción y es over-engineering para SPAs. Se usa Next solo cuando necesites SSR real o SEO crítico, y ahí dejas de usar este template.

## TypeScript (no JavaScript)

- Tipos evitan el 80% de bugs de integración y refactors inseguros.
- Modo `strict: true` + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`.
- JS solo para scripts sueltos de 20 líneas o experimentos.

## Tailwind v4 + shadcn/ui (no styled-components, no MUI)

- Cero runtime CSS-in-JS.
- `shadcn/ui` da componentes que son **tuyos** — código generado, no dependencia.
- MUI/Chakra se descartan por ser difíciles de customizar sin pelear con el sistema.

## Supabase (no Clerk, Auth0, NextAuth)

- Viene con Auth + DB + Storage + RLS nativa.
- Clerk/Auth0: $25-$100/mes por proyecto se acumula rápido.
- NextAuth: solo funciona bien con Next.

## PHP + MySQL (como alternativa a Supabase)

- Cuando el cliente exige que todo viva en GoDaddy.
- Implementado contra las credenciales del cPanel.
- Sin Composer, sin dependencias externas.
- **Supabase sigue siendo el default.**

## React Hook Form + Zod (no Formik + Yup)

- RHF: menos re-renders, mejor rendimiento.
- Zod: un solo schema se usa en forms, backend y env validation.

## Context + TanStack Query (no Redux, no Zustand)

- Cubren 95% de casos (auth, theme, data remota).
- Redux: boilerplate innecesario para la mayoría de nuestros proyectos.
- Zustand: útil para estado local complejo cuando aparezca — documenta por qué.

## pnpm (no npm, no yarn)

- Más rápido. Strict deps. Store único.

## fetch + TanStack Query (no Axios)

- `fetch` nativo + TanStack Query cubren todo. Axios ya no aporta ventaja en 2026.

## Lucide + react-icons (no FontAwesome)

- Lucide: consistencia visual, stroke-width editable, UI interna.
- react-icons: marketing/landing con logos de marca.
- FontAwesome: peso y dependencia de suscripción.

## Vitest (no Jest)

- Más rápido. Comparte config con Vite. Mismo API que Jest.

## Deploy: GoDaddy cPanel FTP/SFTP (default)

- El hosting del lab vive ahí.
- Para Next.js/SSR: Vercel.
- Para backend Node/Python: Railway / Fly.io.
- **Cloudflare siempre delante** (DNS + proxy + SSL + CDN).

---

> ¿No viste tu duda? Abre un PR a esta guía.
