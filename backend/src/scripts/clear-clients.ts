import "dotenv/config";
import { prisma } from "../config/db.js";
import { Role } from "@prisma/client";

async function main() {
  console.log("=== Checking current database state before clearing ===");
  
  const customerCount = await prisma.customerProfile.count();
  const appCount = await prisma.taxApplication.count();
  const taxpayerUserCount = await prisma.user.count({ where: { role: Role.TAXPAYER_USER } });
  const staffCount = await prisma.user.count({ where: { role: { not: Role.TAXPAYER_USER } } });
  const docCount = await prisma.taxDocument.count();
  const quoteCount = await prisma.salesQuote.count();
  const noteCount = await prisma.applicationNote.count();
  const historyCount = await prisma.stageHistory.count();
  const callLogCount = await prisma.callLog.count();
  const auditLogCount = await prisma.auditLog.count();
  const itemCount = await prisma.taxApplicationItem.count();
  const couponUsageCount = await prisma.couponUsage.count();

  console.log({
    customerProfiles: customerCount,
    taxApplications: appCount,
    taxpayerUsers: taxpayerUserCount,
    staffUsersToPreserve: staffCount,
    documents: docCount,
    quotes: quoteCount,
    notes: noteCount,
    stageHistories: historyCount,
    callLogs: callLogCount,
    auditLogs: auditLogCount,
    returnItems: itemCount,
    couponUsages: couponUsageCount,
  });

  console.log("\n=== Starting clean purge of clients and tax filings ===");

  // 1. Clear coupon usages tied to applications or customers
  const deletedCouponUsages = await prisma.couponUsage.deleteMany({});
  console.log(`Deleted ${deletedCouponUsages.count} coupon usages.`);

  // 2. Clear SentEmails tied to applications
  const deletedSentEmails = await prisma.sentEmail.deleteMany({
    where: { applicationId: { not: null } },
  });
  console.log(`Deleted ${deletedSentEmails.count} sent emails tied to applications.`);

  // 3. Clear Notifications tied to applications
  const deletedNotifications = await prisma.notification.deleteMany({
    where: { applicationId: { not: null } },
  });
  console.log(`Deleted ${deletedNotifications.count} notifications tied to applications.`);

  // 4. Clear TaxApplicationItems
  const deletedItems = await prisma.taxApplicationItem.deleteMany({});
  console.log(`Deleted ${deletedItems.count} application items.`);

  // 5. Clear ApplicationNotes
  const deletedNotes = await prisma.applicationNote.deleteMany({});
  console.log(`Deleted ${deletedNotes.count} application notes.`);

  // 6. Clear TaxDocuments
  const deletedDocs = await prisma.taxDocument.deleteMany({});
  console.log(`Deleted ${deletedDocs.count} tax documents.`);

  // 7. Clear SalesQuotes
  const deletedQuotes = await prisma.salesQuote.deleteMany({});
  console.log(`Deleted ${deletedQuotes.count} sales quotes.`);

  // 8. Clear StageHistories
  const deletedHistories = await prisma.stageHistory.deleteMany({});
  console.log(`Deleted ${deletedHistories.count} stage histories.`);

  // 9. Clear CallLogs
  const deletedCallLogs = await prisma.callLog.deleteMany({});
  console.log(`Deleted ${deletedCallLogs.count} call logs.`);

  // 10. Clear AuditLogs
  const deletedAuditLogs = await prisma.auditLog.deleteMany({});
  console.log(`Deleted ${deletedAuditLogs.count} audit logs.`);

  // 11. Delete all TaxApplications
  const deletedApps = await prisma.taxApplication.deleteMany({});
  console.log(`Deleted ${deletedApps.count} tax applications.`);

  // 12. Break self-referential referrals before deleting CustomerProfiles
  await prisma.customerProfile.updateMany({
    where: { referredByCustomerId: { not: null } },
    data: { referredByCustomerId: null },
  });

  // 13. Delete all CustomerProfiles
  const deletedCustomers = await prisma.customerProfile.deleteMany({});
  console.log(`Deleted ${deletedCustomers.count} customer profiles.`);

  // 14. Delete all TAXPAYER_USER accounts (client logins), preserving all staff
  const deletedTaxpayerUsers = await prisma.user.deleteMany({
    where: { role: Role.TAXPAYER_USER },
  });
  console.log(`Deleted ${deletedTaxpayerUsers.count} taxpayer user accounts.`);

  console.log("\n=== Verifying final counts ===");
  const remainingCustomers = await prisma.customerProfile.count();
  const remainingApps = await prisma.taxApplication.count();
  const remainingTaxpayerUsers = await prisma.user.count({ where: { role: Role.TAXPAYER_USER } });
  const remainingStaff = await prisma.user.count();

  console.log({
    remainingCustomerProfiles: remainingCustomers,
    remainingTaxApplications: remainingApps,
    remainingTaxpayerUsers: remainingTaxpayerUsers,
    totalPreservedStaffUsers: remainingStaff,
  });

  console.log("\n✓ ALL clients and tax filings successfully cleared! Ready for fresh testing.");
}

main()
  .catch((e) => {
    console.error("Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
