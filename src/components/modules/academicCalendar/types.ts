import React from "react";
import type { CalendarEvent, WorkingConfig } from "../../../Services/academicCalendar.service";

export type CalendarViewMode = "calendar" | "list" | "workingDays";

export interface EventFormData {
  title: string;
  type: string;
  category: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  location?: string;
  targetRoles?: string[];
  isHoliday?: boolean;
  affectsAttendance?: boolean;
  color?: string;
}

export interface ConfigFormData {
  sessionStartDate: string;
  sessionEndDate: string;
  workingDays: string[];
  periodsPerDay: number;
  schoolStartTime: string;
  schoolEndTime: string;
}

export interface CalendarSummary {
  totalEvents: number;
  totalHolidays: number;
  totalWorkingDays: number;
}

export interface AcademicCalendarUIProps {
  user: any;
  canManage: boolean;
  loading: boolean;
  sessionConfig: WorkingConfig | null;
  events: CalendarEvent[];
  summary: CalendarSummary;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode: CalendarViewMode;
  setViewMode: (val: CalendarViewMode) => void;
  showEventModal: boolean;
  setShowEventModal: (val: boolean) => void;
  editingEvent: CalendarEvent | null;
  eventFormData: any;
  setEventFormData: React.Dispatch<React.SetStateAction<any>>;
  openAddEventModal: (dateStr?: string) => void;
  openEditEventModal: (ev: CalendarEvent) => void;
  handleSaveEvent: () => void;
  handleDeleteEvent: (id: string) => void;
  showConfigModal: boolean;
  setShowConfigModal: (val: boolean) => void;
  configFormData: any;
  setConfigFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSaveConfig: () => void;
  isSubmitting: boolean;
}
