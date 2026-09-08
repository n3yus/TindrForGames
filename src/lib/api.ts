import type { Filters, Game } from "./types";
import type { IgdbGame, IgdbGenre, IgdbPlatform } from "./types";

// Direkte IGDB-API (GitHub Pages hat keinen lokalen Proxy)
const IGDB_BASE = "https://api.igdb.com/v4";

export class IgdbApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "IgdbApiError";
    this.status = status;
  }
}

function getCredentials(): { clientId: string; clientSecret: string } {
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new IgdbApiError(
      "Twitch-Credentials fehlen. Lege eine .env-Datei an und trage VITE_TWITCH_CLIENT_ID und VITE_TWITCH_CLIENT_SECRET ein."
    );
  }
  return { clientId, clientSecret };
}

// Token direkt von Twitch holen (client_secret ist im Build eingebaut)
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getTwitchToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && tokenExpiresAt > now + 300_000) {
    return cachedToken;
  }

  const { clientId, clientSecret } = getCredentials();
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new IgdbApiError(`Twitch Token fehlgeschlagen: ${text}`, res.status);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiresAt = now + data.expires_in * 1000;
  return data.access_token;
}

/**
 * Tauscht die IGDB-Größe im URL-Pfad aus. Default ist t_thumb (winzig).
 * Verfügbare Größen: t_thumb, t_cover_small, t_cover_big, t_720p, t_1080p
 */
