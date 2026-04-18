<div align="center">

<img src="public/logos/ilabtdi-logo.png" width="120" alt="iLab TDI" />

# Start-Ilabtdi

### Plantilla oficial del **iLab TDI** · Login funcional en 5 minutos

<p>
  <a href="https://github.com/iLabTDI/start-ilabtdi/actions"><img src="https://img.shields.io/github/actions/workflow/status/iLabTDI/start-ilabtdi/ci.yml?label=CI&style=for-the-badge&logo=github" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22d3ee?style=for-the-badge" alt="MIT" /></a>
  <img src="https://img.shields.io/badge/built_by-yairhdz24-0891b2?style=for-the-badge&logo=github" alt="Built by Yair" />
</p>

<p>
  <img src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06b6d4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ecf8e?logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/PHP%20%2B%20MySQL-777bb4?logo=php&logoColor=white" />
</p>

<p>
  <b>Clona · Pega 2 keys · Despliega.</b><br/>
  Auth, base de datos, seguridad y deploy a GoDaddy — resueltos de fábrica.
</p>

<p>
  <a href="#-quickstart">Quickstart</a> ·
  <a href="#-qué-trae-incluido">Qué trae</a> ·
  <a href="#-stack">Stack</a> ·
  <a href="#-comandos">Comandos</a> ·
  <a href="#-docs">Docs</a> ·
  <a href="#-faq">FAQ</a>
</p>

</div>

---

## ¿Por qué existe?

Una encuesta interna al equipo del **iLab TDI** identificó dos dolores recurrentes al arrancar un proyecto web:

1. **Configuración inicial** — estructura, dependencias, decisiones técnicas.
2. **Despliegue a GoDaddy** — cPanel, FTP, SSL, rutas, cache.

Este template ataca ambos. Trae todo decidido, todo conectado, todo documentado.

---

## 🚀 Quickstart

**Un solo comando.** Te pregunta todo y deja el proyecto listo.

```bash
pnpm create ilabtdi mi-proyecto
```

Equivalentes con otros gestores:

```bash
npm  create ilabtdi@latest mi-proyecto
yarn create ilabtdi mi-proyecto
```

Qué hace:

1. Descarga el template en `./mi-proyecto/`
2. `pnpm install`
3. Abre el **wizard interactivo**: nombre, backend (Supabase / MySQL / Demo), keys, FTP, GitHub
4. Genera `.env`, `backend/config.php` (si PHP) y sube secrets al repo
5. (Opcional) Elimina la docs del template para que tu proyecto quede limpio

Luego:

```bash
cd mi-proyecto
pnpm dev
```

Y estás dentro. Si elegiste modo demo, entra con `demo@ilabtdi.com` / `Demo2026!`.

---

## ✨ Qué trae incluido

<table>
<tr>
<td width="50%">

### 🎨 UI y experiencia

- Landing pública + login / registro / reset password
- Tema claro/oscuro con persistencia
- Dark mode editorial con Tailwind v4
- shadcn/ui + componentes accesibles
- Responsive · mobile-first con care
- Iconos react-icons + Lucide

### 🔐 Auth completo

- Supabase Auth (default, recomendado)
- **O** backend PHP propio contra MySQL
- Modo demo con cuentas hardcodeadas
- Email verification + reset password
- Rate limiting cliente + servidor
- Password strength meter

</td>
<td width="50%">

### 🚢 Deploy automático

- GitHub Action que sube a cPanel
- FTP/SFTP + .htaccess endurecido
- Cache inmutable + compresión gzip
- SPA routing en producción
- CodeQL + Dependabot + CI

### 🛡️ Seguridad por default

- CSP + HSTS + X-Frame-Options
- RLS activa en Supabase
- Validación con Zod
- JWT HS256 + bcrypt cost 12
- Secrets fuera del repo (gitignored)
- Checklist OWASP cubierto

### 📧 Correos transaccionales

- Confirmación de cuenta, reset, welcome
- 3 drivers: stub (dev) · Resend · SMTP
- Templates HTML dark-mode compatibles

</td>
</tr>
</table>

---

## 🧰 Stack

