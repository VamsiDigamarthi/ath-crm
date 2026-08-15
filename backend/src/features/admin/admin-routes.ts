import { Router } from "express";
import { registerAdmin } from "./admin-controller.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { registerAdminSchema } from "./admin-validator.js";

const router = Router();

router.post("/register", validateRequest(registerAdminSchema), registerAdmin);

export { router as adminRouter };
