import { z } from "zod";
import { NOTE_TEAMS } from "./application-note-service.js";

const applicationParam = z.object({ applicationId: z.string().uuid("Invalid application id") });

export const listNotesSchema = z.object({ params: applicationParam });

export const createNoteSchema = z.object({
  params: applicationParam,
  body: z.object({
    targetTeam: z.enum(NOTE_TEAMS, { message: "Select who the note is for" }),
    message: z
      .string({ message: "Note is required" })
      .trim()
      .min(2, "Note must be at least 2 characters")
      .max(2000, "Note cannot exceed 2000 characters")
      .refine((v) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v), "HTML tags are not allowed"),
  }),
});
