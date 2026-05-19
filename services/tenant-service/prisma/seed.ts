/**
 * Seed: demo tenant `acme` + membership for the demo user from auth-service seed.
 *
 * Run AFTER auth-service seed:
 *   pnpm --filter @ai-ops/auth-service prisma:seed
 *   pnpm --filter @ai-ops/tenant-service prisma:seed
 */
import { PrismaClient } from "../node_modules/.prisma/tenant-client";

const prisma = new PrismaClient();

const DEMO_TENANT_SLUG = "acme";
const DEMO_TENANT_NAME = "Acme Corp";
const DEMO_USER_EMAIL = "demo@ai-ops.local";

async function main(): Promise<void> {
  // Look up the demo user from the auth schema (same database, both schemas in `public`).
  const userRow = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM auth.auth_users WHERE email = ${DEMO_USER_EMAIL} LIMIT 1
  `;
  if (userRow.length === 0) {
    console.error(
      `Demo user ${DEMO_USER_EMAIL} not found in auth_users. Run auth-service seed first.`,
    );
    process.exit(1);
  }
  const userId = userRow[0].id;

  const tenant = await prisma.tenant.upsert({
    where: { slug: DEMO_TENANT_SLUG },
    update: { name: DEMO_TENANT_NAME },
    create: { slug: DEMO_TENANT_SLUG, name: DEMO_TENANT_NAME, plan: "growth" },
  });

  const membership = await prisma.tenantMembership.upsert({
    where: { userId_tenantId: { userId, tenantId: tenant.id } },
    update: { role: "operator", email: DEMO_USER_EMAIL },
    create: {
      userId,
      tenantId: tenant.id,
      role: "operator",
      email: DEMO_USER_EMAIL,
    },
  });

  console.log(`Seeded tenant: ${tenant.slug} (${tenant.id})`);

  console.log(`Seeded membership: ${userId} → ${tenant.id} as ${membership.role}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
