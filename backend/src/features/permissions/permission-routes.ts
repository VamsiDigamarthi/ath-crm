import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";
import { listPermissions, setUserPermission, setBulkPermission, getMyPermissions } from "./permission-controller.js";
import { setUserPermissionSchema, setBulkPermissionSchema } from "./permission-validator.js";

const router = Router();

router.get("/me", requireAuth, getMyPermissions);
router.get("/", requireAuth, authorize(Role.ADMIN), listPermissions);
router.put(
  "/:key/users/:userId",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(setUserPermissionSchema),
  setUserPermission
);

router.put(
  "/:key/users",
  requireAuth,
  authorize(Role.ADMIN),
  validateRequest(setBulkPermissionSchema),
  setBulkPermission
);

export { router as permissionRouter };
