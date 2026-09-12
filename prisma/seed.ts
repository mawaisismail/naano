// tsx runs this directly, outside Next and outside the Prisma CLI, so
// nothing else has loaded .env for us.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import { CREATORS } from "../src/lib/creators";
import { hashPassword } from "../src/lib/password";
import { makeTrackingCode } from "../src/lib/tracking";

// Same driver selection as the app, so seeding a deployed Postgres database
// works with no change beyond DATABASE_URL.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() }),
});

// Public demo credentials. These are printed on the login page on purpose:
// a reviewer must be able to see both sides of the marketplace without
// signing up. They are seed data in a public repo, not secrets.
export const DEMO = {
  brand: { email: "brand@naano.demo", password: "demo1234" },
  creator: { email: "creator@naano.demo", password: "demo1234" },
};

async function main() {
  // idempotent: wipe the mutable half, leave the static creators alone
  await prisma.click.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();

  const brand = await prisma.user.create({
    data: {
      email: DEMO.brand.email,
      passwordHash: hashPassword(DEMO.brand.password),
      name: "Alex Rivera",
      role: "brand",
      companyName: "Northwind Analytics",
    },
  });

  // the creator demo account impersonates one of the seeded marketplace creators
  const me = CREATORS[3];
  await prisma.user.create({
    data: {
      email: DEMO.creator.email,
      passwordHash: hashPassword(DEMO.creator.password),
      name: me.name,
      role: "creator",
      creatorSlug: me.slug,
      // The demo creator is a finished account: a reviewer signing in should
      // land in the workspace, not be dropped into onboarding. Leaving these
      // unset made the seeded creator indistinguishable from a fresh signup.
      onboardedAt: new Date(),
      onboardingStep: 6,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      profileDataSource: "demo",
      linkedinUrl: `https://www.linkedin.com/in/${me.slug}/`,
      linkedinImportedAt: new Date(),
      headline: me.headline,
      bio: me.bio,
      country: me.country,
      countryCode: me.countryCode,
      flag: me.flag,
      avatarUrl: me.avatar,
      followers: me.followers,
      medianViews: me.medianViews,
      postCost: me.postCost,
      reactionsPerPost: me.reactionsPerPost,
      commentsPerPost: me.commentsPerPost,
      industries: me.verticals,
      verticals: me.verticals,
      icp: me.icp,
    },
  });

  // Open campaigns for the creator-side Opportunities board. These are demo
  // brands, not naano's real advertisers: the board needs enough variety for
  // the industry, country and channel filters to be worth using, and inventing
  // a handful of plausible B2B products is safer than republishing real ones.
  const OPEN_CAMPAIGNS = [
    {
      name: "Premium Inboxes",
      objective: "Get RevOps leads trialling our deliverability suite",
      industries: ["SaaS", "Sales", "RevOps"],
      countries: ["France", "Germany", "Netherlands", "United Kingdom", "Spain"],
      days: 6,
    },
    {
      name: "OrbiSearch",
      objective: "Developers searching their own codebase in plain English",
      industries: ["DevTools", "AI", "Software"],
      countries: ["United Kingdom", "Germany", "Pakistan"],
      days: 6,
    },
    {
      name: "Northwind Analytics",
      objective: "Show RevOps teams what their reporting stack is hiding",
      industries: ["RevOps", "Data", "SaaS"],
      countries: [],
      days: 12,
    },
    {
      name: "Fernpay",
      objective: "Cross-border payouts for teams that hire everywhere",
      industries: ["Fintech", "HR-Tech"],
      countries: ["France", "Spain"],
      days: 3,
    },
    {
      name: "Halterview",
      objective: "Security reviews that do not block a release train",
      industries: ["Security", "DevTools"],
      countries: ["United Kingdom", "Netherlands"],
      days: 21,
    },
  ];

  for (const c of OPEN_CAMPAIGNS) {
    // Each demo campaign gets its own brand account. They all hung off the one
    // seeded brand at first, which made every card on the Opportunities board
    // show the same company name — the board is meant to show who is buying.
    const slug = c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const owner = await prisma.user.create({
      data: {
        email: `hello@${slug}.demo`,
        passwordHash: hashPassword("demo1234"),
        name: `${c.name} team`,
        role: "brand",
        companyName: c.name,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.campaign.create({
      data: {
        brandId: owner.id,
        name: c.name,
        objective: c.objective,
        keyMessages: `Why ${c.name} exists, in the creator's own words.`,
        guidelines: "One post, your voice, no script. Disclose the partnership.",
        landingUrl: `https://example.com/${c.name.toLowerCase().replace(/\s+/g, "-")}`,
        status: "live",
        channel: "linkedin",
        industries: c.industries,
        countries: c.countries,
        postDeadline: new Date(Date.now() + c.days * 86_400_000),
      },
    });
  }

  // A campaign already in flight, so the dashboard is not empty on first login
  // and the click counter has history to sit on top of.
  const picked = [CREATORS[0], CREATORS[1], CREATORS[2], me, CREATORS[5]];

  const campaign = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      name: "Q3 pipeline push",
      objective: "Drive qualified trials of Northwind's RevOps reporting suite",
      keyMessages: [
        "Forecasts should reconcile with the bank account, not just the CRM",
        "Attribution that survives a CFO review",
        "Live in a day, not a quarter",
      ].join("\n"),
      guidelines: [
        "Write in your own voice — do not read from the brief",
        "Lead with a problem you have actually hit in RevOps",
        "One tracked link, placed in the first comment",
        "Disclose the partnership",
      ].join("\n"),
      landingUrl: "https://northwind.example.com/trial",
      status: "live",
    },
  });

  const states = ["live", "live", "scheduled", "accepted", "invited"] as const;

  for (let i = 0; i < picked.length; i++) {
    const c = picked[i];
    const status = states[i];
    const deal = await prisma.deal.create({
      data: {
        campaignId: campaign.id,
        creatorId: c.id,
        creatorSlug: c.slug,
        creatorName: c.name,
        price: c.postCost,
        status,
        trackingCode: makeTrackingCode(),
        postUrl: status === "live" ? `https://www.linkedin.com/posts/${c.slug}-example` : null,
        publishedAt: status === "live" ? new Date(Date.now() - (i + 1) * 36e5 * 18) : null,
      },
    });

    // historic clicks only on posts that are actually live
    if (status === "live") {
      const n = 40 + Math.floor(Math.random() * 90);
      await prisma.click.createMany({
        data: Array.from({ length: n }, () => ({
          dealId: deal.id,
          trackingCode: deal.trackingCode,
          referer: "https://www.linkedin.com/",
          userAgent: "seed",
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 72) * 36e5),
        })),
      });
    }
  }

  // A second campaign holding a pending offer for the creator demo account, so
  // the creator side has something to accept live in a walkthrough rather than
  // opening on an empty inbox.
  const offer = await prisma.campaign.create({
    data: {
      brandId: brand.id,
      name: "Devtools launch — waitlist",
      objective: "Get platform engineers onto the waitlist for Northwind Pipelines",
      keyMessages: [
        "Pipelines you can read six months later",
        "No DSL to learn — it is the language you already use",
        "Runs on your own infrastructure",
      ].join("\n"),
      guidelines: [
        "Write in your own voice",
        "Show the implementation, not the marketing site",
        "Tracked link in the first comment",
        "Disclose the partnership",
      ].join("\n"),
      landingUrl: "https://northwind.example.com/pipelines",
      status: "live",
      deals: {
        create: {
          creatorId: me.id,
          creatorSlug: me.slug,
          creatorName: me.name,
          price: me.postCost,
          status: "invited",
          trackingCode: makeTrackingCode(),
        },
      },
    },
  });

  const clicks = await prisma.click.count();
  console.log(
    `seeded: 2 users, 2 campaigns, ${picked.length + 1} deals, ${clicks} clicks\n` +
      `  pending offer for ${me.name} in "${offer.name}"\n` +
      `  brand   ${DEMO.brand.email} / ${DEMO.brand.password}\n` +
      `  creator ${DEMO.creator.email} / ${DEMO.creator.password}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
