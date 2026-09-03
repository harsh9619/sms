import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchAttendanceRequest,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
} from "../slices/attendanceSlice";
import { fetchAttendance } from "../../lib/api";
import type { AttendanceRecord } from "../../types";

function* handleFetchAttendance(): Generator<any, void, any> {
  try {
    const records: AttendanceRecord[] = yield call(fetchAttendance);
    yield put(fetchAttendanceSuccess(records));
  } catch (error: any) {
    yield put(fetchAttendanceFailure(error.message || "Failed to fetch attendance"));
  }
}

export function* attendanceSaga() {
  yield takeLatest(fetchAttendanceRequest.type, handleFetchAttendance);
}
