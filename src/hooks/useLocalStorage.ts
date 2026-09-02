import { useState, useCallback } from "react";

/**
 * Wrapper um window.localStorage mit TypeScript-Support.
 * Liest initial aus dem Storage, schreibt atomar zurück.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      console.warn(`[useLocalStorage] Lesefehler für Key "${key}", nutze Default.`);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(next);
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        console.warn(`[useLocalStorage] Schreibfehler für Key "${key}".`);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}
