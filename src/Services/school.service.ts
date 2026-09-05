import httpService from "Services/http.service";
import type { School } from "../context/SchoolContext";

export interface MasterTheme {
  id: number;
  name: string;
  label: string;
  color: string;
  sortOrder: number;
}

export const schoolService = {
  getSchools: async (): Promise<School[]> => {
    return httpService.get<School[]>("/api/schools");
  },
  createSchool: async (data: Partial<School> & { name: string; slug: string }): Promise<School> => {
    return httpService.post<School>("/api/schools", data);
  },
  updateSchool: async (id: string, data: Partial<School>): Promise<School> => {
    return httpService.put<School>(`/api/schools/${id}`, data);
  },
  getMasterThemes: async (): Promise<MasterTheme[]> => {
    return httpService.get<MasterTheme[]>("/api/master-themes");
  },
};

export default schoolService;
