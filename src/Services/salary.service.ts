import httpService from "Services/http.service";
import type { SalaryRecord } from "../types";

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
};

export default salaryService;
