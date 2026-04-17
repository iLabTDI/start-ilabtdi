/**
 * Brand · fuente única de verdad para personalizar la identidad visual.
 *
 * Al clonar el template, esto es lo único que **debes** tocar:
 *   1. brand.name          → nombre corto del proyecto
 *   2. brand.longName      → nombre largo / owner
 *   3. brand.tagline       → una frase que describa tu proyecto
 *   4. brand.logoPath      → ruta en /public/ (PNG/SVG)
 *   5. brand.accentColor   → OKLCH o HSL — ver src/styles/globals.css
 *
 * Nada de esto está hardcodeado en componentes — todos los leen desde aquí.
 */

export const brand = {
  // Nombre corto (header, favicon, títulos)
  name: 'iLab TDI',

  // Nombre largo (footer, legal)
  longName: 'iLab · Transformación Digital e Innovación',

  // Descripción corta (para hero, SEO)
  tagline: 'Template oficial del laboratorio · login listo en minutos.',

  // Logo — debes poner tu archivo en /public/logos/
  logoPath: '/logos/ilabtdi-logo.png',

  // Favicon — normalmente el mismo que el logo
  faviconPath: '/logos/ilabtdi-logo.png',

  // Link al repo / docs
  links: {
    repo: 'https://github.com/ilabtdi/start-ilabtdi',
    docs: 'https://template.ilabtdi.com/docs',
    support: 'mailto:soporte@ilabtdi.com',
  },

  // Dominio público del proyecto (se usa para CSP, redirects, etc.)
  publicUrl: 'https://ilabtdi.com',

  /**
   * Color de acento.
   *
   * El valor real vive en `src/styles/globals.css` como variable CSS
   * `--color-primary` en OKLCH. Cambia ahí si quieres otra paleta.
   * Aquí está el nombre para referencia rápida.
   */
  accentColor: 'cyan',

  /**
   * Modo de tema por defecto. Opciones: 'dark' | 'light' | 'system'.
   */
  defaultTheme: 'dark' as const,
} as const;

export type BrandConfig = typeof brand;
