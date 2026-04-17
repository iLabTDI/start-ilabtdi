import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Parser minimalista de archivos tipo dotenv (KEY=value, comentarios con #, etc.)
 * — se usa para `.credentials.txt` y `.env`.
 */
export function parseDotenvFile(path: string): Record<string, string> {
  if (!existsSync(path)) {
    throw new Error(
      `No se encontró ${path}. Copia .credentials.example.txt → .credentials.txt primero.`
    );
  }
  const raw = readFileSync(path, 'utf8');
  const out: Record<string, string> = {};
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // quitar comillas envolventes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    // quitar comentarios inline
    const hash = value.indexOf(' #');
    if (hash !== -1) value = value.slice(0, hash).trim();
    out[key] = value;
  }
  return out;
}

export function required(creds: Record<string, string>, key: string): string {
  const v = creds[key];
  if (!v || v.trim() === '') {
    throw new Error(`Falta la variable ${key} en .credentials.txt`);
  }
  return v;
}

export function optional(creds: Record<string, string>, key: string, fallback = ''): string {
  return creds[key] ?? fallback;
}

/** Imprime una línea con prefijo consistente. */
export function log(kind: 'info' | 'ok' | 'warn' | 'err', message: string): void {
  const prefix = {
    info: '→',
    ok: '✓',
    warn: '!',
    err: '✗',
  }[kind];
  const color = {
    info: '\x1b[36m',
    ok: '\x1b[32m',
    warn: '\x1b[33m',
    err: '\x1b[31m',
  }[kind];
  const reset = '\x1b[0m';
  // eslint-disable-next-line no-console
  console.log(`${color}${prefix}${reset} ${message}`);
}

export function randomSecret(bytes = 64): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}
