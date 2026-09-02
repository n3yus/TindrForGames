interface SpinnerProps {
  size?: number;
  className?: string;
}

/** Kleiner inline-Loader ohne externe Lib. */
export function LoadingSpinner({ size = 20, className = "" }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Lädt"
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ width: size, height: size }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
