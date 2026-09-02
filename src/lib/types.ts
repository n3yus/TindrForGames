// RAWG API Response Types + abgeleitete UI-Typen

export interface RawgPlatformSlot {
  platform: { id: number; name: string; slug: string };
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGame {
  id: number;
  name: string;
  slug: string;
  released: string | null;
  background_image: string | null;
  rating: number;          // 0-5 (RAWG)
  rating_top: number;
  metacritic: number | null;
  playtime: number;        // Stunden
  genres: RawgGenre[];
  platforms: RawgPlatformSlot[];
  short_screenshots?: { id: number; image: string }[];
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Vereinfachte Game-Form, mit der die UI arbeitet
export interface Game {
  id: number;
  title: string;
  cover: string | null;
  released: string | null;     // YYYY-MM-DD
  year: number | null;
  rating: number;              // 0-5
  metacritic: number | null;
  playtime: number;            // Stunden
  genres: string[];
  platforms: string[];
  screenshots: string[];
}

export interface Filters {
  genreIds: number[];
  platformIds: number[];
  yearFrom: number | null;
  yearTo: number | null;
  search: string;
}

export const DEFAULT_FILTERS: Filters = {
  genreIds: [],
  platformIds: [],
  yearFrom: 1980,
  yearTo: new Date().getFullYear(),
  search: "",
};
