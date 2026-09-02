import { useLocalStorage } from "./hooks/useLocalStorage";
import { BottomNav } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { SavedPage } from "./pages/SavedPage";
import { SeenPage } from "./pages/SeenPage";
import { Routes, Route } from "react-router-dom";

const SAVED_KEY = "tfg.savedIds";
const SEEN_KEY = "tfg.seenIds";

export default function App() {
  const [savedIds] = useLocalStorage<number[]>(SAVED_KEY, []);
  const [seenIds] = useLocalStorage<number[]>(SEEN_KEY, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen min-h-dvh bg-zinc-950">
        <main className="flex-1 pb-14 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/seen" element={<SeenPage />} />
          </Routes>
        </main>
        <BottomNav savedCount={savedIds.length} seenCount={seenIds.length} />
      </div>
    </ErrorBoundary>
  );
}
