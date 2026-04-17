## Antes de pushear

```bash
# 1. Verifica que no hay secrets rastreables
git check-ignore .env .credentials.txt backend/config.php

# 2. Que compile y pase lint/tests
pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

Si ambos salen sin errores, estás listo.

## Crear el repo y pushear

### Con `gh` CLI (más rápido)

```bash
git init && git branch -M main
git add . && git commit -m "chore: init from start-ilabtdi"
gh repo create mi-proyecto --public --source=. --remote=origin --push
```

### Manual (sin `gh`)

1. Crea el repo en [github.com/new](https://github.com/new) — sin README ni LICENSE.
2. Copia los comandos que te muestra y pega:
   ```bash
   git init && git branch -M main
   git add . && git commit -m "chore: init"
   git remote add origin git@github.com:tu-usuario/mi-proyecto.git
   git push -u origin main
   ```

## Configurar secrets del repo

**Repo → Settings → Secrets and variables → Actions**.

### Secrets (tab Secrets)

| Nombre | Para qué |
|---|---|
| `FTP_SERVER` · `FTP_USERNAME` · `FTP_PASSWORD` · `FTP_SERVER_DIR` | Deploy a GoDaddy |
| `VITE_SUPABASE_URL` · `VITE_SUPABASE_ANON_KEY` | Si usas Supabase |
| `DB_HOST` · `DB_NAME` · `DB_USER` · `DB_PASS` · `JWT_SECRET` | Si usas MySQL (PHP) |

### Variables (tab Variables)

| Nombre | Valor |
|---|---|
| `VITE_APP_NAME` | `Mi Proyecto` |
| `VITE_APP_URL` | `https://mi-dominio.com` |
| `VITE_AUTH_BACKEND` | `supabase` o `php` |

**Atajo**: con `.credentials.txt` lleno y `gh` autenticado, `pnpm bootstrap` sube todos los secrets automático.

## Después del primer push

1. **Actions → activa los workflows** si aparece el banner.
2. Haz un commit vacío para probar el deploy: `git commit --allow-empty -m "ci: trigger" && git push`.
3. Revisa los logs del job "Deploy · GoDaddy".
4. Abre tu dominio — debe cargar.

## Proteger `main` (recomendado para equipos)

Settings → Branches → Add rule → `main`:

- Require pull request before merging
- Require status checks (selecciona `validate` del CI)

## Troubleshooting rápido

| Error | Solución |
|---|---|
| `FTP login failed` | Usuario FTP suele ser `user@tudominio.com` completo |
| `VITE_SUPABASE_URL missing` | Falta el secret o está mal escrito |
| Build falla por typecheck | Corre `pnpm typecheck` en local y arregla |
| 404 en rutas profundas en prod | Verifica que `dist/.htaccess` se subió |

Más detalles en [Deploy a GoDaddy](/docs/deploy).
