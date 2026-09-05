import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchSchoolsSuccess,
  fetchSchoolsFailure,
  createSchoolSuccess,
  createSchoolFailure,
  updateSchoolSuccess,
  updateSchoolFailure,
} from "./actions";
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

function* handleCreateSchool(action: any): Generator<any, void, any> {
  try {
    const school: School = yield call(schoolService.createSchool, action.payload);
    yield put(createSchoolSuccess(school));
  } catch (error: any) {
    yield put(createSchoolFailure(error.message || "Failed to create school"));
  }
}

function* handleUpdateSchool(action: any): Generator<any, void, any> {
  try {
    const { id, ...data } = action.payload;
    const school: School = yield call(schoolService.updateSchool, id, data);
    yield put(updateSchoolSuccess(school));
  } catch (error: any) {
    yield put(updateSchoolFailure(error.message || "Failed to update school"));
  }
}

export function* schoolSaga() {
  yield takeLatest(types.FETCH_SCHOOLS_REQUEST, handleFetchSchools);
  yield takeLatest(types.CREATE_SCHOOL_REQUEST, handleCreateSchool);
  yield takeLatest(types.UPDATE_SCHOOL_REQUEST, handleUpdateSchool);
}
