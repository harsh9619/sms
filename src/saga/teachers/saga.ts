import { call, put, takeLatest, StrictEffect } from "redux-saga/effects";
import {
  FETCH_TEACHERS_REQUEST,
  CREATE_TEACHER_REQUEST,
  UPDATE_TEACHER_REQUEST,
  DELETE_TEACHER_REQUEST,
  EXPORT_TEACHERS_REQUEST,
  BULK_CREATE_TEACHERS_REQUEST,
} from "./actionTypes";
import {
  fetchTeachersSuccess,
  fetchTeachersFailure,
  createTeacherSuccess,
  createTeacherFailure,
  updateTeacherSuccess,
  updateTeacherFailure,
  deleteTeacherSuccess,
  deleteTeacherFailure,
  exportTeachersSuccess,
  exportTeachersFailure,
} from "./actions";
import teacherService from "../../Services/teacher.service";
import {
  FetchTeacherRequestPayload,
  CreateTeacherRequestPayload,
  UpdateTeacherRequestPayload,
  DeleteTeacherRequestPayload,
} from "./types";

function* handleFetchTeachers(action: { type: string; payload?: FetchTeacherRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(teacherService.getTeachers, action.payload);
    yield put(fetchTeachersSuccess(response));
  } catch (error: any) {
    yield put(fetchTeachersFailure({
      fetchTeacherSuccess: false,
      fetchTeacherMsg: error.message || "Failed to fetch teachers"
    }));
  }
}

function* handleCreateTeacher(action: { type: string; payload: CreateTeacherRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(teacherService.createTeacher, action.payload);
    yield put(createTeacherSuccess({ teacher: response }));
  } catch (error: any) {
    yield put(createTeacherFailure({
      addEditTeacherSuccess: false,
      addEditTeacherMsg: error.message || "Failed to create teacher"
    }));
  }
}

function* handleUpdateTeacher(action: { type: string; payload: UpdateTeacherRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(teacherService.updateTeacher, action.payload.id, action.payload);
    yield put(updateTeacherSuccess({ teacher: response }));
  } catch (error: any) {
    yield put(updateTeacherFailure({
      addEditTeacherSuccess: false,
      addEditTeacherMsg: error.message || "Failed to update teacher"
    }));
  }
}

function* handleDeleteTeacher(action: { type: string; payload: DeleteTeacherRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    yield call(teacherService.deleteTeacher, action.payload.id);
    yield put(deleteTeacherSuccess({ id: action.payload.id }));
  } catch (error: any) {
    yield put(deleteTeacherFailure({
      deleteTeacherSuccess: false,
      deleteTeacherMsg: error.message || "Failed to delete teacher"
    }));
  }
}

function* handleBulkCreateTeachers(action: { type: string; payload: { teachers: any[] } }): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(teacherService.bulkCreateTeachers, action.payload.teachers);
    yield put({ type: "teachers/BULK_CREATE_TEACHERS_SUCCESS", payload: response });
    yield put({ type: FETCH_TEACHERS_REQUEST });
  } catch (error: any) {
    yield put({ type: "teachers/BULK_CREATE_TEACHERS_FAILURE", payload: error.message });
  }
}

function* handleExportTeachers(): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(teacherService.exportTeachers);
    yield put(exportTeachersSuccess(response));
  } catch (error: any) {
    yield put(exportTeachersFailure(error.message || "Failed to export teachers"));
  }
}

export function* teachersSaga() {
  yield takeLatest(FETCH_TEACHERS_REQUEST, handleFetchTeachers);
  yield takeLatest(CREATE_TEACHER_REQUEST, handleCreateTeacher);
  yield takeLatest(UPDATE_TEACHER_REQUEST, handleUpdateTeacher);
  yield takeLatest(DELETE_TEACHER_REQUEST, handleDeleteTeacher);
  yield takeLatest("teachers/BULK_CREATE_TEACHERS_REQUEST", handleBulkCreateTeachers);
  yield takeLatest(EXPORT_TEACHERS_REQUEST, handleExportTeachers);
}

export default teachersSaga;
