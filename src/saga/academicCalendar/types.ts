import type { CalendarEvent, WorkingConfig } from "../../Services/academicCalendar.service";

export interface AcademicCalendarState {
  events: CalendarEvent[];
  sessionConfig: WorkingConfig | null;
  summary: {
    totalEvents: number;
    totalHolidays: number;
    totalWorkingDays: number;
  };
  loading: boolean;
  error: string | null;
}
