Al clonar el template, esto es lo **mínimo** que cambias para que el proyecto sea tuyo. No necesitas tocar más archivos.

## 1. Nombre y branding

Edita **`src/config/brand.ts`**:

```ts
export const brand = {
  name: 'Mi Proyecto', // ← corto (header, favicon)
  longName: 'Mi Proyecto S.A. de C.V.', // ← largo (footer, legal)
  tagline: 'Una frase que describa tu producto.',
  logoPath: '/logos/mi-logo.png',
  faviconPath: '/logos/mi-logo.png',

  links: {
    repo: 'https://github.com/mi-org/mi-proyecto',
    docs: 'https://mi-proyecto.com/docs',
    support: 'mailto:soporte@mi-proyecto.com',
  },

  publicUrl: 'https://mi-proyecto.com',
  accentColor: 'cyan',
  defaultTheme: 'dark',
};
```

Todos los componentes (header, login, home, footer) leen de aquí. Un solo cambio, propaga a todos lados.

## 2. Logo

Reemplaza el PNG:

```bash
# Borra el logo del template
rm public/logos/ilabtdi-logo.png

# Pega el tuyo con el mismo nombre, o cámbiale el nombre y actualiza brand.ts
cp ~/Downloads/mi-logo.png public/logos/mi-logo.png
```

**Tips para el logo**:

- Formato: **PNG con fondo transparente** recomendado (también acepta SVG).
- Tamaño: mínimo **512×512** para que se vea bien en retina.
- Proporción: cuadrada funciona mejor con el componente `<BrandMark />`.

## 3. Colores (paleta)

Edita **`src/styles/globals.css`** en la sección `@theme`:

```css
@theme {
  --color-primary: oklch(78% 0.16 210); /* cambiar esto */
  --color-primary-foreground: oklch(14% 0.02 210);
  /* … resto de variables */
}

.light {
  --color-primary: oklch(55% 0.15 210); /* y esto para modo claro */
  /* … */
}
```

### Cómo elegir un color

- Usa [OKLCH Color Picker](https://oklch.com/) para elegir valores perceptualmente consistentes.
- El valor es `oklch(lightness% chroma hue)`:
  - Lightness: 0-100% (brillo percibido)
  - Chroma: 0-0.4 (saturación)
  - Hue: 0-360 (tono)
- Mantén la diferencia de lightness entre `primary` (claro) y `primary-foreground` (texto sobre el color) para legibilidad — unos **60 puntos** de diferencia funcionan bien.

### Paletas rápidas

Cambia el `hue` para cambiar todo el tema:

| Acento         | Hue OKLCH |
| -------------- | --------- |
| Cyan (default) | 210       |
| Violet         | 290       |
| Ámbar          | 80        |
| Verde          | 150       |
| Rosa           | 350       |

## 4. Fuente tipográfica

El template usa **Garet** como primera opción y **Onest** (Google Fonts) como fallback.

### Si tienes licencia de Garet

Pega los archivos en `public/fonts/` con estos nombres exactos:

```
public/fonts/
├── garet-light.woff2         (300)
├── garet-book.woff2          (400)
├── garet-book-italic.woff2
├── garet-medium.woff2        (500)
├── garet-heavy.woff2         (700)
└── garet-heavy-italic.woff2
```

Listo. La cascada CSS los toma automático.

### Si prefieres otra Google Font

En `index.html`:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=TU_FUENTE:wght@300;400;500;600;700&display=swap"
/>
```

Y en `src/styles/globals.css`:

```css
@theme {
  --font-sans: 'TU_FUENTE', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'TU_FUENTE', ui-sans-serif, system-ui, sans-serif;
}
```

### Recomendaciones libres que combinan bien con el stack

| Fuente                     | Vibe                                 |
| -------------------------- | ------------------------------------ |
| **Onest** (default actual) | Geométrica moderna, premium          |
| **Inter**                  | Standard tech, ultra legible         |
| **Geist**                  | Vercel/minimal                       |
| **DM Sans**                | Calidez, startup moderna             |
| **Space Grotesk**          | Carácter geométrico con personalidad |
| **Mulish**                 | Humanista suave                      |

## 5. Título de la pestaña del navegador

En **`index.html`**:

```html
<title>Mi Proyecto</title>
```

## 6. Descripción meta (SEO)

En **`index.html`**:

```html
<meta name="description" content="Mi producto que hace X para Y." />
```

## 7. Cuentas demo (solo si usas modo demo)

Edita **`src/features/auth/services/demo-auth-service.ts`** → array `DEMO_ACCOUNTS`:

```ts
export const DEMO_ACCOUNTS = [
  {
    email: 'demo@mi-proyecto.com',
    password: 'Demo2026!',
    fullName: 'Usuario Demo',
    role: 'member',
  },
] as const;
```

En producción real (Supabase o MySQL), este archivo se puede borrar — el modo demo solo se activa con URL placeholder.

## 8. Textos de la landing y login

Los textos viven en cada componente. Para el hero y CTA:

- `src/pages/home-page.tsx` — textos del landing (hero, features, stack, CTA)
- `src/pages/auth/_layout.tsx` — panel decorativo del login (cita, frase lateral)

## Checklist antes del primer commit

- [ ] `brand.ts` completo con tus datos
- [ ] Logo en `public/logos/` con el nombre que pusiste en `brand.ts`
- [ ] Favicon actualizado en `index.html`
- [ ] Paleta de colores ajustada (si quieres otro acento)
- [ ] `<title>` y `<meta description>` en `index.html`
- [ ] Si usas modo demo, revisa las cuentas en `demo-auth-service.ts`
- [ ] Corre `pnpm dev` y verifica que todo se vea como esperas

Una vez hecho esto, el proyecto es tuyo. A construir features.

## ¿Qué NO tienes que tocar?

- `src/lib/*` — utilidades genéricas (logger, env, security).
- `src/components/ui/*` — primitivos shadcn, se ajustan solos a la paleta.
- `src/features/auth/*` — lógica de auth (a menos que cambies backend).
- `src/app/*` — providers, router, error boundary.
- Configs raíz (`vite.config.ts`, `tsconfig.json`, `eslint.config.js`) — ajustados.

Si te encuentras editando algo de esa lista para personalizar branding, **estás tocando lo incorrecto** — vuelve a `brand.ts`.
