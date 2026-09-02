import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook für plattformübergreifende Datensynchronisation.
 *
 * - Wenn der User eingeloggt ist, werden Änderungen an savedIds/seenIds
 *   automatisch in Firestore geschrieben (offline-safe).
 * - Änderungen in Firestore (z. B. von einem anderen Gerät) werden
 *   in localStorage übernommen.
 * - Ohne Login wird localStorage weiterhin normal genutzt (kein Sync).
 */
export function useUserData() {
  const { user, loading, syncData } = useAuth();
  const isWritingRef = useRef(false);

  // Optional: bei Änderung der localStorage-Daten → Firestore synchronisieren
  // (nur wenn User eingeloggt)
  useEffect(() => {
    if (!user || loading) return;

    // Initiale Synchronisierung mit aktuellen localStorage-Daten
    const initialSaved = readArray("tfg.savedIds");
    const initialSeen = readArray("tfg.seenIds");

    isWritingRef.current = true;
    syncData(initialSaved, initialSeen).finally(() => {
      setTimeout(() => {
        isWritingRef.current = false;
      }, 100);
    });
  }, [user, loading, syncData]);

  // Manuell ausgelöster Sync, z. B. nach mehreren Swipes
  const syncNow = useCallback(async () => {
    if (!user) return;
    const saved = readArray("tfg.savedIds");
    const seen = readArray("tfg.seenIds");
    isWritingRef.current = true;
    try {
      await syncData(saved, seen);
    } finally {
      setTimeout(() => {
        isWritingRef.current = false;
      }, 100);
    }
  }, [user, syncData]);

  return { user, syncNow };
}

function readArray(key: string): number[] {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}
