/**
 * Variables de entorno · valida al arrancar la app.
 * Si falta algo crítico, tira un error claro y muere.
 */

interface AppEnv {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_APP_NAME: string;
  VITE_APP_URL: string;
  VITE_APP_VERSION: string;
  VITE_AUTH_BACKEND: 'supabase' | 'php' | 'demo';
  VITE_API_URL: string;
  MODE: string;
}

function read(key: keyof AppEnv, fallback?: string): string {
  const value = import.meta.env[key] as string | undefined;
  if (!value && fallback === undefined) {
    throw new Error(
      `Falta ${String(key)} en tu .env. Copia .env.example → .env y llena los valores.`
    );
  }
  return value ?? fallback ?? '';
}

export const env: AppEnv = {
  VITE_SUPABASE_URL: read('VITE_SUPABASE_URL', 'https://placeholder.supabase.co'),
  VITE_SUPABASE_ANON_KEY: read('VITE_SUPABASE_ANON_KEY', 'placeholder-anon-key'),
  VITE_APP_NAME: read('VITE_APP_NAME', 'iLab TDI'),
  VITE_APP_URL: read('VITE_APP_URL', 'http://localhost:5173'),
  VITE_APP_VERSION: read('VITE_APP_VERSION', '0.1.0'),
  VITE_AUTH_BACKEND: read('VITE_AUTH_BACKEND', 'supabase') as AppEnv['VITE_AUTH_BACKEND'],
  VITE_API_URL: read('VITE_API_URL', '/api'),
  MODE: import.meta.env.MODE || 'development',
};

export const isProd = env.MODE === 'production';
export const isDev = env.MODE === 'development';

export const authBackend = env.VITE_AUTH_BACKEND;

export const isDemoMode =
  env.VITE_AUTH_BACKEND === 'demo' ||
  (env.VITE_AUTH_BACKEND === 'supabase' &&
    (env.VITE_SUPABASE_URL.includes('placeholder') ||
      env.VITE_SUPABASE_URL.includes('your-project-ref')));
