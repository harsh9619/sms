import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  saveAttendanceSuccess,
  saveAttendanceFailure,
  fetchMyAttendanceSuccess,
  fetchMyAttendanceFailure,
} from "./actions";
import attendanceService from "../../Services/attendance.service";
import type { AttendanceRecord } from "../../types";
import {
  FetchAttendanceRequestAction,
  SaveAttendanceRequestAction,
  FetchMyAttendanceRequestAction,
} from "./types";

function* handleFetchAttendance(action: FetchAttendanceRequestAction): Generator<any, void, any> {
  try {
    const payload = action.payload || {};
    const records: AttendanceRecord[] = yield call(attendanceService.getAttendance, payload);
    yield put(fetchAttendanceSuccess(records));
  } catch (error: any) {
    yield put(fetchAttendanceFailure(error.message || "Failed to fetch attendance"));
  }
}

function* handleSaveAttendance(action: SaveAttendanceRequestAction): Generator<any, void, any> {
  try {
    const { schoolId, records } = action.payload;
    const savedRecords: AttendanceRecord[] = yield call(
      attendanceService.saveAttendance,
      schoolId || "1",
      records
    );
    yield put(saveAttendanceSuccess(savedRecords));
  } catch (error: any) {
    yield put(saveAttendanceFailure(error.message || "Failed to save attendance"));
  }
}

function* handleFetchMyAttendance(action: FetchMyAttendanceRequestAction): Generator<any, void, any> {
  try {
    const { schoolId, studentId, month, year } = action.payload;
    const records: AttendanceRecord[] = yield call(
      attendanceService.getMyAttendance,
      schoolId || "1",
      studentId,
      { month, year }
    );
    yield put(fetchMyAttendanceSuccess(records));
  } catch (error: any) {
    yield put(fetchMyAttendanceFailure(error.message || "Failed to fetch my attendance"));
  }
}

export function* attendanceSaga() {
  yield takeLatest(types.FETCH_ATTENDANCE_REQUEST, handleFetchAttendance);
  yield takeLatest(types.SAVE_ATTENDANCE_REQUEST, handleSaveAttendance);
  yield takeLatest(types.FETCH_MY_ATTENDANCE_REQUEST, handleFetchMyAttendance);
}
