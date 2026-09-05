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

  getAllUsers: async (): Promise<User[]> => {
    return httpService.get<User[]>("/api/users?all=true");
  },
};

export default authService;
