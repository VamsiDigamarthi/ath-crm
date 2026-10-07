import { Router, Request, Response } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";
import { SuccessHandler } from "../../utils/success-handler.js";
import { ApplicationNoteService } from "./application-note-service.js";
import { listNotesSchema, createNoteSchema } from "./application-note-validator.js";

const router = Router();

const NOTE_ROLES = [
  Role.ADMIN,
  Role.DOC_MANAGER,
  Role.DOC_AGENT,
  Role.PREP_MANAGER,
  Role.TAX_PREPARER,
  Role.TAX_REVIEWER,
  Role.SALES_MANAGER,
  Role.SALES_TEAM_LEAD,
  Role.SALES_AGENT,
];

router.get(
  "/:applicationId/notes",
  requireAuth,
  authorize(...NOTE_ROLES),
  validateRequest(listNotesSchema),
  async (req: Request, res: Response) => {
    const notes = await ApplicationNoteService.list(String(req.params.applicationId));
    return SuccessHandler.handle(res, "Notes retrieved successfully", notes);
  }
);

router.post(
  "/:applicationId/notes",
  requireAuth,
  authorize(...NOTE_ROLES),
  validateRequest(createNoteSchema),
  async (req: Request, res: Response) => {
    await ApplicationNoteService.create({
      applicationId: String(req.params.applicationId),
      authorId: req.currentUser!.id,
      authorRole: req.currentUser!.role,
      targetTeam: req.body.targetTeam,
      message: req.body.message,
    });
    const notes = await ApplicationNoteService.list(String(req.params.applicationId));
    return SuccessHandler.handle(res, "Note added", notes, 201);
  }
);

export { router as applicationNoteRouter };
