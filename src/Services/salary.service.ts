import httpService from "Services/http.service";
import type { SalaryRecord } from "../types";

export interface StaffSalaryStructureItem {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  email: string;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
  effectiveFrom: string;
  isActive: boolean;
}

export interface SalaryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  teacherId?: string;
  schoolId?: string;
  academicYear?: string;
}

export interface PaginatedSalaryResponse {
  data: SalaryRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const salaryService = {
  getSalaries: async (params?: SalaryQueryParams): Promise<SalaryRecord[] | PaginatedSalaryResponse> => {
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined) queryParts.push(`page=${params.page}`);
      if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.status && params.status !== "all") queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params.teacherId) queryParts.push(`teacherId=${encodeURIComponent(params.teacherId)}`);
      if (params.academicYear) queryParts.push(`academicYear=${encodeURIComponent(params.academicYear)}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const schoolId = params?.schoolId || "1";
    return httpService.get<any>(`/api/${schoolId}/salaries${queryString}`);
  },

  createSalary: async (sal: any): Promise<SalaryRecord> => {
    return httpService.post<SalaryRecord>("/api/salaries", sal);
  },

  updateSalary: async (id: string, sal: any): Promise<SalaryRecord> => {
    return httpService.put<SalaryRecord>(`/api/salaries/${id}`, sal);
  },

  deleteSalary: async (id: string): Promise<any> => {
    return httpService.delete(`/api/salaries/${id}`);
  },

  // Staff Salary Structure APIs
  getSalaryStructures: async (schoolId = "1", teacherId?: string): Promise<StaffSalaryStructureItem[]> => {
    const query = teacherId ? `?teacherId=${teacherId}` : "";
    return httpService.get<StaffSalaryStructureItem[]>(`/api/${schoolId}/salaries/structures/all${query}`);
  },

  saveSalaryStructure: async (schoolId = "1", data: any): Promise<any> => {
    return httpService.post(`/api/${schoolId}/salaries/structures`, data);
  },

  deleteSalaryStructure: async (schoolId = "1", id: string): Promise<any> => {
    return httpService.delete(`/api/${schoolId}/salaries/structures/${id}`);
  },

  generateMonthlyPayroll: async (schoolId = "1", month: number, year: number): Promise<any> => {
    return httpService.post(`/api/${schoolId}/salaries/generate-payroll`, { month, year });
  },
};

export default salaryService;
