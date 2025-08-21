export type Container = {
  id: number;
  name: string;
  is_active: boolean;
  last_opened: string;
  temperature: number;
  labels: string[];
  data: number[][];
};
