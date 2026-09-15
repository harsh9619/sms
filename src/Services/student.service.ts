import httpService from "Services/http.service";
import type { Student } from "../types";

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  sectionId?: string;
  academicYear?: string;
}

export const studentService = {
  getStudents: async (params?: GetStudentsParams): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));
    if (params?.search) query.append("search", params.search);
    if (params?.classId && params.classId !== "all") query.append("classId", params.classId);
    if (params?.sectionId && params.sectionId !== "all") query.append("sectionId", params.sectionId);
    if (params?.academicYear) query.append("academicYear", params.academicYear);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return httpService.get(`/api/students${queryString}`);
  },

  createStudent: async (student: any): Promise<Student> => {
    return httpService.post<Student>("/api/students", student);
  },

  updateStudent: async (id: string, student: any): Promise<Student> => {
    return httpService.put<Student>(`/api/students/${id}`, student);
  },

  deleteStudent: async (id: string): Promise<any> => {
    return httpService.delete(`/api/students/${id}`);
  },

  bulkCreateStudents: async (students: any[]): Promise<any> => {
    return httpService.post("/api/students/bulk", { students });
  },
};

export default studentService;

