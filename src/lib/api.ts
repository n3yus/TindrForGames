import type { Filters, Game } from "./types";
import type { RawgGame, RawgListResponse } from "./types";

const BASE_URL = "https://api.rawg.io/api";

export class RawgApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "RawgApiError";
    this.status = status;
  }
}

function getApiKey(): string {
  const key = import.meta.env.VITE_RAWG_API_KEY;
  if (!key || key === "rawg-your-api-key-here") {
    throw new RawgApiError(
      "RAWG API Key fehlt. Lege eine .env-Datei an und trage VITE_RAWG_API_KEY ein."
    );
  }
  return key;
}

function buildQuery(filters: Filters, pageSize = 20, page = 1): URLSearchParams {
  const p = new URLSearchParams();
  p.set("key", getApiKey());
  p.set("page_size", String(pageSize));
  p.set("page", String(page));
  p.set("ordering", "-released");

  if (filters.genreIds.length) p.set("genres", filters.genreIds.join(","));
  if (filters.platformIds.length) p.set("platforms", filters.platformIds.join(","));
  if (filters.search.trim()) p.set("search", filters.search.trim());

  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom ?? 1980;
    const to = filters.yearTo ?? new Date().getFullYear();
    p.set("dates", `${from}-01-01,${to}-12-31`);
  }

  return p;
}

function mapGame(g: RawgGame): Game {
  return {
    id: g.id,
    title: g.name,
    cover: g.background_image,
    released: g.released,
    year: g.released ? Number(g.released.slice(0, 4)) : null,
    rating: g.rating,
    metacritic: g.metacritic,
    playtime: g.playtime,
    genres: g.genres?.map((x) => x.name) ?? [],
    platforms: g.platforms?.map((x) => x.platform.name) ?? [],
    screenshots: g.short_screenshots?.map((s) => s.image) ?? [],
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new RawgApiError("Ungültiger API-Key.", res.status);
    }
    if (res.status === 429) {
      throw new RawgApiError("API-Limit erreicht. Bitte später erneut versuchen.", 429);
    }
    throw new RawgApiError(`API-Fehler: ${res.statusText}`, res.status);
  }
  return res.json() as Promise<T>;
}

export interface FetchGamesResult {
  games: Game[];
  nextUrl: string | null;
  hasMore: boolean;
}

/**
 * Holt eine Seite von Spielen, gemappt auf das Game-Format.
 * Liefert zusätzlich nextUrl (für Pagination) und hasMore.
 */
export async function fetchGames(
  filters: Filters,
  pageSize = 20,
  page = 1
): Promise<FetchGamesResult> {
  const params = buildQuery(filters, pageSize, page);
  const url = `${BASE_URL}/games?${params.toString()}`;
  const data = await fetchJson<RawgListResponse<RawgGame>>(url);
  return {
    games: data.results.map(mapGame),
    nextUrl: data.next,
    hasMore: !!data.next,
  };
}

/**
 * Folgt der `next`-URL direkt (spart Query-Construction).
 */
export async function fetchNextPage(nextUrl: string): Promise<FetchGamesResult> {
  // key muss mitgeschickt werden, da RAWG die URL nicht persistent speichert
  const key = getApiKey();
  const url = new URL(nextUrl);
  if (!url.searchParams.has("key")) url.searchParams.set("key", key);
  const data = await fetchJson<RawgListResponse<RawgGame>>(url.toString());
  return {
    games: data.results.map(mapGame),
    nextUrl: data.next,
    hasMore: !!data.next,
  };
}

export async function fetchGenres(): Promise<{ id: number; name: string }[]> {
  const params = new URLSearchParams({ key: getApiKey() });
  const data = await fetchJson<RawgListResponse<{ id: number; name: string }>>(
    `${BASE_URL}/genres?${params.toString()}`
  );
  return data.results;
}

export async function fetchPlatforms(): Promise<{ id: number; name: string }[]> {
  const params = new URLSearchParams({ key: getApiKey() });
  const data = await fetchJson<RawgListResponse<{ id: number; name: string }>>(
    `${BASE_URL}/platforms?${params.toString()}`
  );
  return data.results;
}
