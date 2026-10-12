import { call, put, takeLatest, all } from "redux-saga/effects";
import academicCalendarService from "../../Services/academicCalendar.service";
import type { CalendarEvent, WorkingConfig } from "../../Services/academicCalendar.service";
import * as types from "./actionTypes";
import * as actions from "./actions";
import { toast } from "react-toastify";

// Fetch Calendar Events via dedicated GET /events API
function* handleFetchCalendarEvents(action: ReturnType<typeof actions.fetchCalendarEventsRequest>): Generator<any, void, any> {
  try {
    const schoolId = action.payload?.schoolId || "1";
    const response: CalendarEvent[] = yield call(academicCalendarService.getEvents, schoolId, {
      month: action.payload?.month,
      type: action.payload?.type,
      role: action.payload?.role,
    });
    yield put(actions.fetchCalendarEventsSuccess(response));
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to fetch calendar events";
    yield put(actions.fetchCalendarEventsFailure(errorMsg));
    toast.error(errorMsg);
  }
}

// Fetch Working Config via dedicated GET /config API
function* handleFetchWorkingConfig(action: ReturnType<typeof actions.fetchWorkingConfigRequest>): Generator<any, void, any> {
  try {
    const schoolId = action.payload?.schoolId || "1";
    const response: WorkingConfig = yield call(academicCalendarService.getConfig, schoolId);
    yield put(actions.fetchWorkingConfigSuccess(response));
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to fetch school configuration";
    yield put(actions.fetchWorkingConfigFailure(errorMsg));
    toast.error(errorMsg);
  }
}

// Combined overview fallback
function* handleFetchAcademicCalendar(action: ReturnType<typeof actions.fetchAcademicCalendarRequest>): Generator<any, void, any> {
  try {
    const schoolId = action.payload?.schoolId || "1";
    const [events, sessionConfig]: [CalendarEvent[], WorkingConfig] = yield all([
      call(academicCalendarService.getEvents, schoolId, {
        month: action.payload?.month,
        type: action.payload?.type,
        role: action.payload?.role,
      }),
      call(academicCalendarService.getConfig, schoolId),
    ]);

    const holidays = (events || []).filter((ev) => ev.isHoliday || ev.type === "HOLIDAY");
    yield put(
      actions.fetchAcademicCalendarSuccess({
        sessionConfig,
        events,
        summary: {
          totalEvents: events.length,
          totalHolidays: holidays.length,
          totalWorkingDays: sessionConfig.totalWorkingDays || 0,
        },
      })
    );
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to fetch academic calendar";
    yield put(actions.fetchAcademicCalendarFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleCreateCalendarEvent(action: ReturnType<typeof actions.createCalendarEventRequest>): Generator<any, void, any> {
  try {
    const response = yield call(academicCalendarService.createEvent, action.payload.schoolId, action.payload.data);
    yield put(actions.createCalendarEventSuccess(response));
    toast.success("Event / Holiday created successfully!");
    yield put(actions.fetchCalendarEventsRequest({ schoolId: action.payload.schoolId }));
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to create event";
    yield put(actions.createCalendarEventFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleUpdateCalendarEvent(action: ReturnType<typeof actions.updateCalendarEventRequest>): Generator<any, void, any> {
  try {
    const response = yield call(
      academicCalendarService.updateEvent,
      action.payload.schoolId,
      action.payload.id,
      action.payload.data
    );
    yield put(actions.updateCalendarEventSuccess(response));
    toast.success("Event / Holiday updated successfully!");
    yield put(actions.fetchCalendarEventsRequest({ schoolId: action.payload.schoolId }));
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to update event";
    yield put(actions.updateCalendarEventFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleDeleteCalendarEvent(action: ReturnType<typeof actions.deleteCalendarEventRequest>): Generator<any, void, any> {
  try {
    yield call(academicCalendarService.deleteEvent, action.payload.schoolId, action.payload.id);
    yield put(actions.deleteCalendarEventSuccess(action.payload.id));
    toast.success("Event deleted successfully!");
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to delete event";
    yield put(actions.deleteCalendarEventFailure(errorMsg));
    toast.error(errorMsg);
  }
}

function* handleUpdateWorkingConfig(action: ReturnType<typeof actions.updateWorkingConfigRequest>): Generator<any, void, any> {
  try {
    const response = yield call(academicCalendarService.updateWorkingConfig, action.payload.schoolId, action.payload.data);
    yield put(actions.updateWorkingConfigSuccess(response));
    toast.success("Working days configuration updated!");
    yield put(actions.fetchWorkingConfigRequest({ schoolId: action.payload.schoolId }));
  } catch (error: any) {
    const errorMsg = error?.response?.data?.message || "Failed to update working config";
    yield put(actions.updateWorkingConfigFailure(errorMsg));
    toast.error(errorMsg);
  }
}

export function* academicCalendarSaga() {
  yield takeLatest(types.FETCH_CALENDAR_EVENTS_REQUEST, handleFetchCalendarEvents);
  yield takeLatest(types.FETCH_WORKING_CONFIG_REQUEST, handleFetchWorkingConfig);
  yield takeLatest(types.FETCH_ACADEMIC_CALENDAR_REQUEST, handleFetchAcademicCalendar);
  yield takeLatest(types.CREATE_CALENDAR_EVENT_REQUEST, handleCreateCalendarEvent);
  yield takeLatest(types.UPDATE_CALENDAR_EVENT_REQUEST, handleUpdateCalendarEvent);
  yield takeLatest(types.DELETE_CALENDAR_EVENT_REQUEST, handleDeleteCalendarEvent);
  yield takeLatest(types.UPDATE_WORKING_CONFIG_REQUEST, handleUpdateWorkingConfig);
}
