import { Lot } from "@/types/Lot";

export const getProductStatusCounts = (products: Lot[], status: string) => {
  return products
    .filter((item) => item.status === status)
    .reduce((sum, item) => sum + item.available_quantity, 0)
    .toString();
};
