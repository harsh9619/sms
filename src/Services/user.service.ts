import httpService from "Services/http.service";
import type { User } from "../types";

export const userService = {
  getUsers: async (): Promise<User[]> => {
    return httpService.get<User[]>("/api/users");
  },

  getAllUsers: async (): Promise<User[]> => {
    return httpService.get<User[]>("/api/users?all=true");
  },

  createUser: async (user: any): Promise<User> => {
    return httpService.post<User>("/api/users", user);
  },

  updateUser: async (id: string, user: any): Promise<User> => {
    return httpService.put<User>(`/api/users/${id}`, user);
  },

  deleteUser: async (id: string): Promise<any> => {
    return httpService.delete(`/api/users/${id}`);
  },
};

export default userService;
