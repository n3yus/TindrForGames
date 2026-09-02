import { useState } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { BottomNav } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { SavedPage } from "./pages/SavedPage";
import { SeenPage } from "./pages/SeenPage";
import { LoginModal } from "./components/LoginModal";
import { UserMenu } from "./components/UserMenu";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

const SAVED_KEY = "tfg.savedIds";
const SEEN_KEY = "tfg.seenIds";

export default function App() {
  const [savedIds] = useLocalStorage<number[]>(SAVED_KEY, []);
  const [seenIds] = useLocalStorage<number[]>(SEEN_KEY, []);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen min-h-dvh bg-zinc-950">
        <header className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <h1 className="text-xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
              TindrForGames
            </span>
          </h1>
          {user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => setLoginModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-sm border border-zinc-700 hover:border-neon-cyan hover:text-neon-cyan text-zinc-300"
            >
              Anmelden
            </button>
          )}
        </header>

        <main className="flex-1 pb-14 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/seen" element={<SeenPage />} />
          </Routes>
        </main>

        <BottomNav savedCount={savedIds.length} seenCount={seenIds.length} />

        <LoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}