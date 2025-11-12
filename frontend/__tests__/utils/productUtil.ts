import { InventoryItem } from "@/types/InventoryItem";

export const getProductStatusCounts = (
  products: InventoryItem[],
  status: string
) => {
  return products
    .filter((item) => item.status === status)
    .reduce((sum, item) => sum + item.available_quantity, 0)
    .toString();
};
