import type { User, UserRole } from "../../types";

export interface AuthState {
  user: User | null;
  token: string | null;
  simulatedRole: UserRole | null;
  allUsers: User[];
  loading: boolean;
  error: string | null;
}
