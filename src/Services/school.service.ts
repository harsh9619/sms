import httpService from "Services/http.service";
import type { School } from "../context/SchoolContext";

export const schoolService = {
  getSchools: async (): Promise<School[]> => {
    return httpService.get<School[]>("/api/schools");
  },
};

export default schoolService;
