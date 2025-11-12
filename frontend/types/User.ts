export type User = {
  id: number;
  username: string;
  name: string;
  email: string | undefined | null;
  position: string | undefined | null;
  department: string | undefined | null;
  status: number | undefined | null;
  role: string | undefined | null;
  company: string | undefined | null;
  profile_picture: string | undefined | null;
};
