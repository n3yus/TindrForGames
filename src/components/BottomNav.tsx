import { NavLink } from "react-router-dom";
import { Flame, Heart } from "lucide-react";
import { cn } from "../lib/cn";

interface BottomNavProps {
  savedCount: number;
}

/**
 * Fixierte Bottom-Nav mit zwei Tabs: "Swipen" und "Gemerkt".
 * Gloabl sichtbar auf beiden Routen.
 */
export function BottomNav({ savedCount }: BottomNavProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors",
      isActive ? "text-neon-pink" : "text-zinc-500 hover:text-zinc-300"
    );

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-30 glass border-t border-zinc-800/60 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex items-stretch">
        <li>
          <NavLink to="/" end className={linkClass}>
            <Flame className="w-5 h-5" />
            <span>Swipen</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/saved" className={linkClass}>
            <span className="relative">
              <Heart className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-neon-pink text-[10px] font-bold text-white flex items-center justify-center">
                  {savedCount > 99 ? "99+" : savedCount}
                </span>
              )}
            </span>
            <span>Gemerkt</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
