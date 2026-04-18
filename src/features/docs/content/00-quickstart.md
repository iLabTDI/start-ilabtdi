> **TL;DR** — Un comando, wizard interactivo, proyecto listo. Elige backend en el wizard y te configura todo.

---

## El comando oficial

```bash
pnpm create ilabtdi mi-proyecto
```

**Equivalentes con otros gestores:**

```bash
npm  create ilabtdi@latest mi-proyecto
yarn create ilabtdi mi-proyecto
```

## ¿Qué hace exactamente?

1. **Clona el template** en una carpeta nueva (sin historia git).
2. **Instala dependencias** con pnpm.
3. Abre el **wizard interactivo** que te pregunta:
   - Nombre y URL del proyecto
   - Backend: Supabase · MySQL · Demo
   - Credenciales (opcional, puedes llenarlas después)
   - FTP del hosting (opcional)
   - Secrets de GitHub (opcional, si tienes `gh`)
4. Al final pregunta **¿es un proyecto nuevo?** — si dices Sí, elimina la docs del template para que quede solo el login.

Cuando termina:

```bash
cd mi-proyecto
pnpm dev
```

Y estás dentro.

---

## Los 3 backends (elegibles en el wizard)

### Demo · 30 segundos

Si solo quieres **ver cómo se ve**, elige **Solo demo** en el wizard. No configuras nada.

Abre [localhost:5173](http://localhost:5173/login) y entra con:

```
demo@ilabtdi.com  ·  Demo2026!
```

No hay backend real · la sesión vive en tu navegador.

---

### Supabase real · 3 minutos

**El recomendado.** Auth + DB + Storage + realtime por 0 USD al mes (plan free).

1. En el wizard elige **⚡ Supabase**.
2. En paralelo entra a [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (1 min).
3. **Project Settings → API** → copia `Project URL` y `anon public` → pégalas en el wizard.
4. Después: abre **SQL Editor** → pega `supabase/_setup.sql` → **Run**.
5. `pnpm dev` → ve a `/register` → crea cuenta → confirma email → **login funcional**.

### MySQL en GoDaddy · 10 minutos

**Cuando el cliente exige que todo viva en su hosting.**

1. En cPanel → **MySQL Databases** → crea DB + user + asigna privilegios.
2. En el wizard elige **🗄️ MySQL en GoDaddy** y pega las creds.
3. `pnpm db:setup` → aplica migraciones al MySQL remoto.
4. `pnpm db:user create -e admin@tudominio.com -p "Pass@2026!" -n "Admin"`.
5. `pnpm dev` en local, o `git push` para deploy automático.

Login en `https://tudominio.com/login` contra MySQL del lab.

---

## ¿Cuál backend elijo?

| Situación                                         | Backend                              |
| ------------------------------------------------- | ------------------------------------ |
| Solo quiero ver cómo se ve antes de decidir       | **Demo**                             |
| Proyecto nuevo, quiero lo más rápido y robusto    | **Supabase**                         |
| El cliente paga el hosting GoDaddy, todo vive ahí | **MySQL**                            |
| No tengo claro qué quiere el cliente              | **Supabase** — después puedes migrar |

> Supabase se puede convertir en MySQL después migrando los datos (y al revés, con más trabajo). **Si dudas, arranca en Supabase.**

---

## Después del login: ¿qué tienes?

Un proyecto con:

- Rutas públicas: landing (`/`) + login/registro/reset (`/login`, `/register`, etc).
- Rutas protegidas tras login: `/home`, `/profile`, `/settings`.
- Header con avatar, tema claro/oscuro, logout.
- Validación de forms con Zod, password strength meter, rate limiting del lado cliente.
- Deploy automático a GoDaddy preconfigurado (`git push` → Action lo sube).
- Headers de seguridad (CSP, HSTS, XSS protection) listos.

**Ahora sí, a construir tu feature encima.** Pasa por [Personalizar el template](/docs/customizar) para poner tu marca.

---

## ¿Algo no funcionó?

| Error                            | Fix                                                                          |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `Variables de entorno inválidas` | Copia `.env.example` → `.env` y llena las keys                               |
| Login redirecciona infinitamente | Activa "email confirmation" en Supabase o desactívalo para dev               |
| `Failed to fetch` en login       | Verifica que `VITE_SUPABASE_URL` esté correcto y la DB tenga RLS configurada |
| `CORS blocked` con backend PHP   | Agrega tu URL al `allowed_origins` de `backend/config.php`                   |
| Puerto 5173 ocupado              | `pnpm dev --port 5174` (o el que quieras)                                    |

Para más: ve a [Primeros pasos](/docs/primeros-pasos) o pregunta en el canal del lab.
