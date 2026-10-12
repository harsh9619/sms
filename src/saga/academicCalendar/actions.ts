import type { CalendarEvent, WorkingConfig, CalendarOverviewResponse } from "../../Services/academicCalendar.service";
import * as types from "./actionTypes";

// Combined overview actions
export const fetchAcademicCalendarRequest = (payload?: { schoolId?: string; month?: string; type?: string; role?: string }) => ({
  type: types.FETCH_ACADEMIC_CALENDAR_REQUEST,
  payload,
});

export const fetchAcademicCalendarSuccess = (payload: CalendarOverviewResponse) => ({
  type: types.FETCH_ACADEMIC_CALENDAR_SUCCESS,
  payload,
});

export const fetchAcademicCalendarFailure = (payload: string) => ({
  type: types.FETCH_ACADEMIC_CALENDAR_FAILURE,
  payload,
});

// Dedicated Events API actions
export const fetchCalendarEventsRequest = (payload?: { schoolId?: string; month?: string; type?: string; role?: string }) => ({
  type: types.FETCH_CALENDAR_EVENTS_REQUEST,
  payload,
});

export const fetchCalendarEventsSuccess = (payload: CalendarEvent[]) => ({
  type: types.FETCH_CALENDAR_EVENTS_SUCCESS,
  payload,
});

export const fetchCalendarEventsFailure = (payload: string) => ({
  type: types.FETCH_CALENDAR_EVENTS_FAILURE,
  payload,
});

// Dedicated School Config API actions
export const fetchWorkingConfigRequest = (payload?: { schoolId?: string }) => ({
  type: types.FETCH_WORKING_CONFIG_REQUEST,
  payload,
});

export const fetchWorkingConfigSuccess = (payload: WorkingConfig) => ({
  type: types.FETCH_WORKING_CONFIG_SUCCESS,
  payload,
});

export const fetchWorkingConfigFailure = (payload: string) => ({
  type: types.FETCH_WORKING_CONFIG_FAILURE,
  payload,
});

// Event CRUD
export const createCalendarEventRequest = (payload: { schoolId: string; data: Partial<CalendarEvent> }) => ({
  type: types.CREATE_CALENDAR_EVENT_REQUEST,
  payload,
});

export const createCalendarEventSuccess = (payload: CalendarEvent) => ({
  type: types.CREATE_CALENDAR_EVENT_SUCCESS,
  payload,
});

export const createCalendarEventFailure = (payload: string) => ({
  type: types.CREATE_CALENDAR_EVENT_FAILURE,
  payload,
});

export const updateCalendarEventRequest = (payload: { schoolId: string; id: string; data: Partial<CalendarEvent> }) => ({
  type: types.UPDATE_CALENDAR_EVENT_REQUEST,
  payload,
});

export const updateCalendarEventSuccess = (payload: CalendarEvent) => ({
  type: types.UPDATE_CALENDAR_EVENT_SUCCESS,
  payload,
});

export const updateCalendarEventFailure = (payload: string) => ({
  type: types.UPDATE_CALENDAR_EVENT_FAILURE,
  payload,
});

export const deleteCalendarEventRequest = (payload: { schoolId: string; id: string }) => ({
  type: types.DELETE_CALENDAR_EVENT_REQUEST,
  payload,
});

export const deleteCalendarEventSuccess = (payload: string) => ({
  type: types.DELETE_CALENDAR_EVENT_SUCCESS,
  payload,
});

export const deleteCalendarEventFailure = (payload: string) => ({
  type: types.DELETE_CALENDAR_EVENT_FAILURE,
  payload,
});

// Config Update
export const updateWorkingConfigRequest = (payload: { schoolId: string; data: Partial<WorkingConfig> }) => ({
  type: types.UPDATE_WORKING_CONFIG_REQUEST,
  payload,
});

export const updateWorkingConfigSuccess = (payload: WorkingConfig) => ({
  type: types.UPDATE_WORKING_CONFIG_SUCCESS,
  payload,
});

export const updateWorkingConfigFailure = (payload: string) => ({
  type: types.UPDATE_WORKING_CONFIG_FAILURE,
  payload,
});
