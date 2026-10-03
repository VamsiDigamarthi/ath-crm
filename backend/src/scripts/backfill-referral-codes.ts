import "dotenv/config";
import { prisma } from "../config/db.js";
import { generateUniqueReferralCode } from "../utils/referral.js";

// Assigns a referral code to every existing lead that doesn't have one yet. Safe to re-run.
async function main() {
  const leads = await prisma.customerProfile.findMany({
    where: { referralCode: null },
    select: { id: true, firstName: true, email: true },
  });

  for (const lead of leads) {
    const referralCode = await generateUniqueReferralCode(lead.firstName);
    await prisma.customerProfile.update({ where: { id: lead.id }, data: { referralCode } });
    console.log(`+ ${referralCode.padEnd(12)} ${lead.email}`);
  }
  console.log(`Done. ${leads.length} leads updated.`);
}

main()
  .catch((e) => {
    console.error("Error backfilling referral codes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
