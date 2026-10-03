import { randomInt } from "crypto";
import { prisma } from "../config/db.js";

/**
 * Generates a unique lead referral code, e.g. ROHIT482
 */
export const generateUniqueReferralCode = async (
  firstName?: string | null,
  reserved?: Set<string>
): Promise<string> => {
  const prefix = (firstName || "TAX").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6) || "TAX";

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `${prefix}${randomInt(100, 1000)}`;
    const taken = await prisma.customerProfile.findUnique({ where: { referralCode: code }, select: { id: true } });
    if (!taken && !reserved?.has(code)) {
      reserved?.add(code);
      return code;
    }
  }
  return `${prefix}${randomInt(10000, 100000)}`;
};
