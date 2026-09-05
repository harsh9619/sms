import httpService from "Services/http.service";
import type { Student } from "../types";

export const studentService = {
  getStudents: async (): Promise<Student[]> => {
    return httpService.get<Student[]>("/api/students");
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
};

export default studentService;
