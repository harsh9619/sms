import type { AttendanceRecord } from "../../types";
import * as types from "./actionTypes";
import {
  FetchAttendanceRequestPayload,
  SaveAttendanceRequestPayload,
  FetchMyAttendanceRequestPayload,
} from "./types";

export const fetchAttendanceRequest = (payload?: FetchAttendanceRequestPayload) => ({
  type: types.FETCH_ATTENDANCE_REQUEST,
  payload,
});

export const fetchAttendanceSuccess = (payload: AttendanceRecord[]) => ({
  type: types.FETCH_ATTENDANCE_SUCCESS,
  payload,
});

export const fetchAttendanceFailure = (payload: string) => ({
  type: types.FETCH_ATTENDANCE_FAILURE,
  payload,
});

export const saveAttendanceRequest = (payload: SaveAttendanceRequestPayload) => ({
  type: types.SAVE_ATTENDANCE_REQUEST,
  payload,
});

export const saveAttendanceSuccess = (payload: AttendanceRecord[]) => ({
  type: types.SAVE_ATTENDANCE_SUCCESS,
  payload,
});

export const saveAttendanceFailure = (payload: string) => ({
  type: types.SAVE_ATTENDANCE_FAILURE,
  payload,
});

export const fetchMyAttendanceRequest = (payload: FetchMyAttendanceRequestPayload) => ({
  type: types.FETCH_MY_ATTENDANCE_REQUEST,
  payload,
});

export const fetchMyAttendanceSuccess = (payload: AttendanceRecord[]) => ({
  type: types.FETCH_MY_ATTENDANCE_SUCCESS,
  payload,
});

export const fetchMyAttendanceFailure = (payload: string) => ({
  type: types.FETCH_MY_ATTENDANCE_FAILURE,
  payload,
});
