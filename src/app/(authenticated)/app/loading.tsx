export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-surface motion-reduce:animate-none" />
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="mt-10 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl bg-surface motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
