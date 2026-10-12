import type { AcademicCalendarState } from "./types";
import * as types from "./actionTypes";

const initialState: AcademicCalendarState = {
  events: [],
  sessionConfig: null,
  summary: {
    totalEvents: 0,
    totalHolidays: 0,
    totalWorkingDays: 0,
  },
  loading: false,
  error: null,
};

export const academicCalendarReducer = (state = initialState, action: any): AcademicCalendarState => {
  switch (action.type) {
    case types.FETCH_ACADEMIC_CALENDAR_REQUEST:
    case types.FETCH_CALENDAR_EVENTS_REQUEST:
    case types.FETCH_WORKING_CONFIG_REQUEST:
    case types.CREATE_CALENDAR_EVENT_REQUEST:
    case types.UPDATE_CALENDAR_EVENT_REQUEST:
    case types.DELETE_CALENDAR_EVENT_REQUEST:
    case types.UPDATE_WORKING_CONFIG_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.FETCH_ACADEMIC_CALENDAR_SUCCESS:
      return {
        ...state,
        loading: false,
        events: action.payload.events || [],
        sessionConfig: action.payload.sessionConfig || null,
        summary: action.payload.summary || state.summary,
        error: null,
      };

    case types.FETCH_CALENDAR_EVENTS_SUCCESS: {
      const events = action.payload || [];
      const holidaysCount = events.filter((ev: any) => ev.isHoliday || ev.type === "HOLIDAY").length;
      return {
        ...state,
        loading: false,
        events,
        summary: {
          ...state.summary,
          totalEvents: events.length,
          totalHolidays: holidaysCount,
        },
        error: null,
      };
    }

    case types.FETCH_WORKING_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        sessionConfig: action.payload,
        summary: {
          ...state.summary,
          totalWorkingDays: action.payload?.totalWorkingDays ?? state.summary.totalWorkingDays,
        },
        error: null,
      };

    case types.CREATE_CALENDAR_EVENT_SUCCESS:
      return {
        ...state,
        loading: false,
        events: [...state.events, action.payload],
        summary: {
          ...state.summary,
          totalEvents: state.summary.totalEvents + 1,
          totalHolidays: action.payload.isHoliday ? state.summary.totalHolidays + 1 : state.summary.totalHolidays,
        },
      };

    case types.UPDATE_CALENDAR_EVENT_SUCCESS:
      return {
        ...state,
        loading: false,
        events: state.events.map((ev) => (ev.id === action.payload.id ? action.payload : ev)),
      };

    case types.DELETE_CALENDAR_EVENT_SUCCESS:
      const deletedEvent = state.events.find((ev) => ev.id === action.payload);
      return {
        ...state,
        loading: false,
        events: state.events.filter((ev) => ev.id !== action.payload),
        summary: {
          ...state.summary,
          totalEvents: Math.max(0, state.summary.totalEvents - 1),
          totalHolidays: deletedEvent?.isHoliday ? Math.max(0, state.summary.totalHolidays - 1) : state.summary.totalHolidays,
        },
      };

    case types.UPDATE_WORKING_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        sessionConfig: action.payload,
        summary: {
          ...state.summary,
          totalWorkingDays: action.payload?.totalWorkingDays ?? state.summary.totalWorkingDays,
        },
      };

    case types.FETCH_ACADEMIC_CALENDAR_FAILURE:
    case types.FETCH_CALENDAR_EVENTS_FAILURE:
    case types.FETCH_WORKING_CONFIG_FAILURE:
    case types.CREATE_CALENDAR_EVENT_FAILURE:
    case types.UPDATE_CALENDAR_EVENT_FAILURE:
    case types.DELETE_CALENDAR_EVENT_FAILURE:
    case types.UPDATE_WORKING_CONFIG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
