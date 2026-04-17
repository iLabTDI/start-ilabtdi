Este playbook cubre el deploy a **GoDaddy cPanel**, que es el default del lab. Si tu proyecto va a Vercel/Netlify/Railway, salta al final.

## Arquitectura

```
GitHub push → Action → build (Vite) → FTP/SFTP → /public_html/ en GoDaddy
                                               → .htaccess sirve SPA + headers
```

## 1 · Preparar GoDaddy (una sola vez)

### Usuario FTP dedicado

No uses el usuario maestro. En **cPanel → FTP Accounts** crea uno con acceso solo al directorio del proyecto.

Anota:

- Host (`ftp.tudominio.com` o `ftpupload.net`)
- Usuario (`deploy@tudominio.com`)
- Contraseña (guárdala en 1Password / Bitwarden)
- Ruta (`/public_html/` o `/public_html/app/`)

### HTTPS

**cPanel → SSL/TLS Status → Run AutoSSL**. O mejor aún: **Cloudflare** como proxy (recomendado para todo el lab — DNS + SSL + CDN gratis).

## 2 · Configurar secrets en GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Valor |
|---|---|
| `FTP_SERVER` | Host FTP de cPanel |
| `FTP_USERNAME` | Usuario FTP dedicado |
| `FTP_PASSWORD` | Contraseña del usuario |
| `FTP_SERVER_DIR` | Ruta absoluta (`/public_html/`) |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | anon key del proyecto |

Variables no secretas (tab **Variables**):

- `VITE_APP_NAME` — nombre de la app
- `VITE_APP_URL` — URL final (`https://tudominio.com`)

## 3 · Primer deploy

```bash
git push origin main
```

Ve a la pestaña **Actions** del repo y observa el job **Deploy · GoDaddy**. Debe completar en 2-4 minutos.

## 4 · Verifica

1. Abre `https://tudominio.com` — la app debe cargar.
2. Prueba login/registro.
3. Verifica headers en [securityheaders.com](https://securityheaders.com) → objetivo **A o A+**.
4. Carga una ruta profunda (ej. `/profile`) y recarga — no debe dar 404 (eso prueba que `.htaccess` está enrutando).

## 5 · Rollback

```bash
git revert HEAD
git push origin main
```

El Action re-buildea y re-uploadea la versión anterior automáticamente.

Rollback manual: cPanel → **File Manager** → borra `dist/` → sube backup.

## SFTP (opcional, más seguro)

Si tu plan GoDaddy es Deluxe+ soporta SFTP:

1. cPanel → **SSH Access** → genera clave.
2. Guarda la private key como secret `SSH_PRIVATE_KEY`.
3. En `deploy-godaddy.yml`, comenta el step **Deploy via FTP** y descomenta **Deploy via SFTP**.

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| 404 en rutas profundas | `.htaccess` no se subió | Verifica en File Manager que exista `/public_html/.htaccess` |
| Assets no cargan | `base` mal en Vite | Revisa `vite.config.ts` → por defecto `/` |
| Login no funciona en prod | Redirect URL no registrada | Supabase → Auth → URL Configuration → agrega tu dominio |
| Mixed content warnings | HTTPS no forzado | Revisa la regla `RewriteRule ^ https://...` en `.htaccess` |
| Deploy timeout | FTP lento | Cambia a SFTP o sube el `timeout-minutes` |

## Otros destinos

### Vercel (si migras a Next.js)

```bash
pnpm dlx vercel link
pnpm dlx vercel
```

Configura los mismos env vars en el dashboard de Vercel.

### Netlify

```bash
pnpm dlx netlify-cli deploy
```

### Railway (backend Node/Python)

```bash
pnpm dlx @railway/cli login
pnpm dlx @railway/cli up
```

## Costos estimados

- **GoDaddy hosting básico** → ~$5/mes (suficiente para SPA con deploy continuo).
- **Supabase free** → 500 MB DB, 1 GB Storage, 50k MAU (entra holgado para un lab).
- **Cloudflare free** → SSL + DDoS + CDN.
- **Vercel Hobby** → gratis para proyectos personales / experimentos.
