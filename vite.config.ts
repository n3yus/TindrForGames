import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const clientId = env.VITE_TWITCH_CLIENT_ID ?? "";
  const clientSecret = env.VITE_TWITCH_CLIENT_SECRET ?? "";

  // GitHub Pages: /tindr-for-games/ als base-Pfad
  const base = process.env.GITHUB_PAGES_BASE || "/tindr-for-games/";

  return {
    plugins: [react()],
    base,
    server: {
      headers: {
        // Erlaubt Firebase Popup-Auth im Dev-Server
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
      port: 8080,
    },
    build: {
      outDir: "dist",
    },
  };
});
