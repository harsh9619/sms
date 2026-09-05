import type { TimetableSlot } from "../../types";
import * as types from "./actionTypes";

export const fetchTimetablesRequest = (payload?: { classId?: string; teacherId?: string }) => ({
  type: types.FETCH_TIMETABLES_REQUEST,
  payload,
});

export const fetchTimetablesSuccess = (payload: TimetableSlot[]) => ({
  type: types.FETCH_TIMETABLES_SUCCESS,
  payload,
});

export const fetchTimetablesFailure = (payload: string) => ({
  type: types.FETCH_TIMETABLES_FAILURE,
  payload,
});

export const createTimetableRequest = (payload: any) => ({
  type: types.CREATE_TIMETABLE_REQUEST,
  payload,
});

export const createTimetableSuccess = (payload: TimetableSlot) => ({
  type: types.CREATE_TIMETABLE_SUCCESS,
  payload,
});

export const createTimetableFailure = (payload: string) => ({
  type: types.CREATE_TIMETABLE_FAILURE,
  payload,
});

export const updateTimetableRequest = (payload: { id: string; t: any }) => ({
  type: types.UPDATE_TIMETABLE_REQUEST,
  payload,
});

export const updateTimetableSuccess = (payload: TimetableSlot) => ({
  type: types.UPDATE_TIMETABLE_SUCCESS,
  payload,
});

export const updateTimetableFailure = (payload: string) => ({
  type: types.UPDATE_TIMETABLE_FAILURE,
  payload,
});

export const deleteTimetableRequest = (payload: string) => ({
  type: types.DELETE_TIMETABLE_REQUEST,
  payload,
});

export const deleteTimetableSuccess = (payload: string) => ({
  type: types.DELETE_TIMETABLE_SUCCESS,
  payload,
});

export const deleteTimetableFailure = (payload: string) => ({
  type: types.DELETE_TIMETABLE_FAILURE,
  payload,
});
