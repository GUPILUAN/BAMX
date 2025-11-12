export type Container = {
  id: number;
  name: string;
  active: boolean;
  last_opened: string;
  temperature: number;
  labels: string[];
  data: number[][];
};
