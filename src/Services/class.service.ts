import httpService from "Services/http.service";
import type { ClassInfo } from "../types";

export const classService = {
  getClasses: async (): Promise<ClassInfo[]> => {
    return httpService.get<ClassInfo[]>("/api/classes");
  },

  createClass: async (cls: any): Promise<ClassInfo> => {
    return httpService.post<ClassInfo>("/api/classes", cls);
  },

  updateClass: async (id: string, cls: any): Promise<ClassInfo> => {
    return httpService.put<ClassInfo>(`/api/classes/${id}`, cls);
  },

  deleteClass: async (id: string): Promise<any> => {
    return httpService.delete(`/api/classes/${id}`);
  },

  getSubjects: async (params?: any): Promise<any[]> => {
    return httpService.get<any[]>("/api/subjects", params);
  },
};

export default classService;
