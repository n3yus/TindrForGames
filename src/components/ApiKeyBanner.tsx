import { Key, ExternalLink } from "lucide-react";

interface ApiKeyBannerProps {
  message?: string;
}

/**
 * Zeigt einen Hinweis, wenn die Twitch-Credentials für IGDB nicht gesetzt sind.
 * Der Nutzer soll die .env-Datei anlegen.
 */
export function ApiKeyBanner({
  message = "Twitch-Credentials fehlen. Kopiere .env.example nach .env und trage VITE_TWITCH_CLIENT_ID und VITE_TWITCH_CLIENT_SECRET ein.",
}: ApiKeyBannerProps) {
  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;
  const hasKey =
    clientId &&
    clientSecret &&
    clientId !== "dein-client-id" &&
    clientSecret !== "dein-client-secret";

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
          href="https://dev.twitch.tv/console/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-yellow-300 underline hover:text-yellow-100 mt-1"
        >
          Credentials holen <ExternalLink className="w-3 h-3" />
        </a>
        <p className="text-[11px] text-yellow-500/70 mt-1 font-mono">
          cp .env.example .env
        </p>
      </div>
    </div>
  );
}
