import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolveDatabaseUrl } from "../src/lib/database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: resolveDatabaseUrl() }) });

const n = await prisma.user.count();
console.log(n);
await prisma.$disconnect();
