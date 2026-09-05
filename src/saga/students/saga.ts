import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
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
import type { Student } from "../../types";

function* handleFetchStudents(): Generator<any, void, any> {
  try {
    const students: Student[] = yield call(studentService.getStudents);
    yield put(fetchStudentsSuccess(students));
  } catch (error: any) {
    yield put(fetchStudentsFailure(error.message || "Failed to fetch students"));
  }
}

function* handleCreateStudent(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const student: Student = yield call(studentService.createStudent, action.payload);
    yield put(createStudentSuccess(student));
  } catch (error: any) {
    yield put(createStudentFailure(error.message || "Failed to create student"));
  }
}

function* handleUpdateStudent(action: { type: string; payload: { id: string; student: any } }): Generator<any, void, any> {
  try {
    const student: Student = yield call(studentService.updateStudent, action.payload.id, action.payload.student);
    yield put(updateStudentSuccess(student));
  } catch (error: any) {
    yield put(updateStudentFailure(error.message || "Failed to update student"));
  }
}

function* handleDeleteStudent(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(studentService.deleteStudent, action.payload);
    yield put(deleteStudentSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteStudentFailure(error.message || "Failed to delete student"));
  }
}

export function* studentsSaga() {
  yield takeLatest(types.FETCH_STUDENTS_REQUEST, handleFetchStudents);
  yield takeLatest(types.CREATE_STUDENT_REQUEST, handleCreateStudent);
  yield takeLatest(types.UPDATE_STUDENT_REQUEST, handleUpdateStudent);
  yield takeLatest(types.DELETE_STUDENT_REQUEST, handleDeleteStudent);
}
