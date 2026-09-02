import { Gamepad2 } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  action2?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Zeigt einen freundlichen "nichts mehr da"-Zustand an.
 * Nutzerseitig: kann mit Aktionen konfiguriert werden.
 */
export function EmptyState({
  title = "Keine Spiele mehr",
  description = "Alle Spiele durch! Filter anpassen oder später wiederkommen.",
  action,
  action2,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Gamepad2 className="w-14 h-14 text-zinc-700 mb-4" />
      <h2 className="text-lg font-bold text-zinc-200 mb-1">{title}</h2>
      <p className="text-sm text-zinc-500 max-w-xs mb-6">{description}</p>
      {(action || action2) && (
        <div className="flex gap-3 flex-wrap justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-neon-purple to-neon-pink text-white text-sm shadow-lg shadow-neon-purple/20 hover:opacity-90 active:scale-95 transition"
            >
              {action.label}
            </button>
          )}
          {action2 && (
            <button
              onClick={action2.onClick}
              className="px-4 py-2 rounded-xl font-semibold border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 active:scale-95 transition"
            >
              {action2.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
