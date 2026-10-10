import "dotenv/config";
import { prisma } from "../config/db.js";

async function main() {
  console.log("1. Creating OrgRole and UserOrgRole tables if they don't exist...");

  // 1. Create OrgRole table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "OrgRole" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "systemRole" "Role" NOT NULL,
      "department" TEXT NOT NULL DEFAULT 'CUSTOM',
      "sidebarPermissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "defaultRoute" TEXT,
      "isSystemDefault" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "OrgRole_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "OrgRole_name_key" ON "OrgRole"("name");
    CREATE INDEX IF NOT EXISTS "OrgRole_systemRole_idx" ON "OrgRole"("systemRole");
    CREATE INDEX IF NOT EXISTS "OrgRole_department_idx" ON "OrgRole"("department");
  `);

  // 2. Create UserOrgRole table
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserOrgRole" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "orgRoleId" TEXT NOT NULL,
      "isPrimary" BOOLEAN NOT NULL DEFAULT false,
      "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "UserOrgRole_pkey" PRIMARY KEY ("id")
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "UserOrgRole_userId_idx" ON "UserOrgRole"("userId");
    CREATE INDEX IF NOT EXISTS "UserOrgRole_orgRoleId_idx" ON "UserOrgRole"("orgRoleId");
    CREATE UNIQUE INDEX IF NOT EXISTS "UserOrgRole_userId_orgRoleId_key" ON "UserOrgRole"("userId", "orgRoleId");
  `);

  // 3. Add Foreign Keys safely
  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "UserOrgRole" ADD CONSTRAINT "UserOrgRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    DO $$ BEGIN
      ALTER TABLE "UserOrgRole" ADD CONSTRAINT "UserOrgRole_orgRoleId_fkey" FOREIGN KEY ("orgRoleId") REFERENCES "OrgRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 4. Add activeOrgRoleId to User
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "activeOrgRoleId" TEXT;
  `);

  // 5. Update any users assigned to the old team lead roles so data loss is prevented
  console.log("2. Remapping existing users with deprecated team lead roles...");
  await prisma.$executeRawUnsafe(`
    UPDATE "User" SET role = 'DOC_AGENT' WHERE role::text = 'DOC_TEAM_LEAD';
    UPDATE "User" SET role = 'SALES_AGENT' WHERE role::text = 'SALES_TEAM_LEAD';
    UPDATE "User" SET role = 'FILE_OP_AGENT' WHERE role::text = 'FILE_OP_TEAM_LEAD';
  `);

  console.log("✓ Pre-migration completed successfully!");
  console.log("✓ You can now run: docker compose exec backend npx prisma db push --accept-data-loss");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration fix failed:", err);
  process.exit(1);
});
