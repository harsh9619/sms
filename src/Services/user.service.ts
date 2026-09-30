import httpService from "Services/http.service";
import type { User } from "../types";

export interface GetUsersParams {
  schoolId?: string;
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const userService = {
  getUsers: async (params?: string | GetUsersParams): Promise<User[]> => {
    let url = "/api/users";
    if (typeof params === "string") {
      url = params ? `/api/users?schoolId=${params}` : "/api/users";
    } else if (params && typeof params === "object") {
      const query = new URLSearchParams();
      if (params.schoolId) query.append("schoolId", params.schoolId);
      if (params.role && params.role !== "all") query.append("role", params.role);
      if (params.search) query.append("search", params.search);
      if (params.page) query.append("page", String(params.page));
      if (params.limit) query.append("limit", String(params.limit));
      const queryString = query.toString();
      if (queryString) url += `?${queryString}`;
    }
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
