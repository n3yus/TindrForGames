import { useState } from "react";
import { useGamePool } from "../hooks/useGamePool";
import { SwipeCard } from "../components/SwipeCard";
import { FilterPanel } from "../components/FilterPanel";
import { SkeletonCard } from "../components/SkeletonCard";
import { EmptyState } from "../components/EmptyState";
import { ApiKeyBanner } from "../components/ApiKeyBanner";
import { GameDetailModal } from "../components/GameDetailModal";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "../lib/cn";

/**
 * Swipe-Stapel-View.
 * Zeigt das aktuelle Spiel (Drag-fähig) und eine Vorschau der nächsten Karte im Hintergrund.
 */
export function HomePage() {
  const {
    current,
    next,
    status,
    error,
    filters,
    setFilters,
    handleSwipe,
    retry,
  } = useGamePool();

  const [filterOpen, setFilterOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const showSkeleton = status === "loading" || (status === "idle" && !current);
  const showError = status === "error";
  const showExhausted = status === "exhausted" && !current;
  const showIdle = status === "idle" && !current;
  const showCard = !!current;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] h-[calc(100dvh-5rem)] relative">
      {/* API-Key Warnung */}
      <ApiKeyBanner />

      {/* Filter Button (eigene Zeile, da Header jetzt in App.tsx ist) */}
      <div className="flex items-center justify-end px-4 pt-2 pb-1 shrink-0">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border border-zinc-700 hover:border-neon-cyan hover:text-neon-cyan text-zinc-300"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* Karten-Bereich (flexibel, begrenzte Höhe) */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-4">
        {/* Hintergrund-Karte (Vorschau der nächsten) — direkt hinter der Vorderkarte */}
        {next && (
          <div
            className="absolute w-[calc(100%-2rem)] max-w-sm h-full max-h-[640px] rounded-2xl bg-zinc-900/60 border border-zinc-800/60 scale-95 opacity-50 pointer-events-none -z-10"
            aria-hidden
          />
        )}

        {/* Aktuelle Karte (Klick auf Cover → Detail) */}
        {showCard && (
          <SwipeCard
            key={current!.id}
            game={current!}
            onSwipe={handleSwipe}
            onCoverClick={() => setDetailOpen(true)}
          />
        )}

        {/* Loading-Skeleton */}
        {showSkeleton && <SkeletonCard />}

        {/* Fehler */}
        {showError && (
          <EmptyState
            title="Fehler beim Laden"
            description={error ?? "Unbekannter API-Fehler."}
            action={{ label: "Erneut versuchen", onClick: retry }}
            action2={{ label: "Filter anpassen", onClick: () => setFilterOpen(true) }}
          />
        )}

        {/* Leerer Stapel */}
        {showExhausted && (
          <EmptyState
            title="Keine neuen Spiele mehr 🎮"
            description="Alle passenden Spiele durchswipet. Filter anpassen oder später wiederkommen."
            action={{ label: "Filter anpassen", onClick: () => setFilterOpen(true) }}
          />
        )}

        {/* Idle (keine Karte, kein Status) */}
        {showIdle && <p className="text-zinc-500 text-sm">Bereit.</p>}
      </div>

      {/* Action-Buttons (immer unter der Karte, eigene Zeile) */}
      {showCard && (
        <div className="shrink-0 flex items-center justify-center gap-6 py-3">
          <ActionButton
            label="Kenn ich schon"
            color="red"
            onClick={() => handleSwipe("right")}
            symbol="✕"
          />
          <ActionButton
            label="Merken"
            color="green"
            onClick={() => handleSwipe("left")}
            symbol="♥"
          />
        </div>
      )}

      {/* Filter Sheet */}
      <FilterPanel
        open={filterOpen}
        value={filters}
        onChange={setFilters}
        onClose={() => setFilterOpen(false)}
      />

      {/* Game Detail Modal */}
      <GameDetailModal
        game={detailOpen ? current : null}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  color: "red" | "green";
  onClick: () => void;
  symbol: string;
}

function ActionButton({ label, color, onClick, symbol }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition active:scale-90 select-none",
        color === "red"
          ? "border-neon-red text-neon-red hover:bg-neon-red/10"
          : "border-neon-green text-neon-green hover:bg-neon-green/10"
      )}
    >
      {symbol}
    </button>
  );
}
