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

There are no demo accounts, because there is no seed. The marketplace is
whoever has signed up, so a fresh database is legitimately empty and every
screen that can be empty says what it is waiting for.

To see the product, walk the loop it exists for — it takes about three minutes
and is the same path `npm run test:e2e` automates:

1. `/register?role=saas` — sign up as a brand, give it a real company URL. The
   site is read and turned into a value proposition and three ICPs.
2. `/register?role=influencer` in another browser — sign up as a creator and
   finish the card.
3. Back on the brand: **Creators** now lists that person, ranked against your
   ICPs. **Invite** them onto the campaign the wizard created.
4. On the creator: **Collaborations** shows the invitation. Accept it, mark the
   draft ready, schedule it, then paste the post URL to publish.
5. Back on the brand: the booking is live with its own tracking link, and
   **Results** attributes every click on it to that creator. Pay out.

```bash
# any Postgres will do; 5433 keeps it clear of a 5432 you may already be using
docker run -d --name naano-pg -p 5433:5432 \
  -e POSTGRES_PASSWORD=naano -e POSTGRES_DB=naano postgres:16-alpine

cp .env.example .env       # then fill in DATABASE_URL and SESSION_SECRET
npm install
npx prisma migrate deploy  # create the tables from prisma/migrations
npm run dev
```

The schema is versioned in `prisma/migrations`, and both the deploy script and
the test harness apply it with `migrate deploy` rather than `db push` — a push
invents a schema change nobody reviewed and will drop a column to get there.

Postgres is the only supported database — locally, in CI and in production.
There is no second provider and no datasource switching, so the engine the
tests run against is the engine that serves production.

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
| 01 Match | Landing page, marketplace of signed-up creators, filters on vertical / audience tier / price / country, AI matching against the brand's ICPs |
| 02 Brief | Brand onboarding reads the company site and drafts the brief; creators are invited onto it, or apply to it |
| 03 Manage | Booking lifecycle: invited → accepted → draft → scheduled → live → paid, each step taken by the side that does the work |
| 04 Track | `/r/[code]` tracked links, per-creator click attribution, live counters |
| 05 Pay | Booking prices, campaign spend, cost per click, creator earnings |

Both sides work, and they work on each other: brands book and track at `/app`,
creators accept, publish and get paid at `/creator`. `npm run test:e2e` walks
the whole loop with two accounts it creates as it goes.

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

**Every creator is a database row.** They used to be a static file of invented
people, which made the marketplace a brochure: nothing a real signup did could
appear in it, and a `Deal` referenced a seed id no foreign key could check.
A booking now has a real relation to the user being booked, with a unique index
on (campaign, creator) so one creator cannot end up with two posts to pay for
on the same campaign.

**A booking is moved by whichever side does that step.** The creator accepts an
invitation, writes the draft, schedules it and publishes it; the brand pays
out. `initiatedBy` records who opened the conversation, because the side that
did NOT start it is the side that answers — otherwise either party could book
the other unilaterally. The rule is `ownerOf()` in `src/lib/lifecycle.ts` and
it is enforced in both sides' actions.

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

Next.js 16 (App Router) · TypeScript · Tailwind v4 · Prisma 7 · Postgres · Vitest

Design tokens are taken from naano's live CSS: `#1652f0` brand, Plus Jakarta
Sans + Inter, the soft sky-to-white gradients.

## Routing and the authentication boundary

Routes are split into two groups. Route groups are a folder convention only —
neither name appears in a URL, so every path is unchanged.

```
src/app/(public)/          /, /creators, /agencies, /blog, /free-tools,
                           /marketplace, /login, /register, /r/[code], …
src/app/(authenticated)/   /app/**   brand dashboard
                           /studio/** creator studio
src/proxy.ts               the edge gate
src/lib/routes.ts          the one list both of them read
```

Authentication is enforced in two places, deliberately:

| | |
|---|---|
| `src/proxy.ts` | Next 16 renamed Middleware to **Proxy**; same model, new file convention. Runs on every matched navigation, so it only asks whether a session cookie *exists* and redirects signed-out traffic to `/login?next=…`. Per the Next docs, Proxy is for optimistic checks, never for authorization. |
| `src/app/(authenticated)/layout.tsx` | The real check. Verifies the cookie signature and loads the user, so a forged or expired cookie that sails past the proxy is stopped here. Every section added to the group inherits it. |

Both read `PROTECTED_PREFIXES` from `src/lib/routes.ts`, so a new protected
section cannot be added to the router and forgotten at the gate.

## Deploying

Set `DATABASE_URL` to a Postgres connection string. On Vercel, attaching a
Postgres store is enough — it injects `POSTGRES_PRISMA_URL`, which the app
picks up on its own. Set `SESSION_SECRET` to at least 32 random characters
(`openssl rand -base64 32`); the app refuses to start without it.

`npm run build` pushes the schema and seeds only if the database is empty, so a
redeploy never wipes what a reviewer just did.

## Tests

```bash
npm test
```

91 specs. Unit tests for the pure modules — including the route map that the
authentication boundary is built on — plus integration tests for attribution
against a real Postgres database built from the real schema, so a migration
that breaks per-creator attribution fails the suite.

The integration tests provision a throwaway `naano_test_<random>` schema, push
the real Prisma schema into it and drop it afterwards, so they can point at a
database that holds real data without touching it. With no Postgres configured
they skip and the rest of the suite still runs; CI always supplies one.

```bash
git config core.hooksPath .githooks   # arm the pre-commit secret scan
```

## Agent logs

`.agent-logs/` holds the prompt/response transcript required by the assignment.
See [CAPTURE-TEST.md](./CAPTURE-TEST.md) for the mechanism, what was verified,
and — honestly — what was not.
