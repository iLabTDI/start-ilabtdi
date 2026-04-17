import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL debe ser una URL válida'),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(20, 'VITE_SUPABASE_ANON_KEY parece inválida (muy corta)'),
  VITE_APP_NAME: z.string().default('iLab TDI'),
  VITE_APP_URL: z.string().url().default('http://localhost:5173'),
  VITE_APP_VERSION: z.string().default('0.1.0'),
  VITE_AUTH_BACKEND: z.enum(['supabase', 'php']).default('supabase'),
  VITE_API_URL: z.string().default('/api'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
});

export type AppEnv = z.infer<typeof envSchema>;

function parseEnv(): AppEnv {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const flat = result.error.flatten().fieldErrors;
    const lines = Object.entries(flat)
      .map(([key, msgs]) => `  • ${key}: ${(msgs ?? []).join(', ')}`)
      .join('\n');
    throw new Error(
      `\nVariables de entorno inválidas. Revisa tu .env:\n${lines}\n` +
        `Copia .env.example → .env y llena los valores requeridos.\n`
    );
  }

  return result.data;
}

export const env = parseEnv();

export const isProd = env.MODE === 'production';
export const isDev = env.MODE === 'development';
export const isTest = env.MODE === 'test';

/**
 * Modo demo: se activa automáticamente cuando el backend es Supabase
 * pero la URL es placeholder. En este modo no se hacen llamadas reales
 * y se usan cuentas hardcodeadas con sesión persistida en localStorage.
 */
export const isDemoMode =
  env.VITE_AUTH_BACKEND === 'supabase' &&
  (env.VITE_SUPABASE_URL.includes('placeholder') ||
    env.VITE_SUPABASE_URL.includes('your-project-ref'));

export const authBackend = env.VITE_AUTH_BACKEND;
