import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchTeachersRequest,
  fetchTeachersSuccess,
  fetchTeachersFailure,
} from "../slices/teachersSlice";
import { fetchTeachers } from "../../lib/api";
import type { Teacher } from "../../types";

function* handleFetchTeachers(): Generator<any, void, any> {
  try {
    const teachers: Teacher[] = yield call(fetchTeachers);
    yield put(fetchTeachersSuccess(teachers));
  } catch (error: any) {
    yield put(fetchTeachersFailure(error.message || "Failed to fetch teachers"));
  }
}

export function* teachersSaga() {
  yield takeLatest(fetchTeachersRequest.type, handleFetchTeachers);
}
