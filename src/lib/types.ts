// IGDB API Response Types + abgeleitete UI-Typen

// IGDB Platform
export interface IgdbPlatform {
  id: number;
  name: string;
  slug: string;
}

// IGDB Genre (hier "Game Mode" oder Category-Feld)
export interface IgdbGenre {
  id: number;
  name: string;
}

// Vollständiges IGDB Game-Objekt (von /games mit expand)
export interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  first_release_date: number | null; // Unix timestamp in Sekunden
  cover: {
    id: number;
    url: string;                 // "//images.igdb.com/..." → muss mit https:// ergänzt werden
  } | null;
  rating: number;               // 0-100 (IGDB)
  rating_count: number;
  aggregated_rating: number | null;
  aggregated_rating_count: number | null;
  genres: IgdbGenre[];
  platforms: IgdbPlatform[];
  involved_companies?: {
    id: number;
    company: { id: number; name: string };
    developer: boolean;
    publisher: boolean;
  }[];
  screenshots?: {
    id: number;
    url: string;
  }[];
  category: number;             // 0=main_game, 1=dlc, 2=expansion, etc.
  game_type?: number;           // 0=game, 1=expansion, 2=bundle, etc.
}

// Vereinfachte Game-Form, mit der die UI arbeitet
export interface Game {
  id: number;
  title: string;
  cover: string | null;
  released: string | null;     // YYYY-MM-DD
  year: number | null;
  rating: number;             // 0-5 (umgerechnet von IGDB 0-100)
  metacritic: number | null;
  playtime: number;           // Stunden (umgerechnet von Sekunden)
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
