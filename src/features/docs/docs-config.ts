import type { IconType } from 'react-icons';
import { FiZap, FiLayers, FiTool, FiShield } from 'react-icons/fi';
import quickstartMd from '@/features/docs/content/00-quickstart.md?raw';
import primerosPasosMd from '@/features/docs/content/00b-primeros-pasos.md?raw';
import introMd from '@/features/docs/content/01-introduccion.md?raw';
import stackMd from '@/features/docs/content/03-stack-oficial.md?raw';
import decisionesMd from '@/features/docs/content/04-decisiones-tecnicas.md?raw';
import deployMd from '@/features/docs/content/07-deploy.md?raw';
import seguridadMd from '@/features/docs/content/08-seguridad.md?raw';
import mysqlGodaddyMd from '@/features/docs/content/10-mysql-godaddy.md?raw';
import bootstrapMd from '@/features/docs/content/11-bootstrap.md?raw';
import customizarMd from '@/features/docs/content/13-customizar.md?raw';
import emailsMd from '@/features/docs/content/14-emails.md?raw';
import subirGithubMd from '@/features/docs/content/15-subir-a-github.md?raw';

export interface DocSection {
  slug: string;
  title: string;
  summary: string;
  content: string;
}

export interface DocGroup {
  label: string;
  icon: IconType;
  sections: DocSection[];
}

export const docGroups: DocGroup[] = [
  {
    label: 'Empieza aquí',
    icon: FiZap,
    sections: [
      {
        slug: 'quickstart',
        title: 'Login funcional en 5 minutos',
        summary: '3 caminos: demo, Supabase o MySQL. Copia, pega, tienes auth.',
        content: quickstartMd,
      },
      {
        slug: 'primeros-pasos',
        title: 'Primeros pasos (principiantes)',
        summary: 'Node, pnpm, Git, VS Code · conceptos básicos antes del quickstart.',
        content: primerosPasosMd,
      },
      {
        slug: 'introduccion',
        title: '¿Qué es este template?',
        summary: 'Qué trae y qué no. En 30 segundos.',
        content: introMd,
      },
    ],
  },
  {
    label: 'Stack',
    icon: FiLayers,
    sections: [
      {
        slug: 'stack-oficial',
        title: 'Stack oficial',
        summary: 'Tabla con todo lo que trae el template.',
        content: stackMd,
      },
      {
        slug: 'decisiones-tecnicas',
        title: 'Decisiones técnicas',
        summary: 'Por qué sí / por qué no — una decisión por pieza.',
        content: decisionesMd,
      },
    ],
  },
  {
    label: 'Práctica',
    icon: FiTool,
    sections: [
      {
        slug: 'customizar',
        title: 'Personalizar el template',
        summary: 'Logo, colores, fuente, nombre — todo desde un archivo.',
        content: customizarMd,
      },
      {
        slug: 'bootstrap',
        title: 'Bootstrap automático',
        summary: 'Un comando configura env, backend y secrets del repo.',
        content: bootstrapMd,
      },
      {
        slug: 'mysql-godaddy',
        title: 'MySQL en GoDaddy',
        summary: 'Cuándo usar PHP+MySQL en lugar de Supabase.',
        content: mysqlGodaddyMd,
      },
      {
        slug: 'emails',
        title: 'Correos transaccionales',
        summary: 'Verify, reset, welcome · driver stub/Resend/SMTP.',
        content: emailsMd,
      },
      {
        slug: 'subir-a-github',
        title: 'Subir a GitHub',
        summary: 'Paso a paso desde cero para publicar y activar el deploy.',
        content: subirGithubMd,
      },
      {
        slug: 'deploy',
        title: 'Deploy a GoDaddy',
        summary: 'GitHub Actions + FTP/SFTP al cPanel.',
        content: deployMd,
      },
    ],
  },
  {
    label: 'Seguridad',
    icon: FiShield,
    sections: [
      {
        slug: 'seguridad',
        title: 'Checklist de seguridad',
        summary: 'Antes de ir a producción.',
        content: seguridadMd,
      },
    ],
  },
];

export const docSectionsBySlug: Record<string, DocSection> = Object.fromEntries(
  docGroups.flatMap((g) => g.sections).map((s) => [s.slug, s])
);

export const flatDocSections: DocSection[] = docGroups.flatMap((g) => g.sections);
