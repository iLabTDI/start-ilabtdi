# Contributing · convenciones del lab

## Branching

- `main` → producción. Protegida, requiere PR + approvals.
- `develop` → integración. Opcional.
- `feat/nombre-corto`, `fix/bug`, `docs/que-cambias` → feature branches

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): agrega magic link login
fix(profile): corrige error al subir avatar sin extensión
docs: actualiza guía de deploy
security: fuerza HSTS preload en .htaccess
```

Tipos permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `security`.

El hook `commit-msg` valida esto automáticamente.

## Pull Requests

1. Abre PR contra `main` (o `develop` si el lab lo usa)
2. Usa el template (se llena solo)
3. Asegura que CI pase: lint + typecheck + tests + build
4. Pide review a un colega del lab
5. Squash merge (mantén el historial limpio)

## Code style

- **Español** → UI (textos, mensajes), documentación (archivos `.md`)
- **Inglés** → código (nombres, comentarios cuando los haya)
- **Comentarios** → solo cuando expliquen el *por qué*. El *qué* lo dice el código.
- **Archivos** → `kebab-case.tsx`, un componente por archivo, export nombrado

## Antes de un PR

```bash
pnpm lint          # 0 warnings
pnpm typecheck     # 0 errors
pnpm test          # todos pasan
pnpm format        # prettier auto-fix
```

## Reportar issues

- **Bug** → usa el template `bug_report.md` con pasos para reproducir
- **Idea / mejora** → `feature_request.md`
- **Vulnerabilidad** → *no* abras issue público; contacta al mantenedor (ver abajo)

## Mantenedores

- Equipo iLab TDI · soporte@ilabtdi.com

Los mantenedores rotan cada 6 meses. La lista vigente vive en `/docs/gobernanza` dentro de la app.

## Setup de desarrollo

Ver `docs/SETUP.md`.

## Arquitectura

Antes de agregar features grandes, lee `docs/ARCHITECTURE.md`. Respeta las reglas de capas: `pages/` delgadas, `features/` autocontenidas, `lib/` pura.

## Updates de dependencias

Dependabot abre PRs cada semana. Para actualizar manualmente:

```bash
pnpm update -r
pnpm audit --prod
```

Después de upgrades mayores, revisa los CHANGELOG y corre toda la suite de tests.
