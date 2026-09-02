/**
 * Pulsierende Lade-Karte, gleiches Format wie SwipeCard.
 * Wird angezeigt, wenn die erste Seite noch lädt oder nachgeladen wird.
 */
export function SkeletonCard() {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-sm h-[70vh] max-h-[640px] rounded-2xl glass overflow-hidden animate-pulse">
        <div className="h-2/3 w-full bg-zinc-800" />
        <div className="h-1/3 p-4 space-y-3 bg-zinc-900/95">
          <div className="h-5 w-3/4 rounded bg-zinc-800" />
          <div className="h-3 w-1/2 rounded bg-zinc-800" />
          <div className="flex gap-1.5">
            <div className="h-4 w-14 rounded-full bg-zinc-800" />
            <div className="h-4 w-16 rounded-full bg-zinc-800" />
          </div>
          <div className="h-3 w-2/3 rounded bg-zinc-800 mt-2" />
        </div>
      </div>
    </div>
  );
}
