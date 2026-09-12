// tsx runs this directly, outside Next and outside the Prisma CLI, so
// nothing else has loaded .env for us.
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";
import { pgConnection } from "../src/lib/database-ssl";

const prisma = new PrismaClient({ adapter: new PrismaPg(pgConnection(resolveDatabaseUrl())) });

const n = await prisma.user.count();
console.log(n);
await prisma.$disconnect();
