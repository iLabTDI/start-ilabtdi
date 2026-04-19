Un solo comando configura `.env`, `backend/config.php` y los secrets de GitHub a partir de un archivo de credenciales.

## Flujo

```bash
# 1. Copia la plantilla
cp .credentials.example.txt .credentials.txt

# 2. Edita con tus datos reales
#    FTP host/user/pass, Supabase o MySQL, GitHub
#    El archivo está en .gitignore · no se sube al repo.

# 3. Ejecuta
pnpm bootstrap
```

Con esto:

1. Genera `.env` (dev) y `.env.production.local`.
2. Si eliges PHP como backend: genera `backend/config.php` con MySQL creds + JWT autogenerado.
3. Si tienes `gh` CLI autenticado: sube todos los secrets al repo.

## Scripts relacionados

| Comando                                                 | Hace                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| `pnpm bootstrap`                                        | Todo el setup de un viaje                                          |
| `pnpm db:setup`                                         | Aplica migraciones SQL al MySQL remoto (abre SSH tunnel si aplica) |
| `pnpm db:user create -e x@y.com -p Pass@1! -n "Nombre"` | Crea user manualmente con bcrypt                                   |
| `pnpm db:user list`                                     | Lista usuarios                                                     |
| `pnpm db:user reset -e x@y.com -p NuevaPass@1!`         | Reset password                                                     |

## Flags

```bash
pnpm bootstrap --force      # sobrescribe sin preguntar
pnpm bootstrap --skip-gh    # no sube secrets a GitHub
```

## Rotar una key

Edita `.credentials.txt`, corre `pnpm bootstrap --force`, re-deploya.

## Troubleshooting

| Error                        | Fix                                            |
| ---------------------------- | ---------------------------------------------- |
| `Falta la variable X`        | Completa el campo en `.credentials.txt`        |
| `gh no autenticado`          | `gh auth login`                                |
| `.credentials.txt no existe` | `cp .credentials.example.txt .credentials.txt` |
