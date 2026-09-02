import { NavLink } from "react-router-dom";
import { Flame, Heart, X } from "lucide-react";
import { cn } from "../lib/cn";

interface BottomNavProps {
  savedCount: number;
  seenCount: number;
}

/**
 * Fixierte Bottom-Nav mit drei Tabs: "Swipen", "Gemerkt" und "Gesehen".
 */
export function BottomNav({ savedCount, seenCount }: BottomNavProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex-1 flex flex-row items-center justify-center gap-2 h-14 text-xs font-medium transition-colors",
      isActive ? "text-neon-pink" : "text-zinc-500 hover:text-zinc-300"
    );

  const linkClassRed = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex-1 flex flex-row items-center justify-center gap-2 h-14 text-xs font-medium transition-colors",
      isActive ? "text-neon-red" : "text-zinc-500 hover:text-zinc-300"
    );

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed inset-x-0 bottom-0 z-30 glass border-t border-zinc-800/60 h-14 flex"
    >
      <ul className="flex w-full">
        <li className="flex-1">
          <NavLink to="/" end className={linkClass}>
            <Flame className="w-5 h-5 shrink-0" />
            <span>Swipen</span>
          </NavLink>
        </li>
        <li className="flex-1">
          <NavLink to="/saved" className={linkClass}>
            <span className="relative shrink-0">
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
        <li className="flex-1">
          <NavLink to="/seen" className={linkClassRed}>
            <span className="relative shrink-0">
              <X className="w-5 h-5" />
              {seenCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-neon-red text-[10px] font-bold text-white flex items-center justify-center">
                  {seenCount > 99 ? "99+" : seenCount}
                </span>
              )}
            </span>
            <span>Gesehen</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
