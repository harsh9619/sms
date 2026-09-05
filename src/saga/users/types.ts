import type { User } from "../../types";

export interface UsersState {
  users: User[];
  allUsers: User[];
  loading: boolean;
  error: string | null;
}
