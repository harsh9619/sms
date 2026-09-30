import type { User, RoleMaster, School } from "../../../types";

export interface UsersUIProps {
  schools: School[];
  users: User[];
  loading: boolean;
  fetchUsersRequest: (payload?: any) => void;
  createUserRequest: (user: any) => void;
  updateUserRequest: (payload: { id: string; user: any }) => void;
  deleteUserRequest: (id: string) => void;
}
