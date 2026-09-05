import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import { fetchSchoolsSuccess, fetchSchoolsFailure } from "./actions";
import schoolService from "../../Services/school.service";
import type { School } from "../../context/SchoolContext";

function* handleFetchSchools(): Generator<any, void, any> {
  try {
    const schools: School[] = yield call(schoolService.getSchools);
    yield put(fetchSchoolsSuccess(schools));
  } catch (error: any) {
    yield put(fetchSchoolsFailure(error.message || "Failed to fetch schools"));
  }
}

export function* schoolSaga() {
  yield takeLatest(types.FETCH_SCHOOLS_REQUEST, handleFetchSchools);
}
