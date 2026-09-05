import httpService from "Services/http.service";
import type { Teacher } from "../types";

export const teacherService = {
  getTeachers: async (): Promise<Teacher[]> => {
    return httpService.get<Teacher[]>("/api/teachers");
  },
};

export default teacherService;
