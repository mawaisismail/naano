import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { pgConnection } from "../src/lib/database-ssl";
import { resolveDatabaseUrl } from "../src/lib/database-url";
const p = new PrismaClient({
  adapter: new PrismaPg({ ...pgConnection(resolveDatabaseUrl()), max: 1 }),
});
const u = await p.user.findUnique({ where: { email: "roxaf67642@daugr.com" } });
console.log(u ? `account EXISTS: role=${u.role} onboarded=${Boolean(u.brandOnboardedAt)} site=${u.websiteUrl ?? "-"}` : "no account with that email");
console.log(`users ${await p.user.count()} | campaigns ${await p.campaign.count()} | deals ${await p.deal.count()}`);
await p.$disconnect();