function upgradeImageSize(url: string, size: "t_cover_big" | "t_720p" | "t_1080p"): string {
  return url.replace(/\/t_(thumb|cover_small|cover_big|720p|1080p)\//, `/${size}/`);
}

/**
 * Konvertiert einen Unix-Timestamp (Sekunden) in YYYY-MM-DD.
 */
function timestampToDateString(ts: number | null | undefined): string | null {
  if (!ts) return null;
  const ms = ts * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Mappt ein IGDB-Game auf das vereinfachte Game-Format der UI.
 */
function mapGame(g: IgdbGame): Game {
  const releaseDate = timestampToDateString(g.first_release_date);
  // Cover: t_720p (HD, 1280x720) — wird im Browser sauber runterskaliert
  // und bleibt scharf, auch wenn das Cover als Hero angezeigt wird.
  const coverUrl = g.cover?.url
    ? `https:${upgradeImageSize(g.cover.url, "t_720p")}`
    : null;
  return {
    id: g.id,
    title: g.name,
    cover: coverUrl,
    released: releaseDate,
    year: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
    // IGDB rating ist 0-100, wir normalisieren auf 0-5
    rating: g.rating ? Math.round((g.rating / 100) * 5 * 10) / 10 : 0,
    // IGDB hat kein Metacritic, aber aggregated_rating → 0-100
    metacritic: g.aggregated_rating ? Math.round(g.aggregated_rating) : null,
    // IGDB hat keine playtime/pro_playtime → auf 0 setzen
    playtime: 0,
    genres: g.genres?.map((x) => x.name) ?? [],
    platforms: g.platforms?.map((x) => x.name) ?? [],
    // Screenshots: t_720p (HD-Auflösung)
    screenshots:
      g.screenshots?.map((s) =>
        s.url ? `https:${upgradeImageSize(s.url, "t_720p")}` : ""
      ).filter(Boolean) ?? [],
  };
}

/**
 * Baut die IGDB-Where-Klausel aus den Filtern.
 */
function buildWhereClause(filters: Filters): string {
  const parts: string[] = [];

  if (filters.genreIds.length) {
    parts.push(`genres = (${filters.genreIds.join(",")})`);
  }
  if (filters.platformIds.length) {
    parts.push(`platforms = (${filters.platformIds.join(",")})`);
  }

  const fromYear = filters.yearFrom ?? 1980;
  const toYear = filters.yearTo ?? new Date().getFullYear();
  // IGDB expects Unix timestamps; 1980-01-01 = 315532800, end of year
  const fromTs = Math.floor(new Date(`${fromYear}-01-01T00:00:00Z`).getTime() / 1000);
  const toTs = Math.floor(new Date(`${toYear}-12-31T23:59:59Z`).getTime() / 1000);
  // first_release_date != null schließt Spiele ohne Releasedatum aus
  parts.push(`first_release_date != null`);
  parts.push(`first_release_date >= ${fromTs}`);
  parts.push(`first_release_date <= ${toTs}`);

  if (filters.search.trim()) {
    const term = filters.search.trim().replace(/"/g, "");
    parts.push(`name ~ "${term}"`);
  }

  return parts.join(" & ");
}

interface IgdbListResponse<T> {
  // IGDB liefert direkt ein Array, kein {results, count}-Objekt.
  // Wir wrappen es hier, damit der Code mit dem Array arbeiten kann.
  // Für Pagination behalten wir die Gesamtzahl separat.
  results: T[];
  count: number;
}

async function igdbRequest<T>(
  endpoint: string,
  body: string
): Promise<IgdbListResponse<T>> {
  const token = await getTwitchToken();
  const { clientId } = getCredentials();

  const res = await fetch(`${IGDB_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    },
    body,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new IgdbApiError("Authentifizierung fehlgeschlagen. Prüfe Client ID und Secret.", 401);
    }
    if (res.status === 429) {
      throw new IgdbApiError("API-Limit erreicht. Bitte später erneut versuchen.", 429);
    }
    throw new IgdbApiError(`IGDB-Fehler: ${res.statusText}`, res.status);
  }

  // IGDB gibt ein rohes Array zurück (kein {results, count}-Objekt)
  const data = await res.json() as T[];
  // IGDB setzt X-Count als Header für die Gesamtzahl
  const countHeader = res.headers.get("x-count");
  const count = countHeader ? parseInt(countHeader, 10) : data.length;
  return { results: data, count };
}

export interface FetchGamesResult {
  games: Game[];
  nextOffset: number | null;
  hasMore: boolean;
}

const PAGE_SIZE = 20;
const GAME_FIELDS = `
  id, name, slug, first_release_date, rating, rating_count,
  aggregated_rating, aggregated_rating_count, category, game_type,
  cover.url, genres.name, platforms.name,
  involved_companies.company.name,
  involved_companies.developer, involved_companies.publisher,
  screenshots.url
`;

/**
 * Holt eine Seite von Spielen, gemappt auf das Game-Format.
 * Nutzt `first_release_date` statt `released`, weil es zuverlässiger gefüllt ist.
 */
export async function fetchGames(
  filters: Filters,
  pageSize = PAGE_SIZE,
  offset = 0
): Promise<FetchGamesResult> {
  const where = buildWhereClause(filters);
  // IGDB Limit ist 1-500, Sortierung nach erstem Release-Datum absteigend
  const body = `fields ${GAME_FIELDS}; where ${where}; sort first_release_date desc; limit ${pageSize}; offset ${offset};`;

  const data = await igdbRequest<IgdbGame>("/games", body);
  const games = data.results.map(mapGame);
  const nextOffset = offset + games.length < data.count ? offset + pageSize : null;

  return {
    games,
    nextOffset,
    hasMore: nextOffset !== null,
  };
}

/**
 * Folgt der nächsten "Seite" über Offset-Pagination.
 */
export async function fetchNextPage(
  filters: Filters,
  offset: number
): Promise<FetchGamesResult> {
  return fetchGames(filters, PAGE_SIZE, offset);
}

export async function fetchGenres(): Promise<{ id: number; name: string }[]> {
  const body = `fields id, name; sort name asc; limit 50;`;
  const data = await igdbRequest<IgdbGenre>("/genres", body);
  return data.results;
}

export async function fetchPlatforms(): Promise<{ id: number; name: string }[]> {
  const body = `fields id, name; sort name asc; limit 100;`;
  const data = await igdbRequest<IgdbPlatform>("/platforms", body);
  return data.results;
}
