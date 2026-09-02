import { useLocalStorage } from "./hooks/useLocalStorage";
import { BottomNav } from "./components/BottomNav";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { HomePage } from "./pages/HomePage";
import { SavedPage } from "./pages/SavedPage";
import { Routes, Route } from "react-router-dom";

const SAVED_KEY = "tfg.savedIds";

export default function App() {
  const [savedIds] = useLocalStorage<number[]>(SAVED_KEY, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen min-h-dvh bg-zinc-950">
        <main className="flex-1 pb-20 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/saved" element={<SavedPage />} />
          </Routes>
        </main>
        <BottomNav savedCount={savedIds.length} />
      </div>
    </ErrorBoundary>
  );
}
