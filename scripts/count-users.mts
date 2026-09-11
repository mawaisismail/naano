import { PrismaClient } from "@prisma/client";
import { makeAdapter } from "../src/lib/adapter";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const prisma = new PrismaClient({ adapter: makeAdapter(resolveDatabaseUrl()) });

const n = await prisma.user.count();
console.log(n);
await prisma.$disconnect();
