import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { NotFoundError } from "../../errors/not-found-error.js";
import { PERMISSION_CATALOG, findPermission } from "./permission-catalog.js";

export class PermissionService {
  static async listWithUsers() {
    const roles = Array.from(new Set(PERMISSION_CATALOG.flatMap((p) => p.roles)));
    const [users, grants] = await Promise.all([
      prisma.user.findMany({
        where: { role: { in: roles }, isActive: true },
        select: { id: true, firstName: true, lastName: true, email: true, role: true },
        orderBy: [{ firstName: "asc" }, { email: "asc" }],
      }),
      prisma.userPermission.findMany({
        where: { permission: { in: PERMISSION_CATALOG.map((p) => p.key) } },
        select: { userId: true, permission: true },
      }),
    ]);

    const granted = new Set(grants.map((g) => `${g.permission}:${g.userId}`));

    return PERMISSION_CATALOG.map((perm) => {
      const eligible = users
        .filter((u) => perm.roles.includes(u.role))
        .map((u) => ({
          id: u.id,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unnamed",
          email: u.email,
          role: u.role,
          enabled: granted.has(`${perm.key}:${u.id}`),
        }));
      return {
        ...perm,
        users: eligible,
        enabledCount: eligible.filter((u) => u.enabled).length,
      };
    });
  }

  static async setUserPermission(key: string, userId: string, enabled: boolean, grantedById?: string) {
    const perm = findPermission(key);
    if (!perm) throw new NotFoundError("Permission not found");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } });
    if (!user) throw new NotFoundError("User not found");
    if (!perm.roles.includes(user.role)) {
      throw new BadRequestError("This permission is not available for this user's role");
    }

    if (enabled) {
      await prisma.userPermission.upsert({
        where: { userId_permission: { userId, permission: key } },
        create: { userId, permission: key, grantedById: grantedById || null },
        update: {},
      });
    } else {
      await prisma.userPermission.deleteMany({ where: { userId, permission: key } });
    }
    return { key, userId, enabled };
  }

  static async setBulk(key: string, userIds: string[], enabled: boolean, grantedById?: string) {
    const perm = findPermission(key);
    if (!perm) throw new NotFoundError("Permission not found");

    const uniqueIds = Array.from(new Set(userIds));
    const users = await prisma.user.findMany({ where: { id: { in: uniqueIds } }, select: { id: true, role: true } });
    if (users.length !== uniqueIds.length) throw new NotFoundError("One or more users were not found");
    if (users.some((u) => !perm.roles.includes(u.role))) {
      throw new BadRequestError("This permission is not available for one or more selected users");
    }

    if (enabled) {
      await prisma.userPermission.createMany({
        data: uniqueIds.map((userId) => ({ userId, permission: key, grantedById: grantedById || null })),
        skipDuplicates: true,
      });
    } else {
      await prisma.userPermission.deleteMany({ where: { permission: key, userId: { in: uniqueIds } } });
    }
    return { key, count: uniqueIds.length, enabled };
  }

  static async getUserPermissionKeys(userId: string): Promise<string[]> {
    const rows = await prisma.userPermission.findMany({ where: { userId }, select: { permission: true } });
    return rows.map((r) => r.permission);
  }

  static async hasPermission(userId: string, key: string): Promise<boolean> {
    const row = await prisma.userPermission.findUnique({
      where: { userId_permission: { userId, permission: key } },
      select: { id: true },
    });
    return Boolean(row);
  }
}