| Capa            | Tecnología                                   |
| --------------- | -------------------------------------------- |
| **Build**       | Vite 6 + plugin React SWC                    |
| **UI**          | React 19 + TypeScript 5.7 estricto           |
| **Estilos**     | Tailwind v4 (plugin Vite nativo) + shadcn/ui |
| **Routing**     | React Router v7 (data router)                |
| **Data**        | Supabase JS v2 + TanStack Query v5           |
| **Backend alt** | PHP 8.1+ contra MySQL (opcional)             |
| **Forms**       | React Hook Form + Zod                        |
| **Iconos**      | Lucide (UI) · react-icons (marketing)        |
| **Tests**       | Vitest + Testing Library                     |
| **Tooling**     | pnpm · ESLint 9 · Prettier 3 · Husky 9       |
| **CI/CD**       | GitHub Actions · Dependabot · CodeQL         |
| **Deploy**      | FTP/SFTP a GoDaddy cPanel                    |

> **¿Por qué sí / por qué no cada pieza?** Ver [`/docs/decisiones-tecnicas`](https://template.ilabtdi.com/docs/decisiones-tecnicas)

---

## 📦 Comandos

### Setup y desarrollo

| Comando                        | Qué hace                                                       |
| ------------------------------ | -------------------------------------------------------------- |
| `pnpm create ilabtdi <nombre>` | **Crea un proyecto nuevo** — desde cualquier carpeta           |
| `pnpm bootstrap`               | Wizard para (re)configurar env, backend y secrets del proyecto |
| `pnpm dev`                     | Dev server en `:5173`                                          |
| `pnpm build`                   | Typecheck + build de producción                                |
| `pnpm preview`                 | Sirve el build en `:4173`                                      |

### Calidad

| Comando           | Qué hace                                |
| ----------------- | --------------------------------------- |
| `pnpm lint`       | ESLint con max-warnings 0               |
| `pnpm typecheck`  | `tsc --noEmit`                          |
| `pnpm test`       | Vitest run                              |
| `pnpm audit:prod` | Auditoría de seguridad (solo prod deps) |

### Base de datos

| Comando                                     | Qué hace                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| `pnpm db:push`                              | Aplica migraciones a Supabase enlazado                |
| `pnpm db:setup`                             | Aplica SQL al MySQL remoto (con SSH tunnel si aplica) |
| `pnpm db:user create -e x@y.com -p Pass@1!` | Crea usuario con bcrypt                               |
| `pnpm db:user list / reset / delete`        | CRUD rápido de usuarios                               |

---

## 🗂️ Estructura

```
Start-Ilabtdi/
├── backend/              # Backend PHP opcional (MySQL)
│   ├── api/              # register · login · verify-email · reset · …
│   ├── emails/           # Templates HTML transaccionales
│   ├── lib/              # PDO · JWT · bcrypt · rate-limit · mailer
│   └── sql/              # Migraciones MySQL
├── scripts/              # bootstrap · scaffold · db:setup · db:user
├── supabase/             # Migraciones + config local
├── public/               # .htaccess + logos + fonts
├── src/
│   ├── app/              # Entry + router + providers + error boundary
│   ├── config/           # brand · site · nav · theme (editable)
│   ├── features/
│   │   ├── auth/         # Login, registro, reset, contexto, schemas
│   │   ├── docs/         # Sistema de documentación en-app
│   │   └── profile/      # Perfil de usuario
│   ├── components/       # ui/ (shadcn) · layout/ · common/
│   ├── pages/            # Componentes delgados de página
│   ├── lib/              # env · supabase · logger · security · utils
│   └── styles/           # globals.css (Tailwind v4 @theme)
└── .github/workflows/    # CI · deploy-godaddy · CodeQL
```

---

## 🎨 Personalizar

Todo el branding (nombre, logo, colores, fuente) vive en **`src/config/brand.ts`**:

```ts
export const brand = {
  name: 'Mi Proyecto',
  longName: 'Mi Proyecto S.A.',
  tagline: 'Una frase que describe tu producto.',
  logoPath: '/logos/mi-logo.png',
  accentColor: 'cyan',
  defaultTheme: 'dark',
};
```

Cambia eso, reemplaza el PNG en `public/logos/`, y el header, footer, login, home, docs — todo se actualiza.

Guía completa: [`/docs/customizar`](https://template.ilabtdi.com/docs/customizar)

---

## 🚢 Deploy a GoDaddy

1. En cPanel crea un usuario FTP dedicado
2. `pnpm bootstrap` sube los secrets al repo
3. `git push origin main` → el Action builda y sube a `/public_html/`

Guía paso a paso: [`/docs/deploy`](https://template.ilabtdi.com/docs/deploy)

---

## 📚 Docs

Toda la documentación vive en el deploy oficial del template — no se baja con tu proyecto:

👉 **[template.ilabtdi.com/docs](https://template.ilabtdi.com/docs)**

| Guía                                                                         | Para qué                             |
| ---------------------------------------------------------------------------- | ------------------------------------ |
| [Login funcional en 5 min](https://template.ilabtdi.com/docs/quickstart)     | Los 3 caminos para arrancar          |
| [Primeros pasos](https://template.ilabtdi.com/docs/primeros-pasos)           | Para quien nunca ha usado Node/React |
| [Decisiones técnicas](https://template.ilabtdi.com/docs/decisiones-tecnicas) | Por qué sí / por qué no cada pieza   |
| [Personalizar](https://template.ilabtdi.com/docs/customizar)                 | Logo, colores, fuente                |
| [MySQL en GoDaddy](https://template.ilabtdi.com/docs/mysql-godaddy)          | Alternativa al Supabase              |
| [Correos transaccionales](https://template.ilabtdi.com/docs/emails)          | Verify, reset, welcome               |
| [Subir a GitHub](https://template.ilabtdi.com/docs/subir-a-github)           | Paso a paso desde cero               |
| [Deploy a GoDaddy](https://template.ilabtdi.com/docs/deploy)                 | GitHub Actions + FTP                 |
| [Seguridad](https://template.ilabtdi.com/docs/seguridad)                     | Checklist pre-producción             |

---

## ❓ FAQ

<details>
<summary><b>¿Por qué no Next.js?</b></summary>

Un SPA clásico sobre Vite es suficiente para el 90% de proyectos del lab, carga más rápido en hosting compartido (GoDaddy) y no requiere Node en runtime. Si necesitas SSR real, migras a Next — y ahí dejas de usar este template.

</details>

<details>
<summary><b>¿Puedo usar esto para un proyecto comercial?</b></summary>

Sí, licencia MIT. Úsalo para lo que quieras, modifícalo, revéndelo. Solo conserva la atribución al proyecto original.

</details>

<details>
<summary><b>¿Puedo cambiar GoDaddy por Vercel/Netlify?</b></summary>

Sí. El build es Vite estándar. Borra `deploy-godaddy.yml`, conecta el repo en Vercel, configura las mismas env vars. Cero cambios en el código.

</details>

<details>
<summary><b>¿Cuándo usar Supabase vs MySQL del hosting?</b></summary>

**Supabase** por default — más rápido, auth + storage + realtime incluidos, escala mejor.

**MySQL del hosting** cuando el cliente exige que todo viva en su GoDaddy, o por razones de compliance/contrato. Ambos caminos están implementados.

</details>

<details>
<summary><b>¿Cómo agrego un nuevo feature?</b></summary>

Crea `src/features/mi-feature/` con subcarpetas (`components/`, `hooks/`, `services/`, `schemas/`). La arquitectura es feature-based.

</details>

<details>
<summary><b>Perdí el .env — ¿qué hago?</b></summary>

Corre `pnpm bootstrap` de nuevo y lo regeneras. Si tienes `.credentials.txt` lleno, pasa `--non-interactive` y lo vuelve a generar sin preguntar.

</details>

<details>
<summary><b>¿Qué hago si Supabase me pone rate-limit?</b></summary>

Los límites de `supabase/config.toml` son para desarrollo local. En producción los manejas en Dashboard → Auth → Rate Limits.

</details>

---

## 🤝 Contribuir

PRs bienvenidos. Para cambios grandes, abre un issue antes.

Regla del lab: los cambios mayores de stack requieren aprobación de 2 maintainers. Ver [`CONTRIBUTING.md`](docs/CONTRIBUTING.md).

```bash
# Setup para contribuir
git clone https://github.com/iLabTDI/start-ilabtdi.git
cd start-ilabtdi
pnpm install
pnpm dev
```

---

## 📝 License

MIT © [iLab TDI](https://ilabtdi.com)

Plantilla diseñada y desarrollada por **[Yair Hernández](https://github.com/yairhdz24)** para el equipo del lab.

<div align="center">

<br/>

[**← Ver proyecto en vivo**](https://template.ilabtdi.com) · [Documentación](https://template.ilabtdi.com/docs) · [Issues](https://github.com/iLabTDI/start-ilabtdi/issues) · [Discussions](https://github.com/iLabTDI/start-ilabtdi/discussions)

<br/>

Si te sirvió el template, dale una ⭐ al repo.

</div>
