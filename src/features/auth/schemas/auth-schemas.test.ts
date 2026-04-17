import { describe, expect, it } from 'vitest';
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/features/auth/schemas/auth-schemas';

describe('auth-schemas', () => {
  describe('loginSchema', () => {
    it('acepta credenciales válidas', () => {
      const result = loginSchema.safeParse({
        email: 'test@ilabtdi.com',
        password: 'whatever',
      });
      expect(result.success).toBe(true);
    });

    it('rechaza email inválido', () => {
      const result = loginSchema.safeParse({ email: 'no-email', password: 'x' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const base = {
      fullName: 'María Hernández',
      email: 'maria@ilabtdi.com',
      password: 'Segur@123!',
      confirmPassword: 'Segur@123!',
      acceptTerms: true as const,
    };

    it('acepta payload válido', () => {
      expect(registerSchema.safeParse(base).success).toBe(true);
    });

    it('rechaza password sin símbolo', () => {
      const r = registerSchema.safeParse({
        ...base,
        password: 'Segura123AB',
        confirmPassword: 'Segura123AB',
      });
      expect(r.success).toBe(false);
    });

    it('rechaza contraseñas que no coinciden', () => {
      const r = registerSchema.safeParse({
        ...base,
        confirmPassword: 'Otra@123!',
      });
      expect(r.success).toBe(false);
    });

    it('rechaza sin aceptar términos', () => {
      const r = registerSchema.safeParse({ ...base, acceptTerms: false });
      expect(r.success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('valida coincidencia de contraseñas', () => {
      const r = resetPasswordSchema.safeParse({
        password: 'Segur@123!',
        confirmPassword: 'Diferente@1',
      });
      expect(r.success).toBe(false);
    });
  });
});
