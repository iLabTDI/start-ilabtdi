Publicación automática del paquete `create-ilabtdi` a npm mediante GitHub Actions. Cero comandos manuales.

---

## Cómo funciona

El workflow `.github/workflows/publish-npm.yml` se dispara cada vez que pusheas cambios en `packages/create-ilabtdi/` a `main`.

Decide solo qué hacer:

- **La versión local ≠ publicada** → publica directo (tú bumpeaste manualmente en `package.json`).
- **La versión local = publicada** → bumpea `patch` automáticamente, commitea el bump, publica.

Después de eso, cualquiera puede correr:

```bash
pnpm create ilabtdi@latest mi-proyecto
```

Y recibe la última versión.

---

## Setup · una sola vez

### 1. Crear NPM_TOKEN con bypass 2FA

1. Ve a [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens).
2. **Generate New Token → Granular Access Token**.
3. Configúralo así:
   - **Name**: `github-actions-create-ilabtdi`
   - **Expiration**: 90 días (o más, según preferencia).
   - **Allow 2FA bypass**: marca esta casilla — esencial para que el Action funcione sin OTP.
   - **Packages and scopes**: selecciona `Only select packages` → `create-ilabtdi`.
   - **Permissions**: **Read and write**.
4. Copia el token (empieza con `npm_...`).

### 2. Guardarlo en GitHub

En tu repo:

**Settings → Secrets and variables → Actions → New repository secret**

- **Name**: `NPM_TOKEN`
- **Value**: el token que acabas de copiar

Listo. El workflow ya puede publicar.

---

## Flujo de trabajo diario

```bash
# 1. Cambias algo en packages/create-ilabtdi/
vim packages/create-ilabtdi/bin/index.mjs

# 2. Commit y push
git add packages/create-ilabtdi
git commit -m "feat(create-ilabtdi): algo nuevo"
git push
```

Después del push, ve al tab **Actions** del repo. Verás el workflow **Publish · create-ilabtdi** ejecutándose. En ~1 min:

- Detecta si la versión local ya existe en npm
- Si sí, bumpea `patch` (0.2.0 → 0.2.1) automático
- Publica con tu `NPM_TOKEN`
- Si hubo bump, commitea el nuevo `package.json` al repo

---

## Controlar qué tipo de bump (major / minor / patch)

El auto-bump por default es `patch`. Si quieres un `minor` o `major`, **bumpea manualmente antes de pushear**:

```bash
cd packages/create-ilabtdi

# Para minor (0.2.0 → 0.3.0)
npm version minor --no-git-tag-version
# Para major (0.2.0 → 1.0.0)
npm version major --no-git-tag-version

cd ../..
git add packages/create-ilabtdi/package.json
git commit -m "feat(create-ilabtdi): bump major"
git push
```

El workflow detecta que la versión local ≠ publicada y publica directo esa versión sin hacer bump extra.

---

## Verificación

Después de que el workflow termine:

```bash
npm view create-ilabtdi version
# → debe mostrar la versión nueva
```

O entra a [npmjs.com/package/create-ilabtdi](https://www.npmjs.com/package/create-ilabtdi).

---

## Troubleshooting

| Error                                        | Solución                                                                          |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| Workflow dice "Falta NPM_TOKEN"              | Agrégalo en Settings → Secrets como se indicó arriba                              |
| `403 Forbidden · 2FA required`               | El token no tiene **"Allow 2FA bypass"** marcado · genera uno nuevo               |
| `403 · Cannot publish over existing version` | Alguien ya publicó esa versión · pushea otro commit para que haga bump automático |
| `E404 · Cannot read …`                       | El token perdió permisos o caducó · regenera                                      |
| El workflow no se dispara                    | Verifica que los cambios sean en `packages/create-ilabtdi/**` (path filter)       |

---

## Rotar el token

Cada 90 días (o el período que hayas elegido):

1. Genera nuevo token en npm (mismos settings).
2. Actualiza el secret `NPM_TOKEN` en GitHub (Settings → Secrets → Update).
3. Listo · no necesitas re-publicar nada.
