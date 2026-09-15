import httpService from "Services/http.service";
import type { Teacher } from "../types";

export interface GetTeachersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const teacherService = {
  getTeachers: async (params?: GetTeachersParams): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return httpService.get(`/api/teachers${queryString}`);
  },

  createTeacher: async (teacher: any): Promise<Teacher> => {
    return httpService.post<Teacher>("/api/teachers", teacher);
  },

  updateTeacher: async (id: string, teacher: any): Promise<Teacher> => {
    return httpService.put<Teacher>(`/api/teachers/${id}`, teacher);
  },

  deleteTeacher: async (id: string): Promise<any> => {
    return httpService.delete(`/api/teachers/${id}`);
  },

  bulkCreateTeachers: async (teachers: any[]): Promise<any> => {
    return httpService.post("/api/teachers/bulk", { teachers });
  },
};

export default teacherService;
