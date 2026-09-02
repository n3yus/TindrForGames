import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Firebase Konfiguration aus .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase nur einmal initialisieren
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth mit Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore für Datenspeicherung
export const db = getFirestore(app);

// Offline-Persistence für Firestore aktivieren (nur Client-seitig)
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === "failed-precondition") {
      console.warn("[Firebase] Offline-Persistence nicht verfügbar: Mehrere Tabs offen");
    } else if (err.code === "unimplemented") {
      console.warn("[Firebase] Offline-Persistence nicht verfügbar: Browser unterstützt es nicht");
    }
  });
}

export default app;
