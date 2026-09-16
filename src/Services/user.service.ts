import httpService from "Services/http.service";
import type { User } from "../types";

export const userService = {
  getUsers: async (schoolId?: string): Promise<User[]> => {
    const url = schoolId ? `/api/users?schoolId=${schoolId}` : "/api/users";
    return httpService.get<User[]>(url);
  },

  getAllUsers: async (schoolId?: string): Promise<User[]> => {
    const url = schoolId ? `/api/users?all=true&schoolId=${schoolId}` : "/api/users?all=true";
    return httpService.get<User[]>(url);
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
