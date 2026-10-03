import "dotenv/config";
import { prisma } from "../config/db.js";
import { Role } from "@prisma/client";

// Additive seed: creates one manager + agent(s) per department. Skips existing emails. Never deletes data.
const staff = [
  { firstName: "Doc", lastName: "Manager", email: "docmanager@taxcrm.com", mobile: "9000000001", role: Role.DOC_MANAGER },
  { firstName: "Doc", lastName: "Agent", email: "docagent@taxcrm.com", mobile: "9000000002", role: Role.DOC_AGENT },
  { firstName: "Prep", lastName: "Manager", email: "prepmanager@taxcrm.com", mobile: "9000000003", role: Role.PREP_MANAGER },
  { firstName: "Tax", lastName: "Preparer", email: "preparer@taxcrm.com", mobile: "9000000004", role: Role.TAX_PREPARER },
  { firstName: "Tax", lastName: "Reviewer", email: "reviewer@taxcrm.com", mobile: "9000000005", role: Role.TAX_REVIEWER },
  { firstName: "Sales", lastName: "Manager", email: "salesmanager@taxcrm.com", mobile: "9000000006", role: Role.SALES_MANAGER },
  { firstName: "Sales", lastName: "Agent", email: "salesagent@taxcrm.com", mobile: "9000000007", role: Role.SALES_AGENT },
  { firstName: "Filing", lastName: "Manager", email: "filingmanager@taxcrm.com", mobile: "9000000008", role: Role.FILE_OP_MANAGER },
  { firstName: "Filing", lastName: "Agent", email: "filingagent@taxcrm.com", mobile: "9000000009", role: Role.FILE_OP_AGENT },
];

async function main() {
  for (const s of staff) {
    const existing = await prisma.user.findFirst({ where: { email: s.email } });
    if (existing) {
      console.log(`= exists  ${s.role.padEnd(16)} ${s.email}`);
      continue;
    }
    await prisma.user.create({ data: { ...s, isActive: true } });
    console.log(`+ created ${s.role.padEnd(16)} ${s.email}`);
  }
}

main()
  .catch((e) => {
    console.error("Error seeding staff:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
