import httpService from "Services/http.service";
import type { FeeRecord } from "../types";

export interface ClassFeeStructureItem {
  id: string;
  schoolId: string;
  classMasterId: string;
  className: string;
  feeType: string;
  feeName: string;
  amount: number;
  frequency: string;
  dueDay: number;
  isMandatory: boolean;
  description?: string;
}

export const feeService = {
  getFees: async (): Promise<FeeRecord[]> => {
    return httpService.get<FeeRecord[]>("/api/fees");
  },

  createFee: async (fee: any): Promise<FeeRecord> => {
    return httpService.post<FeeRecord>("/api/fees", fee);
  },

  updateFee: async (id: string, fee: any): Promise<FeeRecord> => {
    return httpService.put<FeeRecord>(`/api/fees/${id}`, fee);
  },

  deleteFee: async (id: string): Promise<any> => {
    return httpService.delete(`/api/fees/${id}`);
  },

  // Class-wise Fee Structure APIs
  getClassFeeStructures: async (schoolId = "1", classMasterId?: string): Promise<ClassFeeStructureItem[]> => {
    const query = classMasterId ? `?classMasterId=${classMasterId}` : "";
    return httpService.get<ClassFeeStructureItem[]>(`/api/${schoolId}/fees/structures/all${query}`);
  },

  saveClassFeeStructure: async (schoolId = "1", data: any): Promise<any> => {
    return httpService.post(`/api/${schoolId}/fees/structures`, data);
  },

  deleteClassFeeStructure: async (schoolId = "1", id: string): Promise<any> => {
    return httpService.delete(`/api/${schoolId}/fees/structures/${id}`);
  },

  generateClassInvoices: async (schoolId = "1", classMasterId: string, dueDate?: string): Promise<any> => {
    return httpService.post(`/api/${schoolId}/fees/generate-invoices`, { classMasterId, dueDate });
  },
};

export default feeService;
