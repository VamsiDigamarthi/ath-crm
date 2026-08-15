import { Request, Response } from "express";
import { prisma } from "../../config/db.js";
import { BadRequestError } from "../../errors/bad-request-error.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { Role } from "@prisma/client";
import { LeadIngestionService } from "./lead-ingestion-service.js";
import { EmployeeService } from "./employee-service.js";

export const registerAdmin = async (req: Request, res: Response) => {
  const { email, mobile } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      isActive: true,
      OR: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    },
  });

  if (existingUser) {
    throw new BadRequestError("Active User or Admin already exists with this email or mobile");
  }

  const admin = await prisma.user.create({
    data: {
      email,
      mobile,
      role: Role.ADMIN,
    },
  });

  return SuccessHandler.handle(res, "Admin registered successfully", {
    id: admin.id,
    email: admin.email,
    mobile: admin.mobile,
    role: admin.role,
    createdAt: admin.createdAt,
  }, 201);
};

export const bulkImportLeads = async (req: Request, res: Response) => {
  const { taxYear, leads } = req.body;
  const adminUserId = req.currentUser?.id;

  const result = await LeadIngestionService.processBulkImport({
    taxYear,
    leads,
    adminUserId,
  });

  return SuccessHandler.handle(
    res,
    `Successfully processed ${result.validProcessed} leads: ${result.newProfilesCreated} new profiles created, ${result.existingProfilesLinked} linked to existing customer profiles, and ${result.duplicatesSkipped} duplicates skipped.`,
    result,
    200
  );
};

export const getEmployees = async (req: Request, res: Response) => {
  const { search, department, role, isActive } = req.query;

  const result = await EmployeeService.listEmployees({
    search: typeof search === 'string' ? search : undefined,
    department: typeof department === 'string' ? (department as any) : undefined,
    role: typeof role === 'string' ? role : undefined,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
  });

  return SuccessHandler.handle(res, "Employees fetched successfully", result, 200);
};

export const createEmployee = async (req: Request, res: Response) => {
  const employee = await EmployeeService.createEmployee(req.body);
  return SuccessHandler.handle(
    res,
    `Staff member ${employee.fullName} created successfully`,
    employee,
    201
  );
};

export const updateEmployee = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const employee = await EmployeeService.updateEmployee(id, req.body);
  return SuccessHandler.handle(res, "Staff member updated successfully", employee, 200);
};

export const toggleEmployeeStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await EmployeeService.toggleStatus(id);
  return SuccessHandler.handle(
    res,
    `Staff status updated to ${result.isActive ? 'Active' : 'Inactive'}`,
    result,
    200
  );
};

export const bulkOnboardEmployees = async (req: Request, res: Response) => {
  const { employees } = req.body;
  const result = await EmployeeService.bulkOnboard(employees);
  return SuccessHandler.handle(
    res,
    `Successfully onboarded ${result.createdCount} staff members (${result.duplicatesSkipped} duplicates skipped)`,
    result,
    200
  );
};
