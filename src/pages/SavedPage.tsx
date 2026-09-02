import { useState } from "react";
import { Heart, X, Calendar, Star, Gamepad2 } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { GameDetailModal } from "../components/GameDetailModal";
import type { Game } from "../lib/types";

const SAVED_KEY = "tfg.savedIds";
const GAME_CACHE_KEY = "tfg.gameCache";

/**
 * Upgraded eine IGDB-Cover-URL auf eine HD-Version.
 * T_thumb (90x128) ist sehr unscharf — wir wollen t_720p für beste Qualität.
 */
function upgradeCover(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.replace(
    /\/(t_thumb|t_cover_small|t_cover_big|t_720p|t_1080p)\//,
    "/t_720p/"
  );
}

/**
 * Zeigt die gemerkten Spiele.
 * Die Detail-Infos kommen aus dem Game-Cache, den useGamePool beim
 * Laden der Karten befüllt. So sehen wir auch Titel/Cover, ohne die
 * IGDB API erneut anzufragen.
 */
export function SavedPage() {
  const [savedIds, setSavedIds] = useLocalStorage<number[]>(SAVED_KEY, []);
  const [gameCache] = useLocalStorage<Record<number, Game>>(GAME_CACHE_KEY, {});
  const [detailGame, setDetailGame] = useState<Game | null>(null);

  const remove = (id: number) =>
    setSavedIds((prev) => prev.filter((x) => x !== id));

  const removeFromDetail = () => {
    if (detailGame) {
      setSavedIds((prev) => prev.filter((x) => x !== detailGame.id));
      setDetailGame(null);
    }
  };

  return (
    <div className="min-h-full px-4 pt-4 pb-24">
      <header className="flex items-center gap-2 mb-4">
        <Heart className="w-6 h-6 text-neon-pink fill-neon-pink" />
        <h1 className="text-xl font-extrabold">
          <span className="text-neon-pink">Gemerkt</span>
        </h1>
        {savedIds.length > 0 && (
          <span className="ml-auto text-sm text-zinc-400">{savedIds.length} Spiele</span>
        )}
      </header>

      {savedIds.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {savedIds.map((id) => {
            const game = gameCache[id];
            const coverUrl = upgradeCover(game?.cover);
            return (
              <div
                key={id}
                className="relative rounded-xl overflow-hidden glass cursor-pointer hover:ring-2 hover:ring-neon-pink/40 transition"
                onClick={() => game && setDetailGame(game)}
              >
                <div className="h-36 bg-zinc-800 relative">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={game?.title ?? `Spiel #${id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 px-2 text-center">
                      <Gamepad2 className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">#{id}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(id);
                  }}
                  aria-label="Aus Merkliste entfernen"
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-zinc-400 hover:text-neon-red hover:bg-black/80 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div className="p-2">
                  <p className="text-sm font-semibold line-clamp-1 leading-tight">
                    {game?.title ?? `Spiel #${id}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-400">
                    {game?.year && (
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" /> {game.year}
                      </span>
                    )}
                    {game?.rating != null && game.rating > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{" "}
                        {game.rating.toFixed(1)}
                      </span>
                    )}
                    {game?.metacritic != null && (
                      <span className="flex items-center gap-0.5 text-neon-green">
                        M {game.metacritic}
                      </span>
                    )}
                  </div>
                  {game?.genres && game.genres.length > 0 && (
                    <p className="mt-1 text-[10px] text-neon-purple truncate">
                      {game.genres.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Game Detail Modal (mit "Aus Merkliste entfernen"-Action) */}
      <GameDetailModal
        game={detailGame}
        onClose={() => setDetailGame(null)}
        onSwipe={(_dir) => removeFromDetail()}
      />
    </div>
  );
}

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Heart className="w-16 h-16 text-zinc-700 mb-4" />
      <p className="text-zinc-400 font-medium mb-1">Noch nichts gemerkt.</p>
      <p className="text-zinc-600 text-sm">
        Swipe nach links um Spiele hier zu speichern.
      </p>
    </div>
  );
}
