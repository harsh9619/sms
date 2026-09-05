import type { AttendanceRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchAttendanceRequest = () => ({
  type: types.FETCH_ATTENDANCE_REQUEST,
});

export const fetchAttendanceSuccess = (payload: AttendanceRecord[]) => ({
  type: types.FETCH_ATTENDANCE_SUCCESS,
  payload,
});

export const fetchAttendanceFailure = (payload: string) => ({
  type: types.FETCH_ATTENDANCE_FAILURE,
  payload,
});
