import type { LucideIcon } from 'lucide-react';
import { BookOpen, Home, Settings, User } from 'lucide-react';
import { APP_ROUTES } from '@/lib/constants';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const mainNav: NavGroup[] = [
  {
    label: 'General',
    items: [
      { label: 'Inicio', href: APP_ROUTES.appHome, icon: Home },
      { label: 'Documentación', href: APP_ROUTES.docs, icon: BookOpen },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { label: 'Perfil', href: APP_ROUTES.profile, icon: User },
      { label: 'Configuración', href: APP_ROUTES.settings, icon: Settings },
    ],
  },
];

export const breadcrumbLabels: Record<string, string> = {
  home: 'Inicio',
  docs: 'Documentación',
  profile: 'Perfil',
  settings: 'Configuración',
  login: 'Iniciar sesión',
  register: 'Crear cuenta',
  'forgot-password': 'Recuperar contraseña',
  'reset-password': 'Restablecer contraseña',
};
