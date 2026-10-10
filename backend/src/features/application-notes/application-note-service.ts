import { Role } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { NotFoundError } from "../../errors/not-found-error.js";

export const NOTE_TEAMS = ["ALL", "DOCUMENTER", "PREPARER", "QA_REVIEWER", "SALES", "FILING"] as const;
export type NoteTeam = (typeof NOTE_TEAMS)[number];

export const NOTE_CONTEXTS = [
  "GENERAL",
  "MOVED_TO_PREP",
  "SUBMITTED_TO_QA",
  "QA_REVISION",
  "QA_SIGN_OFF",
  "SALES_SEND_BACK",
  "SENT_TO_FILING",
] as const;
export type NoteContext = (typeof NOTE_CONTEXTS)[number];

const roleToTeam = (role?: string): string => {
  switch (role) {
    case Role.DOC_AGENT:
    case Role.DOC_MANAGER:
      return "DOCUMENTER";
    case Role.TAX_PREPARER:
      return "PREPARER";
    case Role.TAX_REVIEWER:
      return "QA_REVIEWER";
    case Role.PREP_MANAGER:
      return "PREP_MANAGER";
    case Role.SALES_AGENT:
    case Role.SALES_MANAGER:
      return "SALES";
    case Role.FILE_OP_AGENT:
    case Role.FILE_OP_MANAGER:
      return "FILING";
    case Role.ADMIN:
      return "ADMIN";
    default:
      return role || "STAFF";
  }
};

export class ApplicationNoteService {
  static async list(applicationId: string) {
    const app = await prisma.taxApplication.findUnique({ where: { id: applicationId }, select: { id: true } });
    if (!app) throw new NotFoundError("Tax application not found");

    const notes = await prisma.applicationNote.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, firstName: true, lastName: true, email: true } } },
    });

    return notes.map((n) => ({
      id: n.id,
      message: n.message,
      targetTeam: n.targetTeam,
      context: n.context,
      authorRole: n.authorRole,
      authorName: n.author
        ? `${n.author.firstName || ""} ${n.author.lastName || ""}`.trim() || n.author.email || "Staff"
        : "Staff",
      authorId: n.authorId,
      createdAt: n.createdAt,
    }));
  }

  static async create(params: {
    applicationId: string;
    authorId: string;
    authorRole?: string;
    targetTeam: NoteTeam;
    message: string;
    context?: NoteContext;
  }) {
    const app = await prisma.taxApplication.findUnique({ where: { id: params.applicationId }, select: { id: true } });
    if (!app) throw new NotFoundError("Tax application not found");

    return prisma.applicationNote.create({
      data: {
        applicationId: params.applicationId,
        authorId: params.authorId,
        authorRole: roleToTeam(params.authorRole),
        targetTeam: params.targetTeam,
        context: params.context || "GENERAL",
        message: params.message.trim(),
      },
    });
  }

  /**
   * Records a hand-off note from inside another workflow action. Never blocks the workflow if it fails.
   */
  static async recordHandoff(params: {
    applicationId: string;
    authorId: string;
    targetTeam: NoteTeam;
    message?: string | null;
    context: NoteContext;
  }) {
    const message = params.message?.trim();
    if (!message) return;
    try {
      const author = await prisma.user.findUnique({ where: { id: params.authorId }, select: { role: true } });
      await this.create({ ...params, message, authorRole: author?.role });
    } catch (err) {
      console.error("Failed to record hand-off note:", err);
    }
  }
}
