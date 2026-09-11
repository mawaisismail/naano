import Link from "next/link";

/** Shared brand-side panel for /login and /register. */
export function AuthPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="nn-sky relative hidden flex-col justify-between border-r border-line p-12 lg:flex">
      <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-ink">
        naano<span className="text-brand">.</span>
      </Link>
      <div>
        <h2 className="max-w-sm font-display text-3xl font-extrabold leading-tight text-ink">
          {title}
        </h2>
        <p className="mt-4 max-w-sm leading-relaxed text-muted">{body}</p>
      </div>
      <p className="text-xs text-grey">
        A 24-hour rebuild of naano.com. Not affiliated with Naano.
      </p>
    </div>
  );
}

export const authInput =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-grey focus:border-brand";
