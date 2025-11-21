export type Warehouse = {
  id: number;
  name: string;
  active: boolean;
  last_update: string;
  temperature: number;
  labels: string[];
  data: number[][];
  refrigerated: boolean;
};
