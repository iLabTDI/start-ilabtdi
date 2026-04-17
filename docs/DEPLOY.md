# Deploy a GoDaddy · paso a paso

Esta guía cubre el deploy automático a un cPanel de GoDaddy usando el workflow `deploy-godaddy.yml`.

## Arquitectura

```
GitHub push → Action → build (Vite) → FTP/SFTP → /public_html/ en GoDaddy
                                              → .htaccess sirve SPA + headers
```

## 1. Preparar GoDaddy

### 1.1. Crea un usuario FTP dedicado

No uses el usuario maestro. En **cPanel → FTP Accounts** crea uno con acceso solo al directorio donde deployarás (`/public_html/` o `/public_html/app/`).

Anota:
- **Host FTP** — suele ser `ftp.tudominio.com` o `ftpupload.net`
- **Usuario** — `deploy@tudominio.com`
- **Contraseña** — guárdala en un password manager
- **Directorio** — la ruta absoluta (ej. `/public_html/`)

### 1.2. Verifica que AllowOverride esté activo

cPanel por defecto permite `.htaccess`. Si tu plan lo restringe, contacta soporte de GoDaddy.

### 1.3. Habilita HTTPS

cPanel → **SSL/TLS Status** → Run AutoSSL. O mejor aún: usa Cloudflare como proxy (recomendado para todo el lab).

## 2. Configurar secrets en GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**

| Nombre | Valor | Dónde conseguirlo |
|---|---|---|
| `FTP_SERVER` | `ftp.tudominio.com` | cPanel → FTP Accounts → Configure FTP Client |
| `FTP_USERNAME` | `deploy@tudominio.com` | Lo que definiste en 1.1 |
| `FTP_PASSWORD` | `xxxxxxxx` | Lo que definiste en 1.1 |
| `FTP_SERVER_DIR` | `/public_html/` | Ruta cPanel |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API |

### Variables (no secretas)

Repo → **Settings → Secrets and variables → Actions → Variables tab**

| Nombre | Valor | Ejemplo |
|---|---|---|
| `VITE_APP_NAME` | Nombre de la app | `iLab TDI` |
| `VITE_APP_URL` | URL final | `https://ilabtdi.com` |

## 3. Primer deploy

```bash
git push origin main
```

Ve a la pestaña **Actions** del repo y observa el job `Deploy · GoDaddy`. Debe completar en 2-4 minutos.

## 4. Verifica

1. Abre `https://tudominio.com` — debe cargar la app
2. Prueba login/registro — debe funcionar
3. Verifica headers en https://securityheaders.com → objetivo **A o A+**
4. Prueba una ruta profunda (ej. `/profile`) y recarga — no debe dar 404 (eso prueba que `.htaccess` está enrutando)

## 5. SFTP (opcional, más seguro)

FTP plano envía credenciales en claro. Si tu plan GoDaddy soporta SFTP (Deluxe+):

1. En cPanel crea una clave SSH
2. Guarda la private key como secret `SSH_PRIVATE_KEY`
3. En `deploy-godaddy.yml`, comenta el step `Deploy via FTP` y descomenta `Deploy via SFTP`

## Rollback

Si el deploy salió mal:

```bash
# Reverts el commit problemático
git revert HEAD
git push origin main
```

El Action re-buildea y re-uploadea la versión anterior automáticamente.

Para rollback manual: cPanel → **File Manager** → elimina `dist/` → sube backup.

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| 404 en rutas profundas | `.htaccess` no se subió | Verifica en cPanel → File Manager que exista en `/public_html/.htaccess` |
| Assets no cargan | Base path mal | Revisa `vite.config.ts` → `base` (por defecto `/`) |
| Login no funciona en prod | Redirect URL no registrada | Supabase Dashboard → Auth → URL Configuration → agregar `https://tudominio.com` |
| Mixed content warnings | HTTPS no forzado | Verifica regla `RewriteRule ^ https://...` en `.htaccess` |
| Deploy timeout | FTP lento | Usa SFTP o sube el job timeout en el workflow |

## Costos estimados

- **GoDaddy hosting básico** — ~$5/mes (suficiente para SPA con deploy continuo)
- **Supabase free** — 500 MB DB, 1 GB storage, 50k MAU (entra holgado para un lab)
- **Cloudflare free** — SSL + DDoS + CDN gratuito
