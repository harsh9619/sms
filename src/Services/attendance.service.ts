import httpService from "Services/http.service";
import type { AttendanceRecord } from "../types";

export const attendanceService = {
  getAttendance: async (): Promise<AttendanceRecord[]> => {
    return httpService.get<AttendanceRecord[]>("/api/attendance");
  },
};

export default attendanceService;
