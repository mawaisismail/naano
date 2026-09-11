# naano-rebuild

A 24-hour rebuild of [naano.com](https://naano.com) — the B2B LinkedIn creator
marketplace — built as a take-home exercise.

Not affiliated with Naano. Every creator in this app is invented and every
avatar is generated; the product is cloned, real people's identities are not.

**On assets:** everything in `public/lp/` — the hero sky, the partner logos,
the Zmirov material and the creator avatars — are Naano's own files, captured
from their public site so the UI matches theirs exactly, as the brief asks.
They are their property, not mine, and are here only for this exercise. Note
that the avatar files are photographs of identifiable people; they appear here
solely to reproduce Naano's layout. Large images are re-encoded (the hero went
from 3MB to ~130KB).

The creators inside the app itself remain invented, with generated avatars.

---

## Try it

Two demo accounts, printed on the login page with one-click fill. A two-sided
marketplace is not reviewable from one side, so both are seeded:

| | |
|---|---|
| Brand | `brand@naano.demo` · `demo1234` |
| Creator | `creator@naano.demo` · `demo1234` |

```bash
npm install
npm run db:push     # create the local SQLite database
npm run db:seed     # demo accounts, a live campaign, click history
npm run dev
```

No signup, no cloud database, no API keys. SQLite lives in the repo root and is
gitignored.

---

## The demo worth watching

Attribution is the product, so it is the thing to look at.

1. Sign in as the brand and open a campaign. Each creator has their own
   tracked link, `/r/<code>`.
2. Open one of those links in another tab.
3. Watch that creator's number go up — and only that creator's.

The counter polls live and flashes when it moves. This is the difference
between "we ran a campaign" and "this specific creator drove 47 clicks."

---

## What is built

| Step | |
|---|---|
| 01 Match | Landing page, marketplace, 32 seeded creators, filters on vertical / audience tier / price / country, match scoring |
| 02 Brief | Bulk-select creators → drafted campaign brief → invites sent |
| 03 Manage | Deal lifecycle: invited → accepted → draft → scheduled → live → paid |
| 04 Track | `/r/[code]` tracked links, per-creator click attribution, live counters |
| 05 Pay | Deal prices, campaign spend, cost per click, creator earnings |

Both sides work. Brands book and track at `/app`; creators accept offers, mark
posts published and see earnings at `/studio`.

---

## What is deliberately not built

Cuts are shown in the app rather than hidden — `/app/messages` and
`/app/billing` explain themselves rather than 404ing.

- **Real LinkedIn OAuth and profile scraping.** Naano imports creator profiles
  via Apify. It is an integration, not a product surface — a reviewer sees the
  same card either way.
- **Stripe Connect payouts and KYC.** Days of work, and a payout that moved
  euros looks identical to a database row in a demo. The economics are computed
  and shown; the settlement is not real.
- **Messaging.** A large surface that demonstrates nothing distinctive, because
  it is the same chat as everywhere else.
- **The agencies side, blog/CMS, i18n.** Out of scope for 24 hours.
- **LLM-drafted briefs.** The brief generator is rule-based. It composes from
  the campaign inputs *and* the booked creators' verticals and ICP, so a
  devtools booking produces a different brief than an HR-tech one. The seam for
  a real completion is one function, `draftBrief`. Rule-based keeps the demo
  offline, instant, and free of an API key in a public repo.

---

## Decisions worth explaining

**Creators are not database rows.** They are static seed data. They do not
change at runtime, so the entire browse experience — landing page, marketplace,
filters, profiles — works with no database attached. Only the mutable half
(accounts, campaigns, deals, clicks) is persisted. A `Deal` references a creator
by seed id.

**Every deal owns a tracking code, not every campaign.** That single choice is
what makes attribution per-creator. It is enforced `@unique` at the database
level and tested.

**Prefetches and crawlers are not clicks.** `/r/[code]` redirects them but does
not record them. Counting a LinkedIn unfurl would inflate exactly the number the
brand pays against.

**Sessions are signed.** A bare user id in a cookie would let anyone read
another account's dashboard by editing one value in devtools.

**Server actions re-check ownership.** They are public HTTP endpoints; the deal
id arrives in a form post. Without the check, any signed-in creator could
publish somebody else's booking.

---

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · SQLite · Vitest

Design tokens are taken from naano's live CSS: `#1652f0` brand, Plus Jakarta
Sans + Inter, the soft sky-to-white gradients.

## Deploying

SQLite is for local development only — serverless filesystems are read-only and
ephemeral, so a deployed SQLite database loses its click history between
invocations and the attribution demo stops working.

```bash
npm run use:postgres        # flips the schema provider
# set DATABASE_URL to a Postgres URL (Neon, Vercel Postgres, …)
npx prisma db push
npm run db:seed
```

`npm run use:sqlite` switches back. The driver adapter picks itself from the
`DATABASE_URL` scheme, so no application query changes either way.

## Tests

```bash
npm test
```

57 specs. Unit tests for the pure modules, integration tests for attribution
against a real database built from the real schema — a migration that breaks
per-creator attribution fails the suite.

## Agent logs

`.agent-logs/` holds the prompt/response transcript required by the assignment.
See [CAPTURE-TEST.md](./CAPTURE-TEST.md) for the mechanism, what was verified,
and — honestly — what was not.
