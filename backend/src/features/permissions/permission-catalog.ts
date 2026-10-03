import { Role } from "@prisma/client";

export interface PermissionDefinition {
  key: string;
  label: string;
  description: string;
  module: string;
  roles: Role[];
}

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  {
    key: "PREP_EDIT_ITEM_PRICE",
    label: "Edit item prices on returns",
    description: "Allows changing the price of a product or service on a tax return. The admin catalog price is never changed.",
    module: "Tax Preparation",
    roles: [Role.TAX_PREPARER],
  },
];

export const findPermission = (key: string) => PERMISSION_CATALOG.find((p) => p.key === key);
