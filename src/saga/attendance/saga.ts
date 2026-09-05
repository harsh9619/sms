import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import { fetchAttendanceSuccess, fetchAttendanceFailure } from "./actions";
import attendanceService from "../../Services/attendance.service";
import type { AttendanceRecord } from "../../types";

function* handleFetchAttendance(): Generator<any, void, any> {
  try {
    const records: AttendanceRecord[] = yield call(attendanceService.getAttendance);
    yield put(fetchAttendanceSuccess(records));
  } catch (error: any) {
    yield put(fetchAttendanceFailure(error.message || "Failed to fetch attendance"));
  }
}

export function* attendanceSaga() {
  yield takeLatest(types.FETCH_ATTENDANCE_REQUEST, handleFetchAttendance);
}
