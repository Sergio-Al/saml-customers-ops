/**
 * Seed: demo tenant + demo user.
 * Matches Phase 2 hardcoded credentials.
 */
import { PrismaClient } from "../node_modules/.prisma/auth-client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@ai-ops.local";
const DEMO_PASSWORD = "demo1234";
const DEMO_NAME = "Demo Operator";

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { displayName: DEMO_NAME, passwordHash },
    create: {
      email: DEMO_EMAIL,
      displayName: DEMO_NAME,
      passwordHash,
    },
  });

  console.log(`Seeded auth user: ${user.email} (${user.id})`);

  console.log(`Login with: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);

  console.log(`NOTE: run tenant-service seed too — it creates the membership.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
