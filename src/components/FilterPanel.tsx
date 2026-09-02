import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";
import { useFilterOptions } from "../hooks/useFilters";
import { DEFAULT_FILTERS, type Filters } from "../lib/types";
import { cn } from "../lib/cn";

interface FilterPanelProps {
  open: boolean;
  value: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}

const currentYear = new Date().getFullYear();

/**
 * Bottom-Sheet mit Filter-Optionen:
 *  - Genres (Multi-Select)
 *  - Plattformen (Multi-Select)
 *  - Erscheinungsjahr (Range)
 *  - "Neu vs. Alt"-Quick-Toggles
 *  - Suche nach Titel
 *
 * Änderungen werden erst beim "Anwenden"-Button an onChange übergeben,
 * damit das Pool-Reloading nicht bei jeder Tickle passiert.
 */
export function FilterPanel({ open, value, onChange, onClose }: FilterPanelProps) {
  const { genres, platforms, loading, error } = useFilterOptions();
  const [draft, setDraft] = useState<Filters>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const toggle = <K extends "genreIds" | "platformIds">(
    key: K,
    id: number
  ) => {
    setDraft((d) => {
      const list = d[key];
      return {
        ...d,
        [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
      };
    });
  };

  const apply = () => onChange(draft);
  const reset = () => setDraft(DEFAULT_FILTERS);

  // Quick-Toggle "Neu (letzte 5 Jahre)"
  const applyRecent = () =>
    setDraft({
      ...draft,
      yearFrom: currentYear - 5,
      yearTo: currentYear,
    });
  const applyClassic = () =>
    setDraft({
      ...draft,
      yearFrom: 1980,
      yearTo: currentYear - 10,
    });

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl glass shadow-2xl shadow-black/50"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 30 }}
          >
            {/* Grab handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="h-1 w-12 rounded-full bg-zinc-600" />
            </div>

            <header className="flex items-center justify-between px-4 pb-2 border-b border-zinc-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-neon-cyan" /> Filter
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="text-xs flex items-center gap-1 px-2 py-1 rounded-md text-zinc-400 hover:text-zinc-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="p-4 space-y-6">
              {/* Suche */}
              <section>
                <label className="text-sm font-semibold mb-2 block">Titel-Suche</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={draft.search}
                    onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                    placeholder="z. B. Zelda, Dark Souls …"
                    className="w-full pl-9 pr-3 py-2 rounded-md bg-zinc-800/80 border border-zinc-700 text-sm focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </section>

              {/* Quick Jahr-Toggles */}
              <section>
                <label className="text-sm font-semibold mb-2 block">Epoche</label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={applyRecent}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
                  >
                    Neu (letzte 5 Jahre)
                  </button>
                  <button
                    onClick={applyClassic}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10"
                  >
                    Klassiker (&gt; 10 Jahre)
                  </button>
                </div>
              </section>

              {/* Jahr-Range */}
              <section>
                <label className="text-sm font-semibold mb-2 block">
                  Erscheinungsjahr
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1970}
                    max={currentYear}
                    value={draft.yearFrom ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, yearFrom: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-24 px-2 py-1.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-sm focus:border-neon-cyan focus:outline-none"
                  />
                  <span className="text-zinc-500">bis</span>
                  <input
                    type="number"
                    min={1970}
                    max={currentYear}
                    value={draft.yearTo ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, yearTo: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-24 px-2 py-1.5 rounded-md bg-zinc-800/80 border border-zinc-700 text-sm focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              </section>

              {/* Genres */}
              <section>
                <label className="text-sm font-semibold mb-2 block">
                  Genres{" "}
                  {draft.genreIds.length > 0 && (
                    <span className="text-neon-purple">({draft.genreIds.length})</span>
                  )}
                </label>
                {loading ? (
                  <div className="text-zinc-500 text-sm">Lade …</div>
                ) : error ? (
                  <div className="text-neon-red text-sm">Fehler: {error}</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {genres.map((g) => {
                      const active = draft.genreIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => toggle("genreIds", g.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            active
                              ? "bg-neon-purple/20 border-neon-purple text-neon-purple"
                              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                          )}
                        >
                          {g.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Plattformen */}
              <section>
                <label className="text-sm font-semibold mb-2 block">
                  Plattformen{" "}
                  {draft.platformIds.length > 0 && (
                    <span className="text-neon-cyan">({draft.platformIds.length})</span>
                  )}
                </label>
                {loading ? (
                  <div className="text-zinc-500 text-sm">Lade …</div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {platforms.map((p) => {
                      const active = draft.platformIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => toggle("platformIds", p.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                            active
                              ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan"
                              : "border-zinc-700 text-zinc-300 hover:border-zinc-500"
                          )}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            <footer className="sticky bottom-0 p-4 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur">
              <button
                onClick={() => {
                  apply();
                  onClose();
                }}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-lg shadow-neon-purple/30 hover:opacity-90 active:scale-[0.99] transition"
              >
                Anwenden
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
