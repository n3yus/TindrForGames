import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Calendar, Clock, Gamepad2, Heart, ExternalLink, Tag } from "lucide-react";
import type { Game } from "../lib/types";

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
  onSwipe?: (direction: "left" | "right") => void;
}

/**
 * Baut einen Steam-Such-URL für den Spieltitel.
 * Steam leitet dann auf den richtigen Store-Eintrag weiter.
 */
function steamSearchUrl(title: string): string {
  return `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`;
}

/**
 * Detail-Ansicht für ein Spiel.
 * Wird per Klick auf das Cover in der SavedPage oder per Klick auf
 * die Karte in der HomePage geöffnet.
 */
export function GameDetailModal({ game, onClose, onSwipe }: GameDetailModalProps) {
  const [screenshotIdx, setScreenshotIdx] = useState(0);

  // Tastatursteuerung
  useEffect(() => {
    if (!game) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (onSwipe && e.key === "ArrowLeft") onSwipe("right");
      if (onSwipe && e.key === "ArrowRight") onSwipe("left");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [game, onClose, onSwipe]);

  // Cover-URL auf HD upgraden (t_1080p wenn verfügbar)
  const hdCover = game?.cover
    ? game.cover.replace(/\/t_(thumb|cover_small|cover_big|720p|1080p)\//, "/t_1080p/")
    : null;

  const screenshots = game?.screenshots ?? [];
  const activeScreenshot = screenshots[screenshotIdx];

  return (
    <AnimatePresence>
      {game && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-h-full max-w-2xl mx-auto bg-zinc-950">
              {/* Hero-Cover */}
              <div className="relative h-64 sm:h-80 bg-zinc-800">
                {hdCover ? (
                  <img
                    src={hdCover}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                    Kein Cover
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

                {/* Close-Button */}
                <button
                  onClick={onClose}
                  aria-label="Schließen"
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-zinc-200 hover:text-white hover:bg-black/80 transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Metacritic-Badge */}
                {game.metacritic !== null && (
                  <div
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-sm font-bold border ${
                      game.metacritic >= 75
                        ? "bg-neon-green/20 text-neon-green border-neon-green/50"
                        : game.metacritic >= 50
                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                        : "bg-neon-red/20 text-neon-red border-neon-red/50"
                    }`}
                  >
                    {game.metacritic}
                  </div>
                )}

                {/* Titel im Hero */}
                <div className="absolute bottom-0 inset-x-0 p-5">
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white drop-shadow-lg">
                    {game.title}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Meta-Zeile */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300">
                  {game.year !== null && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-zinc-500" /> {game.year}
                    </span>
                  )}
                  {game.rating > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{game.rating.toFixed(1)}</span>
                      <span className="text-zinc-500">/ 5</span>
                    </span>
                  )}
                  {game.playtime > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-zinc-500" /> {game.playtime}h
                    </span>
                  )}
                  {game.released && (
                    <span className="text-xs text-zinc-500">
                      Released: {game.released}
                    </span>
                  )}
                </div>

                {/* Genres */}
                {game.genres.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Genres
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {game.genres.map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-neon-purple/15 text-neon-purple border border-neon-purple/30"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Plattformen */}
                {game.platforms.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Gamepad2 className="w-3.5 h-3.5" /> Verfügbar auf
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {game.platforms.map((p) => (
                        <span
                          key={p}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Kaufpreis / Steam-Link */}
                <section>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Kaufen
                  </h3>
                  <a
                    href={steamSearchUrl(game.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-zinc-800/70 border border-zinc-700 hover:border-neon-cyan/50 hover:bg-zinc-800 transition group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 w-7 h-7 rounded-md bg-gradient-to-br from-[#1b2838] to-[#2a475e] flex items-center justify-center text-[10px] font-bold text-white">
                        ST
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zinc-100">Auf Steam ansehen</p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          Aktueller Preis & Deals
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-neon-cyan transition shrink-0" />
                  </a>
                </section>

                {/* Screenshots */}
                {screenshots.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                      Screenshots
                    </h3>
                    <div className="space-y-3">
                      <div className="rounded-xl overflow-hidden bg-zinc-800">
                        <img
                          src={activeScreenshot}
                          alt={`Screenshot ${screenshotIdx + 1}`}
                          className="w-full h-auto"
                        />
                      </div>
                      {screenshots.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {screenshots.map((s, i) => (
                            <button
                              key={s + i}
                              onClick={() => setScreenshotIdx(i)}
                              className={`shrink-0 w-20 h-12 rounded-md overflow-hidden border-2 transition ${
                                i === screenshotIdx
                                  ? "border-neon-pink"
                                  : "border-zinc-800 opacity-60 hover:opacity-100"
                              }`}
                            >
                              <img
                                src={s}
                                alt={`Thumbnail ${i + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* Actions */}
                {onSwipe && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => onSwipe("right")}
                      className="flex-1 py-3 rounded-xl font-bold bg-neon-red/20 text-neon-red border border-neon-red/40 hover:bg-neon-red/30 transition"
                    >
                      Kenn ich schon
                    </button>
                    <button
                      onClick={() => onSwipe("left")}
                      className="flex-1 py-3 rounded-xl font-bold bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30 transition"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-neon-green" /> Merken
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
