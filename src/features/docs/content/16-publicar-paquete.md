Guía para publicar el paquete `create-ilabtdi` a npm para que cualquiera pueda usar `pnpm create ilabtdi mi-proyecto`.

---

## Qué vas a publicar

La carpeta **`packages/create-ilabtdi/`** del repo. Es un paquete independiente con zero-deps: solo un ejecutable Node 20+ que clona el template y corre el wizard.

Estructura:

```
packages/create-ilabtdi/
├── package.json          ← nombre, versión, bin
├── bin/index.mjs         ← ejecutable (zero deps)
└── README.md
```

---

## Primera publicación

### 1. Login en npm

```bash
npm login
# o si nunca has creado cuenta:
npm adduser
```

Usa tu email + username de npmjs.com.

### 2. Verifica el contenido antes de publicar

```bash
cd packages/create-ilabtdi
npm pack --dry-run
```

Te muestra qué archivos se subirían. Debe ser **`bin/`**, **`package.json`** y **`README.md`** únicamente.

### 3. Publica

```bash
cd packages/create-ilabtdi
npm publish --access public
```

`--access public` es obligatorio si tu scope es `@something/create-ilabtdi` (paquete scoped). Si el nombre es solo `create-ilabtdi` (sin scope) no lo necesitas, pero no estorba.

### 4. Verifica

```bash
npm view create-ilabtdi
```

Debería salir tu info. También puedes abrir `https://www.npmjs.com/package/create-ilabtdi`.

### 5. Prueba el comando

Desde otra carpeta:

```bash
cd ~/Desktop
pnpm create ilabtdi prueba-real
```

Debe funcionar igual que en dev.

---

## Actualizaciones posteriores

Cada vez que cambies el código del bin:

```bash
cd packages/create-ilabtdi

# Bump de versión (minor para features, patch para fixes)
npm version patch   # 0.1.0 → 0.1.1
# o: npm version minor / major

# Publica
npm publish
```

`npm version` automáticamente:

- Modifica la versión en `package.json`
- Crea un commit + tag git

Haz push después: `git push && git push --tags`.

---

## ¿Qué nombre usar?

- **`create-ilabtdi`** (sin scope) — ideal para que funcione con `pnpm create ilabtdi`. Requiere que el nombre esté libre en npm.
- **`@ilabtdi/create`** o **`@yairhdz/create-ilabtdi`** (scoped) — si `create-ilabtdi` está ocupado. Funciona con `pnpm create @ilabtdi/create ...` (más feo pero válido).

Checa disponibilidad: `npm search create-ilabtdi`

---

## Registrar el scope de organización (si lo vas a usar)

Si quieres publicar bajo `@ilabtdi/…`:

1. Entra a npmjs.com con tu cuenta.
2. **Create Organization** → nombre: `ilabtdi`.
3. Ahora puedes publicar paquetes bajo `@ilabtdi/nombre`.

Esto es útil para que múltiples paquetes del lab compartan namespace.

---

## Unpublishing (borrar versión)

⚠️ **Solo se puede dentro de las primeras 72h**. Después está bloqueado.

```bash
npm unpublish create-ilabtdi@0.1.0
```

Si necesitas "deprecar" una versión mayor de edad:

```bash
npm deprecate create-ilabtdi@0.1.0 "Usar 0.1.1+"
```

---

## Troubleshooting

| Error                                    | Solución                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `403 Forbidden`                          | Probablemente el nombre ya existe. Cambia a scoped (`@tu-scope/...`).            |
| `402 Payment Required`                   | Un paquete scoped sin `--access public` es tratado como privado. Agrega el flag. |
| `E404` al ejecutar `pnpm create ilabtdi` | El paquete no está publicado aún, o el nombre está mal escrito.                  |
| Cambios no aparecen                      | Limpia cache: `pnpm store prune` o `npm cache clean --force`.                    |

---

## CI/CD para publicar automático (opcional · avanzado)

Agrega `.github/workflows/publish.yml`:

```yaml
name: Publish create-ilabtdi

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'
      - working-directory: packages/create-ilabtdi
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Requiere `NPM_TOKEN` en Secrets del repo (genéralo en npmjs.com → Access Tokens).

---

## Cuando publiques el paquete

Actualiza:

- `README.md` del repo → confirma que `pnpm create ilabtdi` funciona.
- Landing (`src/pages/home-page.tsx`) → ya promueve el comando.
- `/docs/quickstart` → ya lo menciona como primer camino.

Todo listo para que el equipo del lab use:

```bash
pnpm create ilabtdi mi-proyecto
```
