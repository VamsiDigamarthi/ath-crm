import "dotenv/config";
import { prisma } from "../config/db.js";
import { Role } from "@prisma/client";

async function main() {
  console.log("=== Finding staff to delete (preserving ADMIN) ===");

  // Find all non-admin users
  const nonAdminUsers = await prisma.user.findMany({
    where: {
      role: {
        not: Role.ADMIN,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });

  const staffIds = nonAdminUsers.map((u) => u.id);

  console.log(`Found ${nonAdminUsers.length} non-admin users:`);
  nonAdminUsers.forEach((u) => {
    console.log(`  - [${u.role}] ${u.firstName} ${u.lastName} (${u.email})`);
  });

  if (staffIds.length === 0) {
    console.log("No staff users to delete.");
    return;
  }

  console.log("\n=== Cleaning up related records for non-admin users ===");

  // 1. Delete UserOrgRole junction records
  const deletedOrgRoles = await prisma.userOrgRole.deleteMany({
    where: { userId: { in: staffIds } },
  });
  console.log(`Deleted ${deletedOrgRoles.count} UserOrgRole assignments.`);

  // 2. Delete UserPermissions
  const deletedPermissions = await prisma.userPermission.deleteMany({
    where: {
      OR: [
        { userId: { in: staffIds } },
        { grantedById: { in: staffIds } },
      ],
    },
  });
  console.log(`Deleted ${deletedPermissions.count} user permissions.`);

  // 3. Delete Notifications
  const deletedNotifications = await prisma.notification.deleteMany({
    where: { recipientUserId: { in: staffIds } },
  });
  console.log(`Deleted ${deletedNotifications.count} notifications.`);

  // 4. Delete SentEmails
  const deletedSentEmails = await prisma.sentEmail.deleteMany({
    where: { senderUserId: { in: staffIds } },
  });
  console.log(`Deleted ${deletedSentEmails.count} sent emails.`);

  // 5. Unlink created EmailTemplates
  const unlinkedTemplates = await prisma.emailTemplate.updateMany({
    where: { createdById: { in: staffIds } },
    data: { createdById: null },
  });
  console.log(`Unlinked ${unlinkedTemplates.count} email templates.`);

  // 6. Delete CustomerProfiles linked to any deleted users (if any)
  const deletedProfiles = await prisma.customerProfile.deleteMany({
    where: { userId: { in: staffIds } },
  });
  console.log(`Deleted ${deletedProfiles.count} customer profiles.`);

  // 7. Delete the staff / non-admin users
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: staffIds } },
  });
  console.log(`\nDeleted ${deletedUsers.count} non-admin users.`);

  // 8. Verify preserved Admin users
  const preservedAdmins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
  });

  console.log("\n=== Preserved Admin Users in Database ===");
  console.log(preservedAdmins);

  const totalRemainingUsers = await prisma.user.count();
  console.log(`\nTotal remaining users in DB: ${totalRemainingUsers}`);
  console.log("✓ All staff except Admin successfully cleared!");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Error clearing staff:", err);
  process.exit(1);
});
