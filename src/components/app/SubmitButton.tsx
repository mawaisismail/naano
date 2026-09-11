"use client";

import { useFormStatus } from "react-dom";
import { cx } from "@/lib/format";

/**
 * A submit button that knows its own form is in flight.
 *
 * Server actions round-trip to the server, so without this every "Advance",
 * "Accept" and "Decline" looks broken for a few hundred milliseconds and
 * invites a second click — which would fire the transition twice.
 */
export function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
  className?: string;
}) {
  const { pending } = useFormStatus();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold transition disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand px-4 py-2 text-white hover:bg-brand-strong disabled:bg-grey",
    ghost:
      "border border-line bg-white px-4 py-2 text-ink hover:border-brand hover:text-brand disabled:text-grey",
    danger:
      "border border-line px-4 py-2 text-muted hover:border-red-300 hover:text-red-600 disabled:text-grey",
  };

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cx(base, variants[variant], className)}
    >
      {pending && (
        <span
          aria-hidden
          className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
        />
      )}
      {pending ? (pendingLabel ?? "Working…") : children}
    </button>
  );
}
