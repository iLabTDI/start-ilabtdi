import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initialValue;
    } catch (err) {
      console.warn('useLocalStorage parse error', {
        key,
        err: err instanceof Error ? err.message : String(err),
      });
      return initialValue;
    }
  });

  const update = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (err) {
        console.warn('useLocalStorage write error', {
          key,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [key]
  );

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        setValue(e.newValue ? (JSON.parse(e.newValue) as T) : initialValue);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key, initialValue]);

  return [value, update];
}
