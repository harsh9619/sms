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

  exportStudents: async (params?: GetStudentsParams): Promise<Student[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.classId && params.classId !== "all") query.append("classId", params.classId);
    if (params?.sectionId && params.sectionId !== "all") query.append("sectionId", params.sectionId);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return httpService.get(`/api/students/export${queryString}`);
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

  getCastes: async (): Promise<any[]> => {
    return httpService.get("/api/castes");
  },

  extractOcrData: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "prompt",
      "Extract all student register table rows from this image into a JSON array of student objects. Map fields: serial_no, admission_no, admission_date, student_name, father_guardian_name, mother_name, date_of_birth, class, gender, mobile_number, address, category."
    );
    const token = localStorage.getItem("sms_token");
    const response = await fetch("/api/ocr/extract", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to extract OCR data from server.");
    }
    return response.json();
  },
};

export default studentService;

