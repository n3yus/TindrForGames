import { Key, ExternalLink } from "lucide-react";

interface ApiKeyBannerProps {
  message?: string;
}

/**
 * Zeigt einen Hinweis, wenn VITE_RAWG_API_KEY nicht gesetzt ist.
 * Der Nutzer soll die .env-Datei anlegen.
 */
export function ApiKeyBanner({
  message = "RAWG API-Key fehlt. Kopiere .env.example nach .env und trage deinen Key ein.",
}: ApiKeyBannerProps) {
  const hasKey =
    import.meta.env.VITE_RAWG_API_KEY &&
    import.meta.env.VITE_RAWG_API_KEY !== "rawg-your-api-key-here";

  if (hasKey) return null;

  return (
    <div
      role="alert"
      className="mx-4 mt-4 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-3"
    >
      <Key className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-yellow-200 font-medium">{message}</p>
        <a
          href="https://rawg.io/apidocs"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-yellow-300 underline hover:text-yellow-100 mt-1"
        >
          API-Key holen <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-[11px] text-yellow-500/70 mt-1 font-mono">
          cp .env.example .env
        </p>
      </div>
    </div>
  );
}
