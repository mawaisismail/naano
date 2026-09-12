# Deploying to Vercel

Target: **https://naano.awaisismail.me**

One set of infrastructure serves local development and production — the same
Postgres, the same Valkey, the same mail provider. "Works on my machine" and
"works deployed" are therefore the same claim, which is the point.

---

## 1. Where things run, and why it matters

Both managed services sit in **Santa Clara, California**. Vercel's default
function region is `iad1` (Washington DC), which puts roughly 60 ms of round
trip between the app and its database — on every query, and a page makes
several. `vercel.json` pins functions to **`sfo1`** (San Francisco) instead,
which is a few milliseconds away.

If you move the database, move this too. A mismatched region is the single
easiest way to make a fast app feel slow, and it never shows up locally.

## 2. Environment variables

Set these in **Project → Settings → Environment Variables**, for Production and
Preview. Values are in your local `.env`; this file deliberately names them
without repeating the secrets.

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Aiven Postgres URI, `?sslmode=require` |
| `DIRECT_DATABASE_URL` | Same URI. Migrations must not go through a pooler. |
| `DATABASE_CA_CERT` | The provider's CA, **PEM including newlines**. Paste it whole — Vercel accepts multi-line values. Without it the connection is encrypted but unverified. |
| `TEST_DATABASE_URL` | Only needed for CI. |
| `REDIS_URL` | Aiven Valkey, `rediss://` |
| `SESSION_SECRET` | 32+ chars. The app refuses to boot without it. Generate a **new** one for production: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SITE_URL` | `https://naano.awaisismail.me` |
| `RESEND_API_KEY` | Send-only key |
| `EMAIL_FROM` | `Naano <no-reply@awaisismail.me>` — see §4 |
| `DEMO_PASSWORD_RESET` | `0`. Setting it to `1` re-enables a fixed reset PIN, which is an account-takeover hole. |
| `GOOGLE_CLIENT_ID` / `_SECRET` | Optional; the buttons say "not available" without them. |
| `LINKEDIN_CLIENT_ID` / `_SECRET` | Optional, same. |
| `EXA_API_KEY` | The site read in brand onboarding. Without it the read falls back to generated text, labelled. |
| `CLOUDFLARE_ACCOUNT_ID` | Workers AI account. |
| `CLOUDFLARE_API_TOKEN` | Workers AI token, "Workers AI: Read" and nothing else. Without it, matching falls back to word overlap and says so. |

`DATABASE_POOL_MAX` is optional: it defaults to 3 on Vercel, because every
concurrent request is its own instance with its own pool and the plan allows 20
connections in total. Raise it only if you know the instance count is low.

## 3. DNS

`naano.awaisismail.me` needs to exist before Vercel will serve it. Add the
domain under **Project → Settings → Domains** and create the record Vercel
gives you (a `CNAME` to `cname.vercel-dns.com`, or the `A` record for an apex).

At the time of writing the subdomain has no DNS records at all, while the apex
`awaisismail.me` already resolves to Vercel.

## 4. Email

The sending domain must be verified **at the mail provider**, separately from
DNS being correct. The DKIM and SPF records for `awaisismail.me` are published
and correct:

```
resend._domainkey.awaisismail.me   TXT   p=MIGfMA0GCSqGSIb3…
send.awaisismail.me                MX    feedback.forge.rmta.net
send.awaisismail.me                TXT   v=spf1 ip4:52.3.252.119 …
```

The provider reported the domain as unverified for a while after the records
were published — verification is a separate step from DNS being right, and it
lags. It is **verified now**: a send from `no-reply@awaisismail.me` to an
address that is not the account owner's is accepted, which is the only proof
that matters.

Note that a subdomain is a separate domain to the provider: verifying
`awaisismail.me` does not verify `naano.awaisismail.me`. `EMAIL_FROM` uses the
apex for that reason, even though the site runs on the subdomain — which is
normal and does not hurt deliverability, since the DKIM signature and the SPF
record both belong to the apex.

## 5. OAuth redirect URIs

Register exactly this callback with both providers, alongside the localhost one:

```
https://naano.awaisismail.me/api/auth/oauth/callback
http://localhost:3000/api/auth/oauth/callback
```

Scopes: `openid email profile` (Google), `openid profile email` (LinkedIn, via
"Sign In with LinkedIn using OpenID Connect" — the older `r_liteprofile` scopes
are not granted to new apps).

## 6. Model latency, and the function limit

Step 1 of brand onboarding crawls the site and runs a model over it: about ten
seconds in practice, capped at fifteen for the crawl and twenty for the model.
Vercel's default function limit is ten seconds, which would kill that mid-read
and show a failure for a request that was working — so `/register` declares
`maxDuration = 60`. The wizard shows its "Reading your brand…" step throughout,
which is what that screen is for.

Nothing else in the app waits on a model. Creator embeddings are cached in
Valkey and in process, so AI Matching is a cache read after the first request.

## 7. What the build does

`npm run build` runs `prisma generate`, then `scripts/deploy-db.mjs`, then
`next build`. The middle step applies migrations and writes nothing else:
there is no seed, so a deploy can never overwrite data a reviewer has entered.

## 8. After the first deploy

- [ ] `https://naano.awaisismail.me` loads
- [ ] Sign up as a brand; the site read reaches "Read from <domain>"
- [ ] Sign up as a creator in another browser and finish the card
- [ ] The brand's **Creators** screen now lists that creator; invite them
- [ ] The creator accepts, publishes, and the brand pays out
- [ ] Password reset sends a real email (requires §4)
- [ ] Rate limiting holds across instances: eleven failed logins in a minute
      should be refused, not ten per server
- [ ] Brand sign-up with a real company URL reaches "Read from <domain>", not
      the "Generated, not read" note
- [ ] AI Matching says "Scored by meaning", not "Word-overlap ranking"
