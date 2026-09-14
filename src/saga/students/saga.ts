import { call, put, takeLatest, StrictEffect } from "redux-saga/effects";
import {
  FETCH_STUDENTS_REQUEST,
  CREATE_STUDENT_REQUEST,
  UPDATE_STUDENT_REQUEST,
  DELETE_STUDENT_REQUEST,
} from "./actionTypes";
import {
  fetchStudentsSuccess,
  fetchStudentsFailure,
  createStudentSuccess,
  createStudentFailure,
  updateStudentSuccess,
  updateStudentFailure,
  deleteStudentSuccess,
  deleteStudentFailure,
} from "./actions";
import studentService from "../../Services/student.service";
import {
  Student,
  FetchStudentRequestPayload,
  FetchStudentSuccessPayload,
  FetchStudentFailurePayload,
  CreateStudentRequestPayload,
  CreateStudentSuccessPayload,
  CreateStudentFailurePayload,
  UpdateStudentRequestPayload,
  UpdateStudentSuccessPayload,
  UpdateStudentFailurePayload,
  DeleteStudentRequestPayload,
  DeleteStudentSuccessPayload,
  DeleteStudentFailurePayload
} from "./types";

function* handleFetchStudents(action: { type: string; payload?: FetchStudentRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(studentService.getStudents, action.payload);
    yield put(fetchStudentsSuccess(response));
  } catch (error: any) {
    yield put(fetchStudentsFailure({
      fetchStudentSuccess: false,
      fetchStudentMsg: error.message || "Failed to fetch students"
    }));
  }
}


function* handleCreateStudent(action: { type: string; payload: CreateStudentRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    debugger;
    const response: any = yield call(studentService.createStudent, action.payload);
    yield put(createStudentSuccess({ student: response }));
  } catch (error: any) {
    debugger;
    yield put(createStudentFailure({
      addEditStudentSuccess: false,
      addEditStudentMsg: error.message || "Failed to create student"
    }));
  }
}

function* handleUpdateStudent(action: { type: string; payload: UpdateStudentRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    const response: any = yield call(studentService.updateStudent, action.payload.id, action.payload);
    yield put(updateStudentSuccess({ student: response }));
  } catch (error: any) {
    debugger
    yield put(updateStudentFailure({
      addEditStudentSuccess: false,
      addEditStudentMsg: error.message || "Failed to update student"
    }));
  }
}

function* handleDeleteStudent(action: { type: string; payload: DeleteStudentRequestPayload }): Generator<StrictEffect, void, any> {
  try {
    yield call(studentService.deleteStudent, action.payload.id);
    yield put(deleteStudentSuccess({ id: action.payload.id }));
  } catch (error: any) {
    yield put(deleteStudentFailure({
      deleteStudentSuccess: false,
      deleteStudentMsg: error.message || "Failed to delete student"
    }));
  }
}

export function* studentsSaga() {
  yield takeLatest(FETCH_STUDENTS_REQUEST, handleFetchStudents);
  yield takeLatest(CREATE_STUDENT_REQUEST, handleCreateStudent);
  yield takeLatest(UPDATE_STUDENT_REQUEST, handleUpdateStudent);
  yield takeLatest(DELETE_STUDENT_REQUEST, handleDeleteStudent);
}

