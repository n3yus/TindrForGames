import { useState, useCallback, useEffect } from "react";

/**
 * Bus für localStorage-Änderungen. Wird im gleichen Tab ausgelöst,
 * damit mehrere Komponenten, die denselben Key lesen, synchron bleiben.
 * (Native 'storage'-Events feuern nur über Browser-Tabs hinweg.)
 */
const listeners = new Map<string, Set<() => void>>();

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

/** Andere Hook-Instanzen über eine Änderung informieren. */
function emitKeyUpdate(key: string) {
  notify(key);
}

/**
 * Wrapper um window.localStorage mit TypeScript-Support.
 * Liest initial aus dem Storage, schreibt atomar zurück und benachrichtigt
 * alle anderen Hook-Instanzen, die denselben Key beobachten.
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

  // Auf Updates von anderen Hook-Instanzen reagieren
  useEffect(() => {
    const onUpdate = () => {
      try {
        const item = window.localStorage.getItem(key);
        const next = item !== null ? (JSON.parse(item) as T) : initialValue;
        setStoredValue(next);
      } catch {
        // Ignorieren — kein konsistenter State
      }
    };
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(onUpdate);
    return () => {
      listeners.get(key)?.delete(onUpdate);
    };
  }, [key, initialValue]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const next = value instanceof Function ? value(prev) : value;
          try {
            window.localStorage.setItem(key, JSON.stringify(next));
          } catch {
            console.warn(`[useLocalStorage] Schreibfehler für Key "${key}".`);
          }
          // Andere Instanzen benachrichtigen (nach dem setItem, damit sie den neuen Wert lesen)
          emitKeyUpdate(key);
          return next;
        });
      } catch {
        console.warn(`[useLocalStorage] Setter-Fehler für Key "${key}".`);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
