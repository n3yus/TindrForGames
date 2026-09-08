# TindrForGames

Eine Tinder-ähnliche WebApp für Videospiele - mit Google Sign-In und plattformübergreifender Synchronisation!

## 🚀 Features

- **Spiele-Suche** über IGDB API
- **Google Sign-In** für Benutzer-Accounts
- **Plattformübergreifende Sync** via Firebase Firestore
- **Offline-Fähig** mit localStorage-Persistenz
- **Statistiken**: Anzahl gespeicherter/gesehener Spiele

## 🛠️ Installation

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungs-Server starten
npm run dev
# → http://localhost:5173
```

## 🔧 Konfiguration

Erstelle eine `.env` Datei im Projekt-Root:

```bash
# Twitch (IGDB API)
VITE_TWITCH_CLIENT_ID=dein-client-id
VITE_TWITCH_CLIENT_SECRET=dein-client-secret

# Firebase (Google Sign-In + Firestore)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 🚀 Deployment auf GitHub Pages

### 1. Repository vorbereiten

```bash
# GitHub erstellen
git init
git remote add origin https://github.com/<dein-username>/tindr-for-games.git

# Hauptzweig setzen
git branch -M main
git push -u origin main
```

### 2. GitHub Pages aktivieren

1. Gehe zu **Settings → Pages**
2. **Source**: Wähle `GitHub Actions` aus
3. **Basispfad**: `/tindr-for-games` (falls du keinen Custom Domain hast)

### 3. Deploy ausführen

```bash
npm install -g gh-pages
npm run deploy
```

### 4. Oder automatisch mit GitHub Actions

Erstelle `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_TWITCH_CLIENT_ID: ${{ secrets.VITE_TWITCH_CLIENT_ID }}
          VITE_TWITCH_CLIENT_SECRET: ${{ secrets.VITE_TWITCH_CLIENT_SECRET }}
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

5. **Secrets in GitHub setzen**: Gehe zu `Settings → Secrets and variables → Actions` und füge die Werte aus deiner `.env` ein.

## 📁 Projektstruktur

```
├── src/
│   ├── components/     # UI-Komponenten
│   ├── contexts/       # React Context (AuthContext)
│   ├── hooks/          # Custom Hooks (useLocalStorage, useGamePool)
│   ├── lib/            # Utility Libraries (api.ts, firebase.ts, types.ts)
│   ├── pages/          # Page-Komponenten (HomePage, SavedPage, SeenPage)
│   └── App.tsx         # Haupt-App mit Routing
├── public/             # Statische Assets
├── .env.example        # Beispiel für Umgebungs-Variablen
├── 404.html            # SPA-Routing für GitHub Pages
└── package.json
```

## 🎯 Live Demo

- **Entwicklung:** `npm run dev` → http://localhost:5173
- **Produktion:** `npm run build && npm run preview`

## 📄 Lizenz

MIT – Free to use and modify