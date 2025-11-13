export type InventoryItem = {
  id: string;
  name: string;
  type: string;
  available_quantity: number;
  unit: string;
  warehouseNamesCritical: string[];
  warehouseNamesWarning: string[];
  warehouseNamesGood: string[];
};
