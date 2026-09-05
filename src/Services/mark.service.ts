import httpService from "Services/http.service";
import type { MarkRecord } from "../types";

export const markService = {
  getMarks: async (params?: { studentId?: string; classId?: string; subjectId?: string }): Promise<MarkRecord[]> => {
    const queryParams = new URLSearchParams();
    if (params?.studentId) queryParams.append("studentId", params.studentId);
    if (params?.classId) queryParams.append("classId", params.classId);
    if (params?.subjectId) queryParams.append("subjectId", params.subjectId);
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return httpService.get<MarkRecord[]>(`/api/marks${queryStr}`);
  },

  createMarks: async (m: any): Promise<MarkRecord> => {
    return httpService.post<MarkRecord>("/api/marks", m);
  },

  updateMarks: async (id: string, m: any): Promise<MarkRecord> => {
    return httpService.put<MarkRecord>(`/api/marks/${id}`, m);
  },

  deleteMarks: async (id: string): Promise<any> => {
    return httpService.delete(`/api/marks/${id}`);
  },
};

export default markService;
