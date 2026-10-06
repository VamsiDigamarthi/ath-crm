import { Request, Response } from "express";
import { OrgRoleService } from "./org-role-service.js";
import { TokenManager } from "../../utils/token-manager.js";

export class OrgRoleController {
  public static async listRoles(req: Request, res: Response) {
    const roles = await OrgRoleService.listOrgRoles();
    res.json({ success: true, data: roles });
  }

  public static async getRole(req: Request, res: Response) {
    const id = String(req.params.id);
    const role = await OrgRoleService.getOrgRoleById(id);
    res.json({ success: true, data: role });
  }

  public static async createRole(req: Request, res: Response) {
    const { name, description, systemRole, department, sidebarPermissions, defaultRoute } = req.body;
    const created = await OrgRoleService.createOrgRole({
      name,
      description,
      systemRole,
      department,
      sidebarPermissions,
      defaultRoute,
    });
    res.status(201).json({ success: true, data: created, message: "Role created successfully" });
  }

  public static async updateRole(req: Request, res: Response) {
    const id = String(req.params.id);
    const { name, description, systemRole, department, sidebarPermissions, defaultRoute } = req.body;
    const updated = await OrgRoleService.updateOrgRole(id, {
      name,
      description,
      systemRole,
      department,
      sidebarPermissions,
      defaultRoute,
    });
    res.json({ success: true, data: updated, message: "Role updated successfully" });
  }

  public static async deleteRole(req: Request, res: Response) {
    const id = String(req.params.id);
    const result = await OrgRoleService.deleteOrgRole(id);
    res.json(result);
  }

  public static async switchActiveRole(req: Request, res: Response) {
    const userId = req.currentUser?.id;
    const { orgRoleId } = req.body;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const result = await OrgRoleService.switchUserActiveRole(userId, orgRoleId);

    // Issue updated JWT token with the new role and set cookie
    const token = TokenManager.generateToken({
      id: result.user.id,
      email: result.user.email,
      mobile: result.user.mobile,
      role: result.user.role,
    });

    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        activeOrgRole: result.activeOrgRole,
        sidebarPermissions: result.activeOrgRole.sidebarPermissions || [],
        user: {
          id: result.user.id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          mobile: result.user.mobile,
          role: result.user.role,
          activeOrgRoleId: result.user.activeOrgRoleId,
        },
        token,
      },
      message: `Active role switched to ${result.activeOrgRole.name}`,
    });
  }
}
