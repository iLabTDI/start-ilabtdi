export const APP_STORAGE_KEYS = {
  theme: 'ilabtdi:theme',
  sidebarCollapsed: 'ilabtdi:sidebar-collapsed',
  returnTo: 'ilabtdi:return-to',
} as const;

export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

export const APP_ROUTES = {
  home: '/',
  appHome: '/home',
  docs: '/docs',
  profile: '/profile',
  settings: '/settings',
  notFound: '/404',
} as const;

export const PASSWORD_MIN_LENGTH = 10;
export const FULL_NAME_MAX_LENGTH = 100;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const LOGIN_RATE_LIMIT = {
  maxAttempts: 3,
  windowMs: 30_000,
} as const;

export const GENERIC_AUTH_ERROR = 'Credenciales inválidas. Verifica tu correo y contraseña.';
