import { useAuth } from "../contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signInWithGoogle, user } = useAuth();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center p-4"
      aria-modal="true"
    >
      <div
        className="bg-zinc-950 rounded-xl p-8 max-w-sm w-full border border-zinc-800/50 shadow-2xl"
        role="dialog"
        aria-labelledby="login-title"
      >
        <h2
          id="login-title"
          className="text-xl font-bold text-neon-pink text-center mb-6"
        >
          Mit Google anmelden
        </h2>

        {user
          ? null
          : (
            <button
              onClick={() => signInWithGoogle().catch(() => alert("Login fehlgeschlagen"))}
              className="w-full bg-neon-purple text-zinc-950 font-medium py-3 rounded-xl hover:bg-neon-pink/90 transition-colors"
            >
              Google Konto wählen
            </button>
          )
        }

        {!user && (
          <p className="text-zinc-400 text-sm mt-6 text-center">
            Deine Spiel-Merkliste wird automatisch in der Cloud gespeichert und ist
            auf allen Geräten verfügbar.
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full text-zinc-400 text-sm py-2 rounded-xl hover:text-neon-cyan transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}