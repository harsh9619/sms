import httpService from "Services/http.service";
import type { TimetableSlot } from "../types";

export const timetableService = {
  getTimetables: async (params?: {
    classId?: string;
    teacherId?: string;
    divisionId?: string;
    division?: string;
    dayOfWeek?: string;
  }): Promise<TimetableSlot[]> => {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append("classId", params.classId);
    if (params?.teacherId) queryParams.append("teacherId", params.teacherId);
    if (params?.divisionId) queryParams.append("divisionId", params.divisionId);
    if (params?.division) queryParams.append("division", params.division);
    if (params?.dayOfWeek) queryParams.append("dayOfWeek", params.dayOfWeek);
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return httpService.get<TimetableSlot[]>(`/api/timetables${queryStr}`);
  },

  createTimetable: async (t: any): Promise<TimetableSlot> => {
    return httpService.post<TimetableSlot>("/api/timetables", t);
  },

  updateTimetable: async (id: string, t: any): Promise<TimetableSlot> => {
    return httpService.put<TimetableSlot>(`/api/timetables/${id}`, t);
  },

  deleteTimetable: async (id: string): Promise<any> => {
    return httpService.delete(`/api/timetables/${id}`);
  },

  generateTimetable: async (config: {
    classId?: string;
    daysOfWeek?: string[];
    startTime?: string;
    endTime?: string;
    periodDuration?: number;
    breakStartTime?: string;
    breakEndTime?: string;
    clearExisting?: boolean;
  }): Promise<{
    message: string;
    generatedSlotsCount: number;
    classesCount: number;
    periodsPerDay: number;
    daysCount: number;
    warnings: string[];
    timetables: TimetableSlot[];
  }> => {
    return httpService.post("/api/timetables/generate", config);
  },
};

export default timetableService;
