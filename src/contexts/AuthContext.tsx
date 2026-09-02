import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Auth Context Typen
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncData: (savedIds: number[], seenIds: number[]) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // User-Status von Firebase überwachen
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });

        // Beim Login: Firestore-Daten laden und in localStorage schreiben
        const userDocRef = doc(db, "users", firebaseUser.uid);
        try {
          const snapshot = await getDoc(userDocRef);
          if (snapshot.exists()) {
            const data = snapshot.data();
            const savedIds: number[] = data.savedIds ?? [];
            const seenIds: number[] = data.seenIds ?? [];
            localStorage.setItem("tfg.savedIds", JSON.stringify(savedIds));
            localStorage.setItem("tfg.seenIds", JSON.stringify(seenIds));
          } else {
            // Erstmaliges Login: mit aktuellen localStorage-Werten initialisieren
            const saved = localStorage.getItem("tfg.savedIds");
            const seen = localStorage.getItem("tfg.seenIds");
            const savedIds = saved ? JSON.parse(saved) : [];
            const seenIds = seen ? JSON.parse(seen) : [];
            await setDoc(userDocRef, {
              savedIds,
              seenIds,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (e) {
          console.error("[Auth] Firestore-Daten laden fehlgeschlagen:", e);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Cloud-Sync: Auf Sync-Events aus useGamePool hören
  useEffect(() => {
    if (!user) return;

    const handler = () => {
      try {
        const saved = localStorage.getItem("tfg.savedIds");
        const seen = localStorage.getItem("tfg.seenIds");
        const savedIds = saved ? JSON.parse(saved) : [];
        const seenIds = seen ? JSON.parse(seen) : [];
        setDoc(doc(db, "users", user.uid), {
          savedIds,
          seenIds,
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch((e) => {
          console.error("[Auth] Cloud-Sync fehlgeschlagen:", e);
        });
      } catch (e) {
        console.error("[Auth] Cloud-Sync Fehler:", e);
      }
    };

    window.addEventListener("tfg:sync", handler);
    return () => window.removeEventListener("tfg:sync", handler);
  }, [user]);

  // Google Login
  async function signInWithGoogle() {
    await signInWithPopup(auth, googleProvider);
  }

  // Google Logout
  async function signOut() {
    await auth.signOut();
  }

  // Daten in Firestore schreiben (Cloud-Sync)
  async function syncData(savedIds: number[], seenIds: number[]) {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.uid), {
        savedIds,
        seenIds,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.error("[Auth] Firestore Sync fehlgeschlagen:", e);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, syncData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth muss innerhalb von AuthProvider verwendet werden");
  }
  return ctx;
}

export default AuthContext;
