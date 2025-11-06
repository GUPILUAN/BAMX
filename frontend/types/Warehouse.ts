export type Warehouse = {
  id: number;
  temperature: number;
  name: string;
  is_active: boolean;
  last_opened: string;
  labels: string[];
  data: number[][];
};
