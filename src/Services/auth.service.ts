import httpService from "Services/http.service";
import type { User } from "../types";

export interface LoginCredentials {
  email?: string;
  phone?: string;
  identifier?: string;
  loginType?: "email" | "mobile";
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (credentials: LoginCredentials | string, passwordParam?: string, loginTypeParam?: "email" | "mobile"): Promise<LoginResponse> => {
    let payload: LoginCredentials;
    if (typeof credentials === "object") {
      payload = credentials;
    } else {
      if (loginTypeParam === "mobile") {
        payload = { phone: credentials, identifier: credentials, loginType: "mobile", password: passwordParam || "" };
      } else {
        payload = { email: credentials, identifier: credentials, loginType: "email", password: passwordParam || "" };
      }
    }
    return httpService.post<LoginResponse>("/auth/login", payload);
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
