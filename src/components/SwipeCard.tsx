import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Heart, X, Star, Calendar, Gamepad2, Clock } from "lucide-react";
import type { Game } from "../lib/types";
import { cn } from "../lib/cn";

interface SwipeCardProps {
  game: Game;
  onSwipe: (direction: "left" | "right") => void;
  /** Pixel, ab denen ein Swipe zählt (Default 75). */
  threshold?: number;
}

/**
 * Tinder-ähnliche Spielkarte mit Drag-Geste (Framer Motion).
 * - Drag horizontal → Rotation folgt der Bewegung
 * - Linkes/rechtes Overlay fadet je nach Richtung ein
 * - Beim Loslassen: Animation raus aus dem Bildschirm, dann onSwipe-Callback
 */
export function SwipeCard({ game, onSwipe, threshold = 75 }: SwipeCardProps) {
  const x = useMotionValue(0);
  const [exiting, setExiting] = useState<null | "left" | "right">(null);

  // Rotation: -12° (links) bis +12° (rechts) bei vollem Ausschlag
  const rotate = useTransform(x, [-200, 0, 200], [-12, 0, 12]);

  // Overlay-Opacities
  const greenOpacity = useTransform(x, [0, 150], [0, 0.55], { clamp: true });
  const redOpacity = useTransform(x, [-150, 0], [0.55, 0], { clamp: true });

  // Like/Nope-Indikator-Skalierung
  const likeScale = useTransform(x, [0, 80, 150], [0, 0.7, 1], { clamp: true });
  const nopeScale = useTransform(x, [-150, -80, 0], [1, 0.7, 0], { clamp: true });

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (exiting) return;
    if (info.offset.x > threshold || info.velocity.x > 600) {
      setExiting("right");
    } else if (info.offset.x < -threshold || info.velocity.x < -600) {
      setExiting("left");
    }
  };

  // Sobald die Exit-Animation durch ist → Callback an Parent
  const handleExitComplete = () => {
    if (exiting) onSwipe(exiting);
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center p-4 select-none cursor-grab active:cursor-grabbing"
      drag={exiting ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      style={{ x, rotate, touchAction: "pan-y" }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1, opacity: 1 }}
      animate={
        exiting === "right"
          ? { x: 600, y: 100, rotate: 30, opacity: 0, transition: { duration: 0.35 } }
          : exiting === "left"
          ? { x: -600, y: 100, rotate: -30, opacity: 0, transition: { duration: 0.35 } }
          : { x: 0, y: 0, rotate: 0, opacity: 1 }
      }
      onAnimationComplete={handleExitComplete}
    >
      <article className="relative w-full max-w-sm h-[70vh] max-h-[640px] rounded-2xl overflow-hidden glass shadow-2xl shadow-neon-purple/10">
        {/* Cover */}
        <div className="relative h-2/3 w-full bg-zinc-800">
          {game.cover ? (
            <img
              src={game.cover}
              alt={game.title}
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
              Kein Cover
            </div>
          )}
          {/* Gradient unten für Lesbarkeit */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-900 to-transparent" />

          {/* Metacritic / Rating Badge */}
          {game.metacritic !== null && (
            <div
              className={cn(
                "absolute top-3 right-3 px-2.5 py-1 rounded-md text-sm font-bold border",
                game.metacritic >= 75
                  ? "bg-neon-green/20 text-neon-green border-neon-green/50"
                  : game.metacritic >= 50
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                  : "bg-neon-red/20 text-neon-red border-neon-red/50"
              )}
            >
              {game.metacritic}
            </div>
          )}

          {/* Like / Nope-Indikatoren (drehen sich beim Wischen rein) */}
          <motion.div
            style={{ scale: likeScale, opacity: likeScale }}
            className="absolute top-6 left-6 px-3 py-1.5 rounded-md border-2 border-neon-green text-neon-green font-extrabold text-2xl tracking-widest -rotate-12"
          >
            <span className="flex items-center gap-1">
              <Heart className="w-5 h-5 fill-neon-green" /> MERKEN
            </span>
          </motion.div>
          <motion.div
            style={{ scale: nopeScale, opacity: nopeScale }}
            className="absolute top-6 right-6 px-3 py-1.5 rounded-md border-2 border-neon-red text-neon-red font-extrabold text-2xl tracking-widest rotate-12"
          >
            <span className="flex items-center gap-1">
              <X className="w-5 h-5" /> KENN ICH
            </span>
          </motion.div>

          {/* Farb-Overlays (grün/rechts, rot/links) */}
          <motion.div
            style={{ opacity: greenOpacity }}
            className="absolute inset-0 bg-neon-green mix-blend-overlay pointer-events-none"
          />
          <motion.div
            style={{ opacity: redOpacity }}
            className="absolute inset-0 bg-neon-red mix-blend-overlay pointer-events-none"
          />
        </div>

        {/* Body */}
        <div className="h-1/3 p-4 flex flex-col gap-2 bg-zinc-900/95">
          <h2 className="text-xl font-bold leading-tight line-clamp-1">{game.title}</h2>

          <div className="flex items-center gap-3 text-xs text-zinc-400">
            {game.year !== null && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {game.year}
              </span>
            )}
            {game.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                {game.rating.toFixed(1)}
              </span>
            )}
            {game.playtime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {game.playtime}h
              </span>
            )}
          </div>

          {game.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {game.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-neon-purple/15 text-neon-purple border border-neon-purple/30"
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {game.platforms.length > 0 && (
            <div className="mt-auto flex items-center gap-1.5 text-xs text-zinc-400">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span className="line-clamp-1">{game.platforms.slice(0, 4).join(" · ")}</span>
            </div>
          )}
        </div>
      </article>
    </motion.div>
  );
}
