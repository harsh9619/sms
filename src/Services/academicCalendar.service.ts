import httpService from "Services/http.service";

export interface CalendarEvent {
  id: string;
  schoolId: string;
  schoolAcademicYearId?: string | null;
  title: string;
  type: string; // HOLIDAY, EVENT, EXAM, MEETING, SPORTS, OTHER
  category: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  targetRoles: string[];
  isHoliday: boolean;
  affectsAttendance: boolean;
  color?: string;
  createdBy?: string | null;
  createdAt?: string;
}

export interface WorkingConfig {
  id: string;
  schoolId: string;
  schoolAcademicYearId?: string | null;
  sessionStartDate: string;
  sessionEndDate: string;
  workingDays: string[];
  periodsPerDay: number;
  schoolStartTime: string;
  schoolEndTime: string;
  totalWorkingDays?: number;
}

export interface CalendarOverviewResponse {
  sessionConfig: WorkingConfig;
  events: CalendarEvent[];
  summary: {
    totalEvents: number;
    totalHolidays: number;
    totalWorkingDays: number;
  };
}

export const academicCalendarService = {
  getOverview: async (
    schoolId: string = "1",
    params?: { month?: string; type?: string; role?: string }
  ): Promise<CalendarOverviewResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append("month", params.month);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.role) queryParams.append("role", params.role);
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return httpService.get<CalendarOverviewResponse>(`/api/${schoolId}/academic-calendar${queryStr}`);
  },

  getEvents: async (
    schoolId: string = "1",
    params?: { month?: string; type?: string; role?: string }
  ): Promise<CalendarEvent[]> => {
    const queryParams = new URLSearchParams();
    if (params?.month) queryParams.append("month", params.month);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.role) queryParams.append("role", params.role);
    const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return httpService.get<CalendarEvent[]>(`/api/${schoolId}/academic-calendar/events${queryStr}`);
  },

  getConfig: async (schoolId: string = "1"): Promise<WorkingConfig> => {
    return httpService.get<WorkingConfig>(`/api/${schoolId}/academic-calendar/config`);
  },

  createEvent: async (schoolId: string = "1", payload: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    return httpService.post<CalendarEvent>(`/api/${schoolId}/academic-calendar/events`, payload);
  },

  updateEvent: async (schoolId: string = "1", id: string, payload: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    return httpService.put<CalendarEvent>(`/api/${schoolId}/academic-calendar/events/${id}`, payload);
  },

  deleteEvent: async (schoolId: string = "1", id: string): Promise<{ success: boolean; message: string }> => {
    return httpService.delete(`/api/${schoolId}/academic-calendar/events/${id}`);
  },

  updateWorkingConfig: async (schoolId: string = "1", payload: Partial<WorkingConfig>): Promise<WorkingConfig> => {
    return httpService.post<WorkingConfig>(`/api/${schoolId}/academic-calendar/config`, payload);
  },
};

export default academicCalendarService;
