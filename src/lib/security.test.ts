import { describe, expect, it } from 'vitest';
import {
  checkClientRateLimit,
  evaluatePasswordStrength,
  isSafeExternalUrl,
  resetClientRateLimit,
} from '@/lib/security';

describe('security helpers', () => {
  describe('evaluatePasswordStrength', () => {
    it('marca password vacío como muy débil', () => {
      expect(evaluatePasswordStrength('').score).toBe(0);
    });
    it('marca password robusto como excelente', () => {
      expect(evaluatePasswordStrength('Super@Seguro2026!').score).toBe(4);
    });
  });

  describe('checkClientRateLimit', () => {
    it('bloquea al exceder intentos', () => {
      resetClientRateLimit('t:test');
      expect(checkClientRateLimit('t:test', 2, 10_000).allowed).toBe(true);
      expect(checkClientRateLimit('t:test', 2, 10_000).allowed).toBe(true);
      expect(checkClientRateLimit('t:test', 2, 10_000).allowed).toBe(false);
    });
  });

  describe('isSafeExternalUrl', () => {
    it('acepta https', () => {
      expect(isSafeExternalUrl('https://supabase.co')).toBe(true);
    });
    it('rechaza javascript:', () => {
      expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    });
  });
});
