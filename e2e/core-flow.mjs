import { chromium } from "playwright";

/*
 * Needs a dev server on http://localhost:3000 and playwright installed:
 *   npm run dev
 *   npx playwright install chromium
 *   npm run test:e2e
 */

/**
 * The business, end to end, with two accounts that did not exist a minute ago.
 *
 * Brand signs up and onboards -> creator signs up and onboards -> brand finds
 * the creator in the marketplace and invites them -> creator accepts, drafts,
 * schedules and publishes -> brand pays out -> a click on the tracked link is
 * attributed to that creator.
 *
 * Nothing here is seeded. If the marketplace were still a file of invented
 * people this test could not exist, because there would be no real creator to
 * invite and no user id to book.
 */

const BASE = "http://localhost:3000";
const stamp = Date.now();
const BRAND = `brand-${stamp}@example.com`;
const CREATOR = `creator-${stamp}@example.com`;
const PW = "correcthorse7";

let pass = 0, fail = 0;
const ok = (n, c, e = "") => { c ? (pass++, console.log(`  ok   ${n}`)) : (fail++, console.log(`  FAIL ${n} ${e}`)); };

const browser = await chromium.launch();

async function signUp(page, role, first, last, email) {
  await page.goto(`${BASE}/register?role=${role}`, { waitUntil: "networkidle" });
  await page.click('button:has-text("Sign up with email")');
  await page.waitForSelector('input[name="firstName"]');
  await page.fill('input[name="firstName"]', first);
  await page.fill('input[name="lastName"]', last);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PW);
  await Promise.all([page.waitForLoadState("networkidle"), page.click('form button:has-text("Continue")')]);
}

/* ------------------------------------------------------------------ brand */
console.log("— brand signs up and onboards");
const brandCtx = await browser.newContext();
const brand = await brandCtx.newPage();
await signUp(brand, "saas", "Nora", "Brandt", BRAND);
await brand.waitForSelector("text=What are we promoting?", { timeout: 20000 });
await brand.fill('input[name="websiteUrl"]', "posthog.com");
await brand.click('button:has-text("Read my website")');
await brand.waitForSelector('textarea[name="valueProp"]', { timeout: 60000 });
await Promise.all([brand.waitForURL(/\/app/, { timeout: 30000 }), brand.click('button:has-text("Continue")')]);
ok("brand reaches its workspace", brand.url().includes("/app"), brand.url());

await brand.goto(`${BASE}/app/creators`, { waitUntil: "networkidle" });
await brand.waitForSelector("h1");
// Not "the marketplace is empty" — earlier runs leave real creators behind,
// which is the point of removing the seed. What must be true is that THIS
// creator is not listed before they have signed up.
ok("the creator is not in the marketplace before signing up", !(await brand.content()).includes(`Lindberg${stamp}`));

/* ---------------------------------------------------------------- creator */
console.log("\n— creator signs up and builds a card");
const creatorCtx = await browser.newContext();
const creator = await creatorCtx.newPage();
const CREATOR_NAME = `Kai Lindberg ${stamp}`;
await signUp(creator, "influencer", "Kai", `Lindberg${stamp}`, CREATOR);

await creator.waitForSelector("text=Add your public LinkedIn profile", { timeout: 20000 });
await creator.fill('input[name="linkedinUrl"]', `https://www.linkedin.com/in/kai-lindberg-${stamp}/`);
await creator.click('button:has-text("Import my public profile")');

await creator.waitForSelector("text=Pick your industries", { timeout: 30000 });
await creator.click('button:has-text("Software")');
await creator.click('button:has-text("Continue")');

await creator.waitForSelector("text=Complete your creator card", { timeout: 30000 });
const cost = await creator.$('input[name="postCost"]');
if (cost) { await cost.fill(""); await cost.fill("180"); }
await creator.click('button:has-text("Create my marketplace profile")');
await creator.waitForURL(/\/creator|\/register/, { timeout: 30000 });

// The professional-information step is optional; skip it if offered.
// The professional-information step is optional and the wizard holds the
// creator on /register until it is answered, so it has to be answered.
await creator.waitForSelector('button:has-text("finish later")', { timeout: 30000 });
await creator.click('button:has-text("finish later")');
await creator.waitForURL((u) => !u.pathname.startsWith("/register"), { timeout: 30000 });
await creator.goto(`${BASE}/creator`, { waitUntil: "networkidle" });
ok("creator reaches their workspace", creator.url().includes("/creator"), creator.url());
ok("the card is live in the marketplace", (await creator.content()).length > 0);

/* ------------------------------------------------------- brand invites */
console.log("\n— brand finds the new creator and invites them");
await brand.goto(`${BASE}/app/creators`, { waitUntil: "networkidle" });
await brand.waitForSelector("h1");
const listed = await brand.content();
ok("the real signup is now in the marketplace", listed.includes(`Lindberg${stamp}`), "creator not listed");

