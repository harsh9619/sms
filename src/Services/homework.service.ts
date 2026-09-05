import httpService from "Services/http.service";
import type { HomeworkRecord } from "../types";

export const homeworkService = {
  getHomework: async (params?: { classId?: string; teacherId?: string }): Promise<HomeworkRecord[]> => {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append("classId", params.classId);
    if (params?.teacherId) queryParams.append("teacherId", params.teacherId);
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return httpService.get<HomeworkRecord[]>(`/api/homework${queryStr}`);
  },

  createHomework: async (hw: any): Promise<HomeworkRecord> => {
    return httpService.post<HomeworkRecord>("/api/homework", hw);
  },

  updateHomework: async (id: string, hw: any): Promise<HomeworkRecord> => {
    return httpService.put<HomeworkRecord>(`/api/homework/${id}`, hw);
  },

  deleteHomework: async (id: string): Promise<any> => {
    return httpService.delete(`/api/homework/${id}`);
  },
};

export default homeworkService;
