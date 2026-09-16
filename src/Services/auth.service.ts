import httpService from "Services/http.service";
import type { User } from "../types";

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return httpService.post<LoginResponse>("/auth/login", { email, password });
  },

  getCurrentUser: async (): Promise<User> => {
    const data = await httpService.get<{ user: User }>("/auth/me");
    return data.user;
  },

  getAllUsers: async (schoolId?: string): Promise<User[]> => {
    const url = schoolId ? `/api/users?all=true&schoolId=${schoolId}` : "/api/users?all=true";
    return httpService.get<User[]>(url);
  },

  getUsers: async (schoolId?: string): Promise<User[]> => {
    const url = schoolId ? `/api/users?schoolId=${schoolId}` : "/api/users";
    return httpService.get<User[]>(url);
  },
};

export default authService;
