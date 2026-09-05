import httpService from "Services/http.service";
import type { TimetableSlot } from "../types";

export const timetableService = {
  getTimetables: async (params?: { classId?: string; teacherId?: string }): Promise<TimetableSlot[]> => {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append("classId", params.classId);
    if (params?.teacherId) queryParams.append("teacherId", params.teacherId);
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
};

export default timetableService;
