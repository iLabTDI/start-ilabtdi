import { isProd } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (msg: string, context?: Record<string, unknown>) => void;
  info: (msg: string, context?: Record<string, unknown>) => void;
  warn: (msg: string, context?: Record<string, unknown>) => void;
  error: (msg: string, context?: Record<string, unknown>) => void;
}

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apikey',
  'secret',
  'authorization',
  'cookie',
]);

function redact(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : redact(v);
  }
  return out;
}

function write(level: LogLevel, msg: string, context?: Record<string, unknown>): void {
  if (isProd && (level === 'debug' || level === 'info')) return;

  const payload = context ? redact(context) : undefined;
  const prefix = `[${level.toUpperCase()}]`;

  switch (level) {
    case 'debug':
    case 'info':
      // eslint-disable-next-line no-console
      console.log(prefix, msg, payload ?? '');
      break;
    case 'warn':
      console.warn(prefix, msg, payload ?? '');
      break;
    case 'error':
      console.error(prefix, msg, payload ?? '');
      break;
  }
}

export const logger: Logger = {
  debug: (msg, ctx) => write('debug', msg, ctx),
  info: (msg, ctx) => write('info', msg, ctx),
  warn: (msg, ctx) => write('warn', msg, ctx),
  error: (msg, ctx) => write('error', msg, ctx),
};
