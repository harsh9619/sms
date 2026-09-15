import httpService from "Services/http.service";
import type { ClassInfo } from "../types";

export const classService = {
  getClasses: async (): Promise<ClassInfo[]> => {
    return httpService.get<ClassInfo[]>("/api/classes");
  },

  createClass: async (cls: any): Promise<ClassInfo> => {
    return httpService.post<ClassInfo>("/api/classes", cls);
  },

  createClassesBatch: async (classes: { name: string; section: string }[]): Promise<any[]> => {
    return httpService.post<any[]>("/api/classes/batch", { classes });
  },

  updateClass: async (id: string, cls: any): Promise<ClassInfo> => {
    return httpService.put<ClassInfo>(`/api/classes/${id}`, cls);
  },

  deleteClass: async (id: string): Promise<any> => {
    return httpService.delete(`/api/classes/class_div_subject/${id}`);
  },

  getClassMasters: async (): Promise<any[]> => {
    return httpService.get<any[]>("/api/classes/masters");
  },

  getDivMasters: async (): Promise<any[]> => {
    return httpService.get<any[]>("/api/classes/div_masters");
  },

  getSubjects: async (params?: any): Promise<any[]> => {
    return httpService.get<any[]>("/api/subjects", params);
  },

  getClassTeachers: async (): Promise<any[]> => {
    return httpService.get<any[]>("/api/classes/class_teachers");
  },

  updateClassTeacher: async (id: string, teacherId: any): Promise<ClassInfo> => {
    return httpService.put<ClassInfo>(`/api/classes/class_teachers/${id}`, teacherId);
  },

};

export default classService;
