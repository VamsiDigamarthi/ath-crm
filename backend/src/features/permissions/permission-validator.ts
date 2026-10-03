import { z } from "zod";

export const setUserPermissionSchema = z.object({
  params: z.object({
    key: z.string().trim().min(1).max(100),
    userId: z.string().uuid("Invalid user id"),
  }),
  body: z.object({
    enabled: z.boolean({ message: "enabled must be true or false" }),
  }),
});

export const setBulkPermissionSchema = z.object({
  params: z.object({
    key: z.string().trim().min(1).max(100),
  }),
  body: z.object({
    userIds: z.array(z.string().uuid("Invalid user id")).min(1, "Select at least one user").max(500),
    enabled: z.boolean({ message: "enabled must be true or false" }),
  }),
});
