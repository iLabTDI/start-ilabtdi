export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_OPTIONS: Array<{ value: ThemeMode; label: string }> = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Sistema' },
];

export const DEFAULT_THEME: ThemeMode = 'dark';
