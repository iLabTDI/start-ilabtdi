import { z } from 'zod';
import { PASSWORD_MIN_LENGTH, FULL_NAME_MAX_LENGTH } from '@/lib/constants';

const emailSchema = z
  .string()
  .trim()
  .min(1, 'El correo es obligatorio')
  .email('Correo no válido');

const strongPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(128, 'Máximo 128 caracteres')
  .refine((v) => /[a-z]/.test(v), 'Incluye al menos una minúscula')
  .refine((v) => /[A-Z]/.test(v), 'Incluye al menos una mayúscula')
  .refine((v) => /\d/.test(v), 'Incluye al menos un número')
  .refine((v) => /[^A-Za-z0-9]/.test(v), 'Incluye al menos un símbolo');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'El nombre es muy corto')
      .max(FULL_NAME_MAX_LENGTH, `Máximo ${FULL_NAME_MAX_LENGTH} caracteres`),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: 'Debes aceptar los términos' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
