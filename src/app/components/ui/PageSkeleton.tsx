/**
 * Full-viewport loading shell for lazy route resolution.
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col" aria-busy="true" aria-label="Loading">
      <header className="h-14 border-b border-white/10 px-4 flex items-center gap-4">
        <div className="h-8 w-28 rounded-md bg-white/10 animate-pulse" />
        <div className="ml-auto h-8 w-24 rounded-md bg-white/10 animate-pulse" />
      </header>
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="h-10 w-48 rounded-lg bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      </main>
    </div>
  );
}
