import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catch-all für React-Render-Fehler.
 * Wird über die gesamte App gewrappt.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(error: Error) {
    console.error("[ErrorBoundary]", error);
  }

  reset = () => this.setState({ hasError: false, message: "" });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-neon-red mb-3" />
        <h2 className="text-lg font-bold mb-1">Etwas ist schiefgegangen</h2>
        <p className="text-sm text-zinc-400 max-w-sm mb-4">
          {this.state.message || "Unbekannter Fehler."}
        </p>
        <button
          onClick={this.reset}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-neon-purple/20 border border-neon-purple text-neon-purple text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" /> Erneut versuchen
        </button>
      </div>
    );
  }
}
