import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Flame, X } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Schließe Dropdown bei Klick außerhalb
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={containerRef}>
      {/* Avatar-Button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Benutzermenü öffnen"
        className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 hover:border-neon-cyan transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={`${user.displayName ?? "User"} Avatar`}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <Flame className="w-4 h-4 text-neon-pink" />
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800/60 rounded-xl shadow-xl shadow-black/40 z-20 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Flame className="w-4 h-4 text-neon-pink" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-zinc-100 text-sm truncate">
                  {user.displayName || user.email?.split("@")[0] || "User"}
                </p>
                <p className="text-xs text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              setOpen(false);
              try {
                await signOut();
              } catch {
                alert("Logout fehlgeschlagen");
              }
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800/50 hover:text-neon-cyan transition-colors"
          >
            <X className="w-4 h-4 text-neon-red" />
            Abmelden
          </button>
        </div>
      )}
    </div>
  );
}
