import "dotenv/config";
import { prisma } from "../config/db.js";
import { OrgRoleService, DEFAULT_ORG_ROLES } from "../features/admin/org-role-service.js";

async function main() {
  console.log("=== Re-seeding OrgRoles with exact sidebar permissions ===");
  await OrgRoleService.seedDefaultOrgRoles();

  const allRoles = await prisma.orgRole.findMany({
    select: {
      name: true,
      systemRole: true,
      department: true,
      sidebarPermissions: true,
      defaultRoute: true,
    },
  });

  console.log(`\nSuccessfully updated ${allRoles.length} OrgRoles in database:`);
  allRoles.forEach((r) => {
    console.log(`\n[${r.name}] (${r.systemRole} - ${r.department})`);
    console.log(`  Route: ${r.defaultRoute}`);
    console.log(`  Permissions (${r.sidebarPermissions.length}): ${r.sidebarPermissions.join(", ")}`);
  });

  await prisma.$disconnect();
  console.log("\n✓ Database OrgRoles seeding completed successfully!");
}

main().catch((err) => {
  console.error("Failed to seed roles:", err);
  process.exit(1);
});
