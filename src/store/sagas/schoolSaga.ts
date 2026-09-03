import { call, put, takeLatest } from "redux-saga/effects";
import {
  fetchSchoolsRequest,
  fetchSchoolsSuccess,
  fetchSchoolsFailure,
} from "../slices/schoolSlice";
import { fetchSchools } from "../../lib/api";
import type { School } from "../../context/SchoolContext";

function* handleFetchSchools(): Generator<any, void, any> {
  try {
    const schools: School[] = yield call(fetchSchools);
    yield put(fetchSchoolsSuccess(schools));
  } catch (error: any) {
    yield put(fetchSchoolsFailure(error.message || "Failed to fetch schools"));
  }
}

export function* schoolSaga() {
  yield takeLatest(fetchSchoolsRequest.type, handleFetchSchools);
}
