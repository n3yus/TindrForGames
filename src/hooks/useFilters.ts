import { useEffect, useState } from "react";
import { fetchGenres, fetchPlatforms } from "../lib/api";

export interface GenreOption { id: number; name: string }
export interface PlatformOption { id: number; name: string }

/**
 * Lädt Genre- und Plattformlisten einmalig (beim Mount).
 * Nutzt sessionStorage als kurzlebigen Cache (24h TTL).
 */
export function useFilterOptions() {
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Stunden

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // Genre-Cache prüfen
        const gCached = sessionStorage.getItem("tfg.genres");
        if (gCached) {
          const { data, ts } = JSON.parse(gCached);
          if (Date.now() - ts < CACHE_TTL) {
            setGenres(data);
          } else {
            const fresh = await fetchGenres();
            sessionStorage.setItem("tfg.genres", JSON.stringify({ data: fresh, ts: Date.now() }));
            setGenres(fresh);
          }
        } else {
          const fresh = await fetchGenres();
          sessionStorage.setItem("tfg.genres", JSON.stringify({ data: fresh, ts: Date.now() }));
          setGenres(fresh);
        }

        // Platform-Cache prüfen
        const pCached = sessionStorage.getItem("tfg.platforms");
        if (pCached) {
          const { data, ts } = JSON.parse(pCached);
          if (Date.now() - ts < CACHE_TTL) {
            setPlatforms(data);
          } else {
            const fresh = await fetchPlatforms();
            sessionStorage.setItem("tfg.platforms", JSON.stringify({ data: fresh, ts: Date.now() }));
            setPlatforms(fresh);
          }
        } else {
          const fresh = await fetchPlatforms();
          sessionStorage.setItem("tfg.platforms", JSON.stringify({ data: fresh, ts: Date.now() }));
          setPlatforms(fresh);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Filter konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { genres, platforms, loading, error };
}
