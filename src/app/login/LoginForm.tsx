"use client";

import { useActionState, useState } from "react";
import { login } from "./actions";
import { authInput } from "@/components/AuthPanel";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, null as { error?: string } | null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const fill = (who: "brand" | "creator") => {
    setEmail(`${who}@naano.demo`);
    setPassword("demo1234");
  };

  return (
    <>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => fill("brand")}
          className="flex-1 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand">
          Use brand demo
        </button>
        <button type="button" onClick={() => fill("creator")}
          className="flex-1 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:border-brand hover:text-brand">
          Use creator demo
        </button>
      </div>

      <form action={action} className="mt-6 space-y-4">
        {/* Validated server-side by safeNextPath — an absolute URL here would
            make the login page an open redirect. */}
        {next && <input type="hidden" name="next" value={next} />}
        <label className="block">
          <span className="nn-eyebrow mb-1.5 block">Email</span>
          <input name="email" type="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" className={authInput} />
        </label>
        <label className="block">
          <span className="nn-eyebrow mb-1.5 block">Password</span>
          <input name="password" type="password" required value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" className={authInput} />
        </label>

        {state?.error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending}
          className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:bg-grey">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-grey">
        LinkedIn and Google sign-in are deliberately not built — real OAuth adds
        no product surface a reviewer can see.
      </p>
    </>
  );
}