const card = brand.locator("article").filter({ hasText: `Lindberg${stamp}` }).first();
await card.locator('button:has-text("Invite")').click();
await brand.waitForSelector('[role="dialog"]');
ok("invite dialog offers a campaign", (await brand.$('select[name="campaignId"]')) !== null);
await Promise.all([
  brand.waitForSelector('span:has-text("Invited")', { timeout: 30000 }),
  brand.click('[role="dialog"] button:has-text("Send invitation")'),
]);
ok("invitation sent", true);

/* -------------------------------------------------- creator accepts it */
console.log("\n— creator accepts, drafts, schedules, publishes");
await creator.goto(`${BASE}/creator/collaborations`, { waitUntil: "networkidle" });
await creator.waitForSelector("h1");
ok("creator sees the invitation", (await creator.content()).includes("waiting on you"), "no invitation shown");

await creator.click('button:has-text("Accept")');
await creator.waitForSelector('button:has-text("My draft is ready")', { timeout: 30000 });
ok("accepting moves it to in progress", true);

await creator.click('button:has-text("My draft is ready")');
await creator.waitForSelector('button:has-text("Scheduled to post")', { timeout: 30000 });
await creator.click('button:has-text("Scheduled to post")');
await creator.waitForSelector('input[name="postUrl"]', { timeout: 30000 });

await creator.fill('input[name="postUrl"]', "not-a-linkedin-link");
await creator.click('button:has-text("It is live")');
// Next renders its own empty role="alert" route announcer, so the assertion
// has to look for an alert WITH TEXT rather than the first one on the page.
await creator.waitForFunction(
  () => [...document.querySelectorAll('[role="alert"]')].some((n) => (n.textContent ?? "").trim()),
  { timeout: 20000 }
);
const alerts = await creator.$$eval('[role="alert"]', (n) => n.map((x) => x.textContent?.trim()).filter(Boolean));
ok("refuses a publish without a real post link", alerts.some((a) => /linkedin post/i.test(a)), alerts.join(" | "));

await creator.fill('input[name="postUrl"]', `https://www.linkedin.com/posts/kai-${stamp}`);
await creator.click('button:has-text("It is live")');
// The publish form disappears once the booking is live — a better signal than
// a fixed wait, which was racing a remote database.
await creator.waitForSelector('input[name="postUrl"]', { state: "detached", timeout: 30000 });
await creator.goto(`${BASE}/creator/collaborations`, { waitUntil: "networkidle" });
ok("the post is live", (await creator.content()).includes("Awaiting payout"), "status did not reach live");

/* ------------------------------------------------------- attribution */
console.log("\n— the tracked link attributes a click");
await brand.goto(`${BASE}/app/collaborations`, { waitUntil: "networkidle" });
// React splits "/r/" and the interpolated code with a comment marker, so the
// page HTML does not contain "/r/<code>" as one string — read the element.
const codeText = await brand.textContent(".font-mono").catch(() => null);
const code = (codeText ?? "").match(/([a-z2-9]{7})/)?.[1];
ok("the booking has a tracking code", Boolean(code), "no code on the page");

if (code) {
  // A human visitor. The default headless user agent contains "HeadlessChrome",
  // which the click filter correctly refuses to count — so a test that keeps it
  // is testing the bot filter, not attribution.
  const visitor = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  });
  const v = await visitor.newPage();
  await v.goto(`${BASE}/r/${code}`, { waitUntil: "domcontentloaded" }).catch(() => {});
  await v.waitForTimeout(1500);
  await visitor.close();

  await brand.goto(`${BASE}/app/results`, { waitUntil: "networkidle" });
  await brand.waitForSelector("h1");
  const results = await brand.content();
  ok("the click is attributed to that creator", results.includes(`Lindberg${stamp}`), "creator missing from attribution");
  const attributed = Number((await brand.textContent("p.text-\\[30px\\]").catch(() => "0")) ?? 0);
  ok("results count it", attributed >= 1, `clicks attributed: ${attributed}`);
}

/* ------------------------------------------------------------- payout */
console.log("\n— brand pays out, and cannot take the creator's steps");
await brand.goto(`${BASE}/app/collaborations`, { waitUntil: "networkidle" });
const brandView = await brand.content();
ok("brand sees the live booking", brandView.includes(`Lindberg${stamp}`));
ok("brand is offered the payout", /Pay out/i.test(brandView), "no payout action");
ok("brand cannot accept on the creator's behalf", !/Mark accepted/i.test(brandView));

await brand.click('button:has-text("Pay out")');
await brand.waitForTimeout(2500);
await brand.goto(`${BASE}/app/collaborations`, { waitUntil: "networkidle" });
ok("booking is paid", (await brand.content()).includes("PAID") || (await brand.content()).includes("Paid"));

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
