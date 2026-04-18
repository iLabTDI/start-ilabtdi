# create-ilabtdi

Arrancador oficial de proyectos para el **iLab TDI**. Un comando, tu proyecto listo.

```bash
pnpm create ilabtdi mi-proyecto
```

Equivalente con otros gestores:

```bash
npm  create ilabtdi@latest mi-proyecto
yarn create ilabtdi mi-proyecto
```

## ¿Qué hace?

1. Clona el template `iLabTDI/start-ilabtdi` en una carpeta nueva (sin historia git).
2. Ajusta `package.json` con tu nombre de proyecto.
3. Corre `pnpm install`.
4. Abre el wizard interactivo (`pnpm bootstrap`) que configura:
   - Branding (nombre, URL pública)
   - Backend (Supabase / MySQL en GoDaddy / Demo)
   - Credenciales del hosting FTP
   - Secrets del repo en GitHub (opcional)
5. (Opcional) Elimina la documentación del template para que tu proyecto quede limpio.

## Flags

```bash
pnpm create ilabtdi mi-proyecto --force            # sobrescribe carpeta si existe
pnpm create ilabtdi mi-proyecto --skip-install     # no corre pnpm install
pnpm create ilabtdi mi-proyecto --skip-bootstrap   # no abre el wizard
```

## Requisitos

- **Node.js 20.11+**
- **pnpm 9+** (`npm i -g pnpm`)
- **Git** instalado (para clonar el template)

## Después de crear el proyecto

```bash
cd mi-proyecto
pnpm dev
```

Abre http://localhost:5173. Si elegiste modo demo, entra con `demo@ilabtdi.com` / `Demo2026!`.

## Documentación

Guía completa en **[template.ilabtdi.com](https://template.ilabtdi.com)**.

## License

MIT © [Yair Hernández](https://github.com/yairhdz24)
