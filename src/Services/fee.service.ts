import httpService from "Services/http.service";
import type { FeeRecord } from "../types";

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
};

export default feeService;
