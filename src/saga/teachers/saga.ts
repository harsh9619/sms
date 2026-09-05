import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import { fetchTeachersSuccess, fetchTeachersFailure } from "./actions";
import teacherService from "../../Services/teacher.service";
import type { Teacher } from "../../types";

function* handleFetchTeachers(): Generator<any, void, any> {
  try {
    const teachers: Teacher[] = yield call(teacherService.getTeachers);
    yield put(fetchTeachersSuccess(teachers));
  } catch (error: any) {
    yield put(fetchTeachersFailure(error.message || "Failed to fetch teachers"));
  }
}

export function* teachersSaga() {
  yield takeLatest(types.FETCH_TEACHERS_REQUEST, handleFetchTeachers);
}
