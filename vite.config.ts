import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// --- Token-Cache (serverseitig im Vite-Prozess) -----------------------------
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getTwitchToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const now = Date.now();
  // 5 min Puffer vor dem Ablauf
  if (cachedToken && cachedToken.expiresAt > now + 300_000) {
    return cachedToken.value;
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twitch OAuth failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cachedToken = {
    value: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  console.log("[igdb] new access token cached");
  return data.access_token;
}

// --- Vite-Plugin: IGDB-Proxy-Middleware ----------------------------------
function igdbProxyPlugin(clientId: string, clientSecret: string): Plugin {
  return {
    name: "igdb-proxy",
    configureServer(server) {
      server.middlewares.use("/igdb", async (req, res, next) => {
        if (!clientId || !clientSecret) {
          res.statusCode = 500;
          res.end("VITE_TWITCH_CLIENT_ID/SECRET not set in .env");
          return;
        }

        try {
          const token = await getTwitchToken(clientId, clientSecret);

          // Original-URL: /igdb/games → /v4/games
          const targetPath = `/v4${req.url!.replace(/^\/igdb/, "")}`;

          // body auslesen (POST mit text/plain)
          const chunks: Buffer[] = [];
          await new Promise<void>((resolve, reject) => {
            req.on("data", (chunk) => chunks.push(chunk));
            req.on("end", resolve);
            req.on("error", reject);
          });
          const body = Buffer.concat(chunks).toString("utf-8");

          const igdbRes = await fetch(`https://api.igdb.com${targetPath}`, {
            method: "POST",
            headers: {
              "Client-ID": clientId,
              Authorization: `Bearer ${token}`,
              "Content-Type": "text/plain",
            },
            body,
          });

          const text = await igdbRes.text();
          res.statusCode = igdbRes.status;
          for (const [k, v] of igdbRes.headers.entries()) {
            if (["content-type", "x-count"].includes(k.toLowerCase())) {
              res.setHeader(k, v);
            }
          }
          res.end(text);
        } catch (err) {
          console.error("[igdb proxy] error:", err);
          res.statusCode = 502;
          res.end(`Proxy error: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const clientId = env.VITE_TWITCH_CLIENT_ID ?? "";
  const clientSecret = env.VITE_TWITCH_CLIENT_SECRET ?? "";

  return {
    plugins: [react(), igdbProxyPlugin(clientId, clientSecret)],
    server: {
      headers: {
        // Erlaubt Firebase Popup-Auth im Dev-Server
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
      port: 5515, // Fester Port für Pterodactyl
    },
  };
});
