# Plan: TindrForGames — Implementierung

## Kontext

Neues Greenfield-Projekt (`c:\Users\phils\Documents\Coding\Web\TindrForGames`). Ziel ist eine Tinder-ähnliche Web-App zum Durchswipen von Videospielen. Der Projektordner ist fast leer (nur `info.md` und `.claude\settings.json`). Wir starten von Grund auf.

**User-Entscheidungen (festgelegt via AskUserQuestion):**
1. **RAWG-API-Key**: Nutzer trägt selbst nach → ich lege `.env.example` mit `VITE_RAWG_API_KEY=…` an
2. **Design**: Dark + Neon-Gamer-Look (empfohlen) — dunkles Hintergrund, kräftige Akzente Violett/Cyan/Neon-Pink, Glassmorphism, abgerundete Karten
3. **Navigation**: React Router + Bottom-Nav (empfohlen) — zwei Routen (`/` und `/saved`), fixierte Tab-Leiste unten
4. **Swipe-Library**: Eigenbau mit Framer Motion (empfohlen) — volle Kontrolle über Rotation, Overlays, Threshold


## Phase 1: Project Setup

### Kritische Dateien zum Bearbeiten

**1. `package.json`** – Basis-Skript (vite, ts, tailwind)
- Installation: React, React-DOM, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React (Icons), React Router DOM

**2. `tsconfig.json`** – TypeScript-Konfiguration strenge Types
**3. `tailwind.config.ts`** – Tailwind-Konfiguration
**4. `postcss.config.js`** – Autoprefixer
**5. `src/env.d.ts`** – Env-Typen für VITE_RAWG_API_KEY
**6. `.env.example`** – Platzhalter für API-Key
**7. `src/main.tsx`** – Router-Eintrag + Theme-Provider

**Ziel:** Das Projekt initialisieren, die Abhängigkeiten auflisten, React/Vite mit TypeScript und Tailwind CSS einrichten, über die Umgebungsvariable für den RAWG-API-Key verfügen.

**Wie man überprüft:** `npm install` erfolgreich; `npm run dev` startet den Entwicklungsserver.

---

## Phase 2: File & Folder Structure

### Kritische Dateien zum Bearbeiten

```
src/
├── assets/
├── components/
│   ├── SwipeCard.tsx
│   ├── BottomNav.tsx
│   ├── SkeletonCard.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   └── FilterPanel.tsx
├── hooks/
│   ├── useGamePool.ts
│   ├── useLocalStorage.ts
│   └── useRAWG.ts
├── lib/
│   ├── types.ts
│   ├── api.ts
│   └── cn.ts
├── pages/
│   ├── HomePage.tsx
│   └── SavedPage.tsx
├── App.tsx
└── index.tsx
```

**Ziel:** Saubere Struktur mit Komponenten isoliert, Hooks für Logik, UI-seitig vorhanden, basierend auf React-Router.

---

## Phase 3: Swipe Card Implementation

### Kritische Dateien zum Bearbeiten

**`src/components/SwipeCard.tsx`**
- Framer-Motion-Kernkomponente mit Drag-Gesten, Rotation und Farb-Overlay-Farben (Grün für Rechts, Rot für Links), Threshold-Trigger auf 75px horizontaler Bewegung.

**Erwartetes Verhalten:**
1. Karte wird gedrückt.
2. Rotation erfolgt basierend auf der Drag-Richtung (max. -15° bis +15°).
3. Overlay-Opacity wechselt entsprechend der Bewegung (grünes Overlay bei Rechtswisch, rotes Overlay bei Linkswisch).
4. Callback `onSwipe(direction)` wird ausgelöst, wenn die Bewegung den Threshold überschreitet.

**Ziel:** Realisierung der Kartenanimation und Swipe-Methode wie beschrieben.

---

## Phase 4: State Management & Persistence

### Kritische Dateien zum Bearbeiten

**`src/hooks/useLocalStorage.ts`**
- Verwaltet `seenIds` und `savedIds` in LocalStorage.

**`src/hooks/useGamePool.ts`**
- Initiiert eine RAWG-Abfrage, legt Filter fest, wählt die nächste Karte aus, führt Swipe-Aktionen aus und ruft die nächste Seite im Hintergrund ab, wenn weniger als 3 Karten übrig sind.

**Ziel:** Gewährleistung der korrekten lokalen Speicherung und des State-Managements für Swipen, Merken, Filtern und Pagination.

---

## Phase 5: Filter Panel UI

### Kritische Dateien zum Bearbeiten

**`src/components/FilterPanel.tsx`**
- Genre-Multi-Select, Plattform-Multi-Select, Erscheinungsjahr-Bereich, „Neu vs. Alt"-Toggle, Suchtext.

**Ziel:** Bietet eine UI zum Filtern des Spielepools; Filteränderungen lösen eine neue RAWG-Abfrage mit `useGamePool` aus.

---

## Phase 6: Routing & Navigation

### Kritische Dateien zum Bearbeiten

**`src/main.tsx`**, **`src/App.tsx`**
- React Router DOM mit zwei Routen: `/` (HomePage) und `/saved` (SavedPage). BottomNav-Komponente für die Navigation.

**Ziel:** Bereitstellung von Navigations-Übersicht und Benutzererlebnis, um zwischen Swipe- und Gemerkt-Ansichten zu wechseln.

---

## Phase 7: Loading States & Error Handling

### Kritische Dateien zum Bearbeiten

**`src/components/SkeletonCard.tsx`**
**`src/components/ErrorBoundary.tsx`**
**`src/components/EmptyState.tsx`**

**Ziel:** UI-Status für Ladevorgänge (Skeleton Cards), Fehler-Fallback (Fehlermeldung + Retry), leerer Stapel (Message + Filter-Anpassung).

---

## Phase 8: RAWG API Integration

### Kritische Dateien zum Bearbeiten

**`src/lib/api.ts`**
**`src/hooks/useRAWG.ts`**
- Wrapper für RAWG-Endpunkte, Handhabung von Pagination (`next`-URL), Rate-Limit-Fehlern, Fehlschlägen bei fehlendem API-Key.

**Ziel:** Verbindung zu RAWG API zum Abrufen von Spieledaten und Genre-/Plattform-Listen.

---

## Phase 9: Responsive & Mobile-First Design

### Kritische Dateien zum Bearbeiten

**`src/components/BottomNav.tsx`**, **Tailwind-Custom-Tailwind-Konfiguration**
- Anpassung des Styles für mobile vs. Desktop, feste Bottom-Nav-Leiste.

**Ziel:** Sicherstellen, dass die App auf mobilen und Desktop-Bildschirmen funktioniert; Touch-Gesten für mobile und Alternative-Buttons für Desktop sicherstellen.

---

## Verifizierung & Tests

### Wie man überprüft

1. **Initialisierung:**
   - Projekt starten (fügt Vite, TypeScript und Tailwind CSS hinzu).
   - `npm run dev` → läuft der Entwicklungsserver.

2. **Manuelle Smoke-Tests:**
   - Erste Karte erscheint; wir testen Swipen rechts/links; wir überprüfen die Einträge in LocalStorage; wir überprüfen die Filter; wir testen Fehler und leeren Zustand; wir testen die Saved-Liste.

3. **Responsive Test:**
   - Verwenden Sie den Device-Toolbar im Browser, um mobile/emergente Touch-Funktionen zu überprüfen.

4. **LocalStorage:**
   - Überprüfen Sie, ob die Datensätze persistieren.

---

## Aktueller Stand

Phase 1 ist bisher vollständig umgesetzt.

**Nächste Schritte:** Beginnen Sie mit Phase 2.
