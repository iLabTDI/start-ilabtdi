import { env } from '@/lib/env';
import { brand } from '@/config/brand';

/**
 * Config del sitio — compone `brand.ts` (editable por el dev que clona)
 * con variables de entorno (`env.ts`) específicas del despliegue.
 *
 * Si quieres cambiar el nombre, logo o acento, edita `brand.ts`,
 * no este archivo.
 */
export const siteConfig = {
  name: env.VITE_APP_NAME || brand.name,
  shortName: brand.name,
  description: brand.tagline,
  url: env.VITE_APP_URL || brand.publicUrl,
  version: env.VITE_APP_VERSION,
  locale: 'es-MX',
  lab: {
    name: brand.name,
    owner: brand.longName,
  },
  links: {
    docs: '/docs',
    github: brand.links.repo,
    support: brand.links.support,
  },
  logo: brand.logoPath,
} as const;

export type SiteConfig = typeof siteConfig;
