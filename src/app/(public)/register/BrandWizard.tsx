"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { readSite, confirmBrandProfile, type BrandState } from "@/lib/actions/brand-onboarding";
import { READ_STEPS } from "@/lib/brand-import";
import { LocaleButton } from "./parts";

/**
 * naano's three-step brand onboarding, on /register?role=saas.
 *
 *   1  the site URL, then "Reading your brand…" with four ticking lines
 *   2  "Value prop & ICP" — the read, editable, over the starter brief
 *   3  "Opening AI Matching…" hands over to the workspace
 *
 * The progress bar is three segments, the kicker reads "Step N of 3", and the
 * right panel is the same blue board the brand sign-up carries.
 */

const KICKER = "text-sm font-semibold text-[#2563eb]";
const H1 = "text-[32px] font-bold tracking-[-0.025em] text-[#111827]";
const LEAD = "text-[15px] leading-[26px] text-[#6B7280]";
const CTA =
  "w-full rounded-[12px] bg-[#2563eb] px-5 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60";

function Progress({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className={KICKER}>Step {step} of 3</span>
      <span className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 w-[72px] rounded-full ${i <= step ? "bg-[#2563eb]" : "bg-[#E5E7EB]"}`}
          />
        ))}
      </span>
    </div>
  );
}

/** The demo disclosure, shown wherever the read's output is displayed. */
/**
 * Says where the text below came from.
 *
 * Both branches render. A brand whose site was actually read should be told
 * so — it is the difference between trusting the draft and rewriting it — and
 * a brand that got the generated version must not be left assuming otherwise.
 * Both read `brandDataSource` off the row rather than a prop set at the call
 * site, so the note cannot drift from what was stored.
 */
function DemoNote({ source, domain }: { source: string; domain: string | null }) {
  if (source === "demo") {
    return (
      <div className="rounded-[12px] border border-[#F2E2C0] bg-[#FDFAF2] px-4 py-3 text-[13px] leading-5 text-[#7A5A1E]">
        <strong className="font-semibold">Generated, not read.</strong> We could
        not reach your site just now, so the value proposition and ICPs below
        were drafted from your domain name. They are stored as{" "}
        <code className="rounded bg-white/70 px-1">brandDataSource=&quot;demo&quot;</code>.
        Edit them, or go back and try the URL again.
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 rounded-[12px] border border-[#CFE0FF] bg-[#F5F8FF] px-4 py-3 text-[13px] leading-5 text-[#1D4ED8]">
      <Check size={15} strokeWidth={2.4} aria-hidden className="mt-0.5 shrink-0" />
      <span>
        <strong className="font-semibold">Read from {domain ?? "your site"}.</strong>{" "}
        We pulled your public pages and drafted the profile below from them.
        Everything is yours to edit.
      </span>
    </div>
  );
}

export function BrandWizard({
  step,
  company,
  websiteUrl,
  valueProp,
  icps,
  source,
}: {
  step: 1 | 2;
  company: string | null;
  websiteUrl: string | null;
  valueProp: string | null;
  icps: string[];
  source: string;
}) {
  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}>
      <div className="flex min-w-0 flex-1 items-start justify-center overflow-y-auto bg-white px-8 pb-16 pt-[clamp(2rem,8dvh,5rem)]">
        <div className="w-full max-w-[540px]">
          <div className="mb-8 flex items-center justify-between gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="naano" className="h-7 w-auto object-contain" />
            <LocaleButton />
          </div>

          {step === 1 ? (
            <StepSite defaultUrl={websiteUrl} />
          ) : (
            <StepProfile
              company={company}
              valueProp={valueProp ?? ""}
              icps={icps}
              source={source}
              domain={websiteUrl ? hostOf(websiteUrl) : null}
            />
          )}
        </div>
      </div>

      <div className="hidden flex-1 items-center justify-center p-12 text-white lg:flex" style={{ background: "#2563eb" }}>
        <div className="max-w-sm">
          <h2 className="mb-4 text-3xl font-bold">Creators. Brands. Results.</h2>
          <p className="mb-8 text-[#DBEAFE]">
            Run LinkedIn creator campaigns that drive real business - discover
            creators, track performance, pay in one click.
          </p>
          <div className="text-sm text-[#BFDBFE]">Built for B2B marketing teams</div>
        </div>
      </div>
    </div>
  );
}

/** The host as a person would say it: no scheme, no www, no trailing slash. */
function hostOf(url: string): string | null {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * The four lines that tick over while the read runs.
 *
 * It is its own component, mounted only while the action is pending, so the
 * counter starts at zero by being mounted rather than by an effect writing
 * state back to zero when the pending flag clears — that write is a cascading
 * render, and React's lint rule is right to refuse it.
 *
 * The lines are a progress indicator, not a claim: the read itself is one
 * server round trip.
 */
function ReadingSteps() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setTick((t) => Math.min(t + 1, READ_STEPS.length - 1)),
      700
    );
    return () => clearInterval(id);
  }, []);

  return (
    <ul className="space-y-3.5">
      {READ_STEPS.map((label, i) => {
        const done = i < tick;
        const active = i === tick;
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                done
                  ? "bg-[#DCFCE7] text-[#16A34A]"
                  : active
                    ? "bg-[#DBEAFE] text-[#2563eb]"
                    : "bg-[#F3F4F6] text-[#9CA3AF]"
              }`}
            >
              {done ? <Check size={13} strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={`text-[15px] ${active ? "font-semibold text-[#111827]" : "text-[#6B7280]"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ------------------------------------------------------------- step 1 --- */

function StepSite({ defaultUrl }: { defaultUrl: string | null }) {
  const [state, action, pending] = useActionState<BrandState, FormData>(readSite, null);

  if (pending) {
    return (
      <div className="space-y-6">
        <Progress step={1} />
        <div>
          <h1 className={H1}>Reading your brand…</h1>
          <p className={`${LEAD} mt-2`}>
            This usually takes a few seconds. We&apos;ll only show you the
            product and 3 ICPs.
          </p>
        </div>

        <div className="grid place-items-center py-10">
          <span className="grid size-[104px] place-items-center rounded-full bg-[#EFF4FF]">
            <span className="grid size-[68px] animate-pulse place-items-center rounded-[18px] bg-white shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="size-8 object-contain" />
            </span>
          </span>
        </div>

        <ReadingSteps />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <Progress step={1} />
      <div>
        <h1 className={H1}>What are we promoting?</h1>
        <p className={`${LEAD} mt-2`}>
          Give us your website and Naano reads it once, to draft your value
          proposition and the three audiences your creators need to understand.
        </p>
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-[12px] border border-[#F2D6C8] bg-[#FDF6F1] px-4 py-3 text-sm text-[#8A4B22]">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="websiteUrl" className="text-xs font-bold uppercase tracking-wide text-[#5C5B57]">
          Your website
        </label>
        <input
          id="websiteUrl"
          name="websiteUrl"
          required
          defaultValue={defaultUrl ?? ""}
          placeholder="fasttools.com"
          className="mt-1.5 w-full rounded-[12px] border border-[#D1D5DB] px-4 py-3 text-[15px] text-[#0f172a] placeholder:text-[#9CA3AF] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15"
        />
        <p className="mt-2 text-[13px] text-[#9CA3AF]">
          Public pages only. Nothing is published, and you can edit everything
          on the next step.
        </p>
      </div>

      <button className={CTA}>Read my website</button>
    </form>
  );
}

/* ------------------------------------------------------------- step 2 --- */

function StepProfile({
  company,
  valueProp,
  icps,
  source,
  domain,
}: {
  company: string | null;
  valueProp: string;
  icps: string[];
  source: string;
  domain: string | null;
}) {
  const [state, action, pending] = useActionState<BrandState, FormData>(confirmBrandProfile, null);
  const [value, setValue] = useState(valueProp);
  const parsed = icps.map((raw) => {
    const [title, ...rest] = raw.split(" — ");
    return { title, description: rest.join(" — ") };
  });

  return (
    <form action={action} className="space-y-6">
      <Progress step={2} />

      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#DCFCE7] text-[#16A34A]">
          <Sparkles size={20} strokeWidth={1.8} aria-hidden />
        </span>
        <div>
          <h1 className={H1}>Value prop &amp; ICP</h1>
          <p className="text-[15px] text-[#6B7280]">{company ?? "Your brand"}</p>
        </div>
      </div>

      <p className={LEAD}>Review these details once. Naano turns them into a brief for your creators.</p>

      {state?.error ? (
        <p role="alert" className="rounded-[12px] border border-[#F2D6C8] bg-[#FDF6F1] px-4 py-3 text-sm text-[#8A4B22]">
          {state.error}
        </p>
      ) : null}

      <DemoNote source={source} domain={domain} />

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#5C5B57]">Value proposition</p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">
          What the company does, for whom, how — 4 to 6 sentences. Edit if needed.
        </p>
        <textarea
          name="valueProp"
          rows={6}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 w-full rounded-[12px] border border-[#D1D5DB] px-4 py-3 text-[15px] leading-7 text-[#0f172a] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/15"
        />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#5C5B57]">
          {parsed.length} ideal customers (ICP)
        </p>
        <p className="mt-1 text-[13px] text-[#9CA3AF]">The audiences your creators need to understand.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {parsed.map((icp, i) => (
            <div key={icp.title} className="rounded-[14px] border border-[#E5E7EB] p-4">
              <span className="grid size-6 place-items-center rounded-full bg-[#2563eb] text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-2.5 text-[14px] font-bold leading-[1.3] text-[#111827]">{icp.title}</p>
              <p className="mt-2 line-clamp-3 text-[13px] leading-5 text-[#6B7280]">{icp.description}</p>
              <input type="hidden" name={`icp${i}`} value={`${icp.title} — ${icp.description}`} />
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------- starter brief */}
      <section className="rounded-[18px] border border-[#E0E7FF] bg-[#F7FAFF] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="" className="size-5 object-contain" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#2563eb]">
                Starter creator brief
              </p>
              <p className="mt-1 text-[17px] font-bold text-[#111827]">What your creators will receive</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-[#DCFCE7] px-3 py-1 text-[13px] font-semibold text-[#15803D]">
            ✓ Ready
          </span>
        </div>

        <div className="mt-4 rounded-[14px] bg-white p-5">
          <p className="text-[17px] font-bold text-[#111827]">{company ?? "Your brand"}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Product</p>
              <p className="mt-1.5 line-clamp-5 text-[13px] leading-5 text-[#4B5563]">{value}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">Audience</p>
              <p className="mt-1.5 text-[13px] font-semibold leading-5 text-[#374151]">
                {parsed.map((i) => i.title).join(" · ")}
              </p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-[10px] bg-[#F5F8FF] px-3.5 py-3 text-[13px] leading-5 text-[#4B5563]">
            <Sparkles size={15} strokeWidth={1.8} aria-hidden className="mt-0.5 shrink-0 text-[#2563eb]" />
            Creators can adapt the angle to their expertise, while keeping every
            product claim factual.
          </p>
        </div>

        <p className="mt-3 text-[13px] text-[#6B7280]">
          ↗ Every creator you invite will receive this brief. You can edit it
          later from Campaigns.
        </p>
      </section>

      <div className="flex gap-3">
        <a
          href="/register?role=saas&step=1"
          className="rounded-[12px] border border-[#E5E7EB] px-6 py-3.5 text-[15px] font-semibold text-[#111827] transition-colors hover:border-[#9CA3AF]"
        >
          Back
        </a>
        <button disabled={pending} className={CTA}>
          {pending ? "Opening AI Matching…" : "Continue — AI Matching"}
        </button>
      </div>
    </form>
  );
}
