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

export interface FeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  feeType?: string;
  studentId?: string;
  schoolId?: string;
}

export interface PaginatedFeeResponse {
  data: FeeRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const feeService = {
  getFees: async (params?: FeeQueryParams): Promise<FeeRecord[] | PaginatedFeeResponse> => {
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined) queryParts.push(`page=${params.page}`);
      if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.status && params.status !== "all") queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params.feeType && params.feeType !== "all") queryParts.push(`feeType=${encodeURIComponent(params.feeType)}`);
      if (params.studentId) queryParts.push(`studentId=${encodeURIComponent(params.studentId)}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const schoolId = params?.schoolId || "1";
    return httpService.get<any>(`/api/${schoolId}/fees${queryString}`);
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
