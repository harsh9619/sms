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

export const salaryService = {
  getSalaries: async (): Promise<SalaryRecord[]> => {
    return httpService.get<SalaryRecord[]>("/api/salaries");
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
