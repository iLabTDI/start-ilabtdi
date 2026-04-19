El paquete `create-ilabtdi` lo publica manualmente su autor desde su terminal. No hay automatización — simple, seguro, controlado.

---

## Flujo de publicación

Cada vez que haya cambios en `packages/create-ilabtdi/` (típicamente en `bin/index.mjs`):

```bash
cd packages/create-ilabtdi

# 1. Bump de versión
npm version patch       # bugfix · 0.2.0 → 0.2.1
# o
npm version minor       # nueva feature · 0.2.0 → 0.3.0
# o
npm version major       # breaking change · 0.2.0 → 1.0.0

# 2. Publica
npm publish --access public
# → npm te pedirá el OTP (6 dígitos de tu app autenticadora)

# 3. Push del bump al repo
cd ../..
git push && git push --tags
```

Listo. En ~30 segundos la nueva versión está disponible en npm.

---

## Primera vez · setup npm

Si nunca has publicado paquetes:

```bash
npm login
# → usuario + password + email + OTP
```

Tu credencial queda guardada en `~/.npmrc`. No necesitas volver a hacer login cada vez — solo te pide OTP cuando publicas (si tienes 2FA activado).

---

## Cambios en el template (sin republicar)

**Importante**: si cambias **solo el template** (archivos fuera de `packages/create-ilabtdi/`), **NO necesitas publicar**.

El paquete `create-ilabtdi` solo contiene el **binario** que hace `git clone` del repo. Cada vez que alguien corre `pnpm create ilabtdi`, descarga la última versión del branch `main`.

Entonces:

| Cambio                                  | ¿Requiere publish?                     |
| --------------------------------------- | -------------------------------------- |
| Diseño, landing, login, features, docs  | **NO** — se propaga con `git push`     |
| `packages/create-ilabtdi/bin/index.mjs` | **SÍ** — `npm version` + `npm publish` |
| `packages/create-ilabtdi/package.json`  | **SÍ**                                 |
| `packages/create-ilabtdi/README.md`     | Opcional (cosmético en npm)            |

---

## Verificación después de publicar

```bash
npm view create-ilabtdi version
```

O en browser: [npmjs.com/package/create-ilabtdi](https://www.npmjs.com/package/create-ilabtdi).

Prueba rápida:

```bash
cd ~/Desktop
pnpm create ilabtdi@latest probando-nueva-version
```

---

## Unpublishing (si te equivocas)

Solo disponible dentro de las **primeras 72 horas**. Después está bloqueado.

```bash
npm unpublish create-ilabtdi@0.2.1
```

Para "deprecar" una versión vieja (sin borrarla):

```bash
npm deprecate create-ilabtdi@0.1.0 "Usar 0.2.0+"
```

---

## Troubleshooting

| Error                                        | Fix                                                       |
| -------------------------------------------- | --------------------------------------------------------- |
| `402 Payment Required`                       | Para scoped packages sin `--access public`. Usa el flag.  |
| `403 · Cannot publish over existing version` | Esa versión ya existe · corre `npm version patch` primero |
| `E401 · Unauthorized`                        | Corre `npm login` de nuevo                                |
| `403 · 2FA required`                         | Pasa `--otp=123456` con el código actual de tu app        |
| Cambios no aparecen en `pnpm create`         | Limpia cache: `pnpm store prune`                          |

---

## Notas de propiedad

- El paquete está publicado bajo la cuenta personal del autor (**[yairhdz24](https://github.com/yairhdz24)**).
- Solo el autor puede publicar nuevas versiones.
- El repo del template puede vivir en la organización del lab, pero el **binario en npm es propiedad del autor**.
- Si en el futuro se requiere transferir el paquete a una org de npm, consultar [docs.npmjs.com/transferring-a-package](https://docs.npmjs.com/transferring-a-package-from-a-user-account-to-another-user-account).
