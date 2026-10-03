import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { authorize } from "../../middlewares/authorize.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { Role } from "../../types/index.js";
import {
  listProducts,
  listActiveProducts,
  createProduct,
  updateProduct,
  updateProductStatus,
} from "./product-controller.js";
import {
  listProductsSchema,
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
} from "./product-validator.js";

const router = Router();

router.get("/active", requireAuth, listActiveProducts);
router.get("/", requireAuth, authorize(Role.ADMIN), validateRequest(listProductsSchema), listProducts);
router.post("/", requireAuth, authorize(Role.ADMIN), validateRequest(createProductSchema), createProduct);
router.put("/:id", requireAuth, authorize(Role.ADMIN), validateRequest(updateProductSchema), updateProduct);
router.patch("/:id/status", requireAuth, authorize(Role.ADMIN), validateRequest(updateProductStatusSchema), updateProductStatus);

export { router as productRouter };
