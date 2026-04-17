Esta guía es **si nunca has trabajado con un proyecto React / Node / pnpm** o si hace tiempo no lo haces. Cubre lo mínimo que tu computadora necesita y los conceptos clave para que el [Quickstart](/docs/quickstart) tenga sentido.

Si ya tienes experiencia, salta directo a [Quickstart](/docs/quickstart).

---

## Lo que necesitas instalar (una sola vez)

### 1. Node.js 20 o superior

Node es el runtime de JavaScript que necesitas para correr el proyecto.

**Opción recomendada: fnm** (administrador de versiones — te permite cambiar entre versiones de Node fácil).

```bash
# macOS con Homebrew
brew install fnm

# Windows con Scoop
scoop install fnm

# Luego instalas Node 20:
fnm install 20
fnm default 20
```

**Opción manual**: descarga el instalador de [nodejs.org](https://nodejs.org) → versión LTS.

Verifica que quedó bien:

```bash
node --version    # debe decir v20.x.x o superior
```

### 2. pnpm (gestor de paquetes)

```bash
npm i -g pnpm
```

Verifica:

```bash
pnpm --version    # debe decir 9.x.x o superior
```

> **¿Por qué pnpm en vez de npm?** Es más rápido, usa menos espacio en disco, y previene errores sutiles. El template está afinado para pnpm.

### 3. Git

Probablemente ya lo tienes. Verifica:

```bash
git --version
```

Si no: [git-scm.com/downloads](https://git-scm.com/downloads).

Configura tu identidad una sola vez:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@correo.com"
```

### 4. Un editor de código

Recomendado: **VS Code** ([descarga](https://code.visualstudio.com/)). El template incluye configuración para que al abrirlo te sugiera extensiones útiles.

Extensiones que vale la pena aceptar:

- **ESLint** — te marca errores en tiempo real
- **Prettier** — formatea el código automáticamente
- **Tailwind CSS IntelliSense** — autocompleta clases de Tailwind
- **GitLens** — ve quién cambió qué y cuándo

### 5. (Opcional) GitHub CLI

Solo si quieres automatizar cosas de GitHub desde la terminal.

```bash
brew install gh
gh auth login
```

---

## Conceptos que vas a usar

### Terminal / consola

Es donde escribes comandos. En macOS se llama **Terminal** o **iTerm**. En Windows, **Windows Terminal** o **PowerShell**. En Linux, **bash/zsh**.

Cuando veas un bloque de código con `$` al inicio:

```bash
$ pnpm install
```

Solo escribes `pnpm install` (sin el `$`) y presionas Enter.

### `pnpm install`

Lee el archivo `package.json` (que lista las dependencias del proyecto) y descarga todo en `node_modules/`. Necesario después de clonar, o cuando agregas una dependencia nueva.

### `pnpm dev`

Arranca el **dev server** — un servidor local en `http://localhost:5173` con **hot reload** (cuando cambias un archivo, la página se refresca sola).

### `pnpm build`

Compila el proyecto a archivos estáticos (HTML + JS + CSS) dentro de `dist/` — listos para subir a un hosting.

### `git clone` vs `pnpm dlx degit`

- **`git clone`** copia el repo **con toda su historia de commits**. Útil si quieres contribuir al repo original.
- **`pnpm dlx degit`** copia **solo los archivos actuales**, sin historia git. Útil para **empezar un proyecto nuevo basado en un template**.

Para usar este template en un proyecto tuyo, usa `degit`. Para contribuir al template mismo, usa `git clone`.

### Variables de entorno (`.env`)

Un archivo de texto con configuración que cambia entre desarrollo y producción (URLs de servicios, API keys, etc.). **No se commitea nunca** — está en `.gitignore`.

El template trae un `.env.example` que puedes copiar a `.env` y llenar con tus valores reales.

### `package.json` · `pnpm-lock.yaml`

- **`package.json`** — lista las dependencias y scripts del proyecto. Editable.
- **`pnpm-lock.yaml`** — snapshot exacto de las versiones instaladas. **No lo edites a mano.**

### Scripts

Los scripts del proyecto se corren con `pnpm <nombre>`. Los más usados:

```bash
pnpm dev           # dev server
pnpm build         # compilar producción
pnpm lint          # revisar errores de código
pnpm typecheck     # revisar tipos TypeScript
pnpm test          # correr tests
```

---

## Lo que el editor te va a mostrar

Al abrir el proyecto en VS Code:

- **Subrayado rojo** → error de sintaxis o de tipo. Para sobre la palabra para ver el detalle.
- **Subrayado amarillo** → advertencia (no rompe pero está mal). Ejemplo: variable no usada.
- **Archivo con punto amarillo en el explorer** → tiene cambios sin commitear.
- **Archivo tachado** → lo borraste.

Si ves errores rojos en archivos que no tocaste: corre `pnpm install` primero, luego reinicia el TypeScript server (paleta de comandos → "TypeScript: Restart TS Server").

---

## Flujo típico de un día de trabajo

```bash
# 1. Trae los cambios que otros hicieron
git pull

# 2. Asegúrate de tener las deps actualizadas
pnpm install

# 3. Arranca el dev server
pnpm dev

# 4. Haces tus cambios en el código...

# 5. Antes de commitear, valida
pnpm lint
pnpm typecheck

# 6. Commit con mensaje convencional
git add .
git commit -m "feat(auth): agrega ..."

# 7. Push a tu rama
git push
```

---

## Si algo no funciona

Tu primer recurso: **el mensaje de error**. Léelo completo. Busca la última línea que menciona un archivo tuyo (no uno de `node_modules/`).

Segundo recurso: busca el error exacto en Google o ChatGPT.

Tercero: pregunta en el canal del lab. Incluye siempre:

1. El comando que ejecutaste.
2. El error completo (copy-paste, no foto).
3. Qué esperabas que pasara.

---

## Siguiente paso

Ya tienes las herramientas. Ve al [Quickstart](/docs/quickstart) y sigue el camino que mejor te quede (demo, Supabase o MySQL).
