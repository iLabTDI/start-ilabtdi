import DOMPurify from 'dompurify';

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizePlainText(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

export function isSafeExternalUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'muy débil' | 'débil' | 'aceptable' | 'fuerte' | 'excelente';
  suggestions: string[];
}

export function evaluatePasswordStrength(pw: string): PasswordStrength {
  const suggestions: string[] = [];
  let score = 0;

  if (pw.length >= 10) score++;
  else suggestions.push('Usa al menos 10 caracteres');

  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  else suggestions.push('Combina mayúsculas y minúsculas');

  if (/\d/.test(pw)) score++;
  else suggestions.push('Incluye al menos un número');

  if (/[^A-Za-z0-9]/.test(pw)) score++;
  else suggestions.push('Añade un símbolo (!, @, #, etc.)');

  const clamped = Math.min(score, 4) as PasswordStrength['score'];

  const labels: Record<PasswordStrength['score'], PasswordStrength['label']> = {
    0: 'muy débil',
    1: 'débil',
    2: 'aceptable',
    3: 'fuerte',
    4: 'excelente',
  };

  return { score: clamped, label: labels[clamped], suggestions };
}

const attempts = new Map<string, { count: number; firstAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
  remaining: number;
}

export function checkClientRateLimit(
  key: string,
  maxAttempts = 3,
  windowMs = 30_000
): RateLimitResult {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now - record.firstAt > windowMs) {
    attempts.set(key, { count: 1, firstAt: now });
    return { allowed: true, retryAfterMs: 0, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterMs: windowMs - (now - record.firstAt),
      remaining: 0,
    };
  }

  record.count++;
  return { allowed: true, retryAfterMs: 0, remaining: maxAttempts - record.count };
}

export function resetClientRateLimit(key: string): void {
  attempts.delete(key);
}
