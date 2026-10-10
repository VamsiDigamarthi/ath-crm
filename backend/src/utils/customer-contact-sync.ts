import { prisma } from "../config/db.js";
import { BadRequestError } from "../errors/bad-request-error.js";

/**
 * A customer has two records: the CustomerProfile (what screens show) and the User
 * login account (what OTP login checks). Email and phone must stay identical in both,
 * otherwise the client cannot log in with the email shown on their profile.
 */

/** Profile → login: call before saving a new email / phone on a CustomerProfile */
export const syncLoginFromProfile = async (profileId: string, contact: { email?: string; phone?: string }) => {
  const email = contact.email?.trim().toLowerCase() || undefined;
  const phone = contact.phone?.trim() || undefined;
  if (!email && !phone) return;

  const profile = await prisma.customerProfile.findUnique({ where: { id: profileId }, select: { userId: true } });
  if (!profile?.userId) return; // no login account yet (e.g. raw lead)

  // Login uses findFirst on email / mobile, so another account with the same value would break login
  if (email) {
    const clash = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, id: { not: profile.userId } },
      select: { id: true },
    });
    if (clash) throw new BadRequestError(`The email ${email} is already used by another login account.`);
  }
  if (phone) {
    const clash = await prisma.user.findFirst({
      where: { mobile: phone, id: { not: profile.userId } },
      select: { id: true },
    });
    if (clash) throw new BadRequestError(`The phone ${phone} is already used by another login account.`);
  }

  await prisma.user.update({
    where: { id: profile.userId },
    data: { ...(email ? { email } : {}), ...(phone ? { mobile: phone } : {}) },
  });
};

/** Login → profile: call after a User's email / mobile changed */
export const syncProfileFromLogin = async (userId: string, contact: { email?: string | null; mobile?: string | null }) => {
  const data: { email?: string; phone?: string } = {};
  if (contact.email) data.email = contact.email.trim().toLowerCase();
  if (contact.mobile) data.phone = contact.mobile.trim();
  if (!data.email && !data.phone) return;
  await prisma.customerProfile.updateMany({ where: { userId }, data });
};
