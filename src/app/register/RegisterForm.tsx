"use client";

import { useActionState, useState } from "react";
import { register } from "@/app/login/actions";
import { authInput } from "@/components/AuthPanel";
import { cx } from "@/lib/format";

type Role = "brand" | "creator";

export function RegisterForm({ initialRole }: { initialRole: Role | null }) {
  const [role, setRole] = useState<Role | null>(initialRole);
  const [state, action, pending] = useActionState(
    register,
    null as { error?: string } | null
  );

  // naano splits the funnel by side before asking for anything else.
  if (!role) {
    return (
      <div className="mt-8 space-y-3">
        <RoleCard
          onClick={() => setRole("creator")}
          title="I'm a creator"
          body="Get paid to create LinkedIn content for B2B brands you actually use."
        />
        <RoleCard
          onClick={() => setRole("brand")}
          title="I'm a brand"
          body="Find creators, launch campaigns, and trace real pipeline back to each post."
        />
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="role" value={role} />

      <button
        type="button"
        onClick={() => setRole(null)}
        className="text-xs font-semibold text-muted hover:text-ink"
      >
        ← {role === "creator" ? "Creator" : "Brand"} account · change
      </button>

      <label className="block">
        <span className="nn-eyebrow mb-1.5 block">Your name</span>
        <input name="name" required placeholder="Alex Rivera" className={authInput} />
      </label>

      {role === "brand" && (
        <label className="block">
          <span className="nn-eyebrow mb-1.5 block">Company</span>
          <input name="companyName" placeholder="Northwind Analytics" className={authInput} />
        </label>
      )}

      <label className="block">
        <span className="nn-eyebrow mb-1.5 block">Email</span>
        <input name="email" type="email" required placeholder="you@company.com" className={authInput} />
      </label>

      <label className="block">
        <span className="nn-eyebrow mb-1.5 block">Password</span>
        <input name="password" type="password" required minLength={8}
          placeholder="At least 8 characters" className={authInput} />
      </label>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending}
        className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:bg-grey">
        {pending ? "Creating…" : "Create account"}
      </button>

      <p className="text-center text-[11px] leading-relaxed text-grey">
        Creator onboarding imports your LinkedIn profile in the real product. That
        scraping step is deliberately not built.
      </p>
    </form>
  );
}

function RoleCard({
  onClick,
  title,
  body,
}: {
  onClick: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "nn-card w-full p-5 text-left transition",
        "hover:border-brand/50 hover:shadow-[0_8px_28px_-14px_rgba(22,82,240,0.45)]"
      )}
    >
      <div className="font-display font-bold text-ink">{title}</div>
      <div className="mt-1 text-sm leading-relaxed text-muted">{body}</div>
    </button>
  );
}
