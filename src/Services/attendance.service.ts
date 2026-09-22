import httpService from "./http.service";
import type { AttendanceRecord } from "../types";

export const attendanceService = {
  getAttendance: async (params?: {
    schoolId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    classId?: string;
    divisionId?: string;
    status?: string;
    search?: string;
    academicYear?: string;
  }): Promise<AttendanceRecord[]> => {
    const query = new URLSearchParams();
    if (params?.date) query.append("date", params.date);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.classId && params.classId !== "all") query.append("classId", params.classId);
    if (params?.divisionId && params.divisionId !== "all") query.append("divisionId", params.divisionId);
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    if (params?.academicYear) query.append("academicYear", params.academicYear);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await httpService.get<AttendanceRecord[]>(`/api/attendance${queryString}`);
  },

  saveAttendance: async (
    schoolId: string,
    records: Array<{
      studentId: string;
      classId?: string;
      date: string;
      status: "present" | "absent" | "late" | "excused";
      remarks?: string;
      markedBy?: string;
    }>
  ): Promise<AttendanceRecord[]> => {
    return httpService.post<AttendanceRecord[]>("/api/attendance", { records });
  },

  getMyAttendance: async (
    schoolId: string,
    studentId: string,
    params?: { month?: string; year?: string }
  ): Promise<AttendanceRecord[]> => {
    const query = new URLSearchParams();
    if (params?.month) query.append("month", params.month);
    if (params?.year) query.append("year", params.year);
    const queryString = query.toString() ? `?${query.toString()}` : "";

    return httpService.get<AttendanceRecord[]>(
      `/api/attendance/student/${studentId}${queryString}`
    );
  },

  getSampleTemplate: async (): Promise<any[]> => {
    return await httpService.get<any[]>("/api/attendance/sample-template");
  },

  exportAttendanceSheet: async (params?: {
    date?: string;
    startDate?: string;
    endDate?: string;
    classId?: string;
    divisionId?: string;
    status?: string;
    search?: string;
  }): Promise<any[]> => {
    const query = new URLSearchParams();
    if (params?.date) query.append("date", params.date);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.classId && params.classId !== "all") query.append("classId", params.classId);
    if (params?.divisionId && params.divisionId !== "all") query.append("divisionId", params.divisionId);
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await httpService.get<any[]>(`/api/attendance/export${queryString}`);
  },
};

export default attendanceService;
