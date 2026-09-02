import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { fetchGames, fetchNextPage, IgdbApiError } from "../lib/api";
import { DEFAULT_FILTERS, type Filters, type Game } from "../lib/types";

const SEEN_KEY = "tfg.seenIds";
const SAVED_KEY = "tfg.savedIds";
const GAME_CACHE_KEY = "tfg.gameCache";
const PAGE_SIZE = 20;
const PREFETCH_THRESHOLD = 3; // Wenn weniger als 3 Karten übrig → nachladen

/** Liest den Game-Cache aus localStorage. */
function readGameCache(): Record<number, Game> {
  try {
    const raw = localStorage.getItem(GAME_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, Game>) : {};
  } catch {
    return {};
  }
}

/** Schreibt ein Batch Games in den Cache. */
function writeGameCache(games: Game[]) {
  try {
    const cache = readGameCache();
    for (const g of games) cache[g.id] = g;
    localStorage.setItem(GAME_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full oder nicht verfügbar — ignorieren
  }
}

export type LoadStatus = "idle" | "loading" | "error" | "exhausted";

interface UseGamePoolReturn {
  /** Aktuelle (oberste) Karte. */
  current: Game | null;
  /** Nächste Karte (für Stack-Vorschau). */
  next: Game | null;
  /** Status der aktuellen Pool-Ladung. */
  status: LoadStatus;
  /** Fehlermeldung, falls status === "error". */
  error: string | null;
  /** Aktive Filter. */
  filters: Filters;
  setFilters: (f: Filters) => void;
  /** Gesehene Spiele (alle Swipes). */
  seenIds: number[];
  /** Gemerkte Spiele (nur Links-Swipes). */
  savedIds: number[];
  /** Swipe-Handler. */
  handleSwipe: (direction: "left" | "right") => void;
  /** Entfernt ein Spiel aus der Merkliste (für SavedPage). */
  removeFromSaved: (id: number) => void;
  /** Entfernt ein Spiel aus der Gesehen-Liste (für SeenPage). */
  removeFromSeen: (id: number) => void;
  /** Manueller Retry. */
  retry: () => void;
  /** Vollständige Reset-Funktion (z. B. "Filter zurücksetzen"). */
  resetAll: () => void;
}

/**
 * Zentraler Game-Pool mit:
 *  - LocalStorage-Persistenz für gesehen/gemerkt
 *  - IGDB-Pagination im Hintergrund
 *  - Dedup gegen bereits gesehene/gemerkte Spiele
 *  - Filter-Wechsel setzt den Pool zurück (behält seen/saved)
 */
export function useGamePool(): UseGamePoolReturn {
  const [seenIds, setSeenIds] = useLocalStorage<number[]>(SEEN_KEY, []);
  const [savedIds, setSavedIds] = useLocalStorage<number[]>(SAVED_KEY, []);
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);

  // Pool + Index
  const [pool, setPool] = useState<Game[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Pagination-Refs (IGDB nutzt Offset statt URL)
  const nextOffsetRef = useRef<number | null>(null);
  const loadingMoreRef = useRef(false);
  const inFlightRef = useRef(false);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // --- Hilfsfunktionen ---------------------------------------------------

  const seenSet = new Set(seenIds);

  const filterFresh = useCallback(
    (games: Game[]): { fresh: Game[]; dropped: number } => {
      const fresh = games.filter((g) => !seenSet.has(g.id));
      return { fresh, dropped: games.length - fresh.length };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seenIds.join(",")]
  );

  // --- Loading -----------------------------------------------------------

  const loadFirstPage = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setPool([]);
    setIndex(0);
    nextOffsetRef.current = null;
    inFlightRef.current = true;

    try {
      // Mehrere Pages laden, bis wir frische Karten haben oder exhausted sind.
      // Vermeidet "Bereit." direkt nach Reset, wenn die ersten 20 IGDB-Treffer
      // bereits alle in seenIds sind.
      const allFresh: Game[] = [];
      let hasMore = true;
      let offset = 0;
      const MAX_PAGES = 3;

      for (let i = 0; i < MAX_PAGES && hasMore; i++) {
        const result = await fetchGames(filtersRef.current, PAGE_SIZE, offset);
        writeGameCache(result.games);
        const { fresh } = filterFresh(result.games);
        allFresh.push(...fresh);
        if (fresh.length > 0) {
          // Genug frische Karten gefunden — hier aufhören.
          hasMore = result.hasMore;
          nextOffsetRef.current = result.nextOffset;
          break;
        }
        // Alle Spiele der Page waren schon gesehen → nächste Page versuchen.
        hasMore = result.hasMore;
        if (hasMore) {
          offset = result.nextOffset ?? offset + PAGE_SIZE;
          nextOffsetRef.current = result.nextOffset;
        }
      }

      setPool(allFresh);
      setStatus(hasMore && nextOffsetRef.current !== null ? "idle" : "exhausted");
    } catch (e) {
      const msg = e instanceof IgdbApiError
        ? e.message
        : e instanceof Error
          ? `API-Fehler: ${e.message}`
          : "Unbekannter API-Fehler";
      console.error("[useGamePool] loadFirstPage error:", e);
      setError(msg);
      setStatus("error");
    } finally {
      inFlightRef.current = false;
    }
  }, [filterFresh]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || inFlightRef.current) return;
    if (nextOffsetRef.current === null) return;
    if (pool.length - index > PREFETCH_THRESHOLD) return;

    loadingMoreRef.current = true;
    try {
      const result = await fetchNextPage(filtersRef.current, nextOffsetRef.current);
      const { fresh } = filterFresh(result.games);
      writeGameCache(result.games);
      nextOffsetRef.current = result.nextOffset;
      setPool((prev) => [...prev, ...fresh]);
      if (!result.hasMore) setStatus("exhausted");
    } catch (e) {
      const msg = e instanceof IgdbApiError ? e.message : "Nachladen fehlgeschlagen";
      setError(msg);
      setStatus("error");
    } finally {
      loadingMoreRef.current = false;
    }
  }, [filterFresh, index, pool.length]);

  // --- Initial Load + Filter-Wechsel -------------------------------------

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // --- Prefetch -----------------------------------------------------------

  useEffect(() => {
    if (status === "exhausted" || status === "error") return;
    if (pool.length - index <= PREFETCH_THRESHOLD) {
      loadMore();
    }
  }, [index, pool.length, status, loadMore]);

  // --- Swipe-Handler -----------------------------------------------------

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      const game = pool[index];
      if (!game) return;

      setSeenIds((prev) => (prev.includes(game.id) ? prev : [...prev, game.id]));
      if (direction === "left") {
        setSavedIds((prev) => (prev.includes(game.id) ? prev : [...prev, game.id]));
      }
      setIndex((i) => i + 1);
    },
    [index, pool, setSeenIds, setSavedIds]
  );

  // --- Saved-Liste-Verwaltung --------------------------------------------

  const removeFromSaved = useCallback(
    (id: number) => {
      setSavedIds((prev) => prev.filter((x) => x !== id));
    },
    [setSavedIds]
  );

  const removeFromSeen = useCallback(
    (id: number) => {
      setSeenIds((prev) => prev.filter((x) => x !== id));
    },
    [setSeenIds]
  );

  // --- Filter setzen + Reset --------------------------------------------

  const setFilters = useCallback((f: Filters) => {
    setFiltersState(f);
  }, []);

  const resetAll = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSeenIds([]);
    setSavedIds([]);
  }, [setSeenIds, setSavedIds]);

  const retry = useCallback(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // --- Aktuelle Karte ----------------------------------------------------

  const current = pool[index] ?? null;
  const next = pool[index + 1] ?? null;

  return {
    current,
    next,
    status,
    error,
    filters,
    setFilters,
    seenIds,
    savedIds,
    handleSwipe,
    removeFromSaved,
    removeFromSeen,
    retry,
    resetAll,
  };
}
