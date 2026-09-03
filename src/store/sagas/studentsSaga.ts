import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchStudentsRequest,
  fetchStudentsSuccess,
  fetchStudentsFailure,
  createStudentRequest,
  createStudentSuccess,
  createStudentFailure,
  updateStudentRequest,
  updateStudentSuccess,
  updateStudentFailure,
  deleteStudentRequest,
  deleteStudentSuccess,
  deleteStudentFailure,
} from "../slices/studentsSlice";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../lib/api";
import type { Student } from "../../types";

function* handleFetchStudents(): Generator<any, void, any> {
  try {
    const students: Student[] = yield call(fetchStudents);
    yield put(fetchStudentsSuccess(students));
  } catch (error: any) {
    yield put(fetchStudentsFailure(error.message || "Failed to fetch students"));
  }
}

function* handleCreateStudent(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const student: Student = yield call(createStudent, action.payload);
    yield put(createStudentSuccess(student));
  } catch (error: any) {
    yield put(createStudentFailure(error.message || "Failed to create student"));
  }
}

function* handleUpdateStudent(action: PayloadAction<{ id: string; student: any }>): Generator<any, void, any> {
  try {
    const student: Student = yield call(updateStudent, action.payload.id, action.payload.student);
    yield put(updateStudentSuccess(student));
  } catch (error: any) {
    yield put(updateStudentFailure(error.message || "Failed to update student"));
  }
}

function* handleDeleteStudent(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteStudent, action.payload);
    yield put(deleteStudentSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteStudentFailure(error.message || "Failed to delete student"));
  }
}

export function* studentsSaga() {
  yield takeLatest(fetchStudentsRequest.type, handleFetchStudents);
  yield takeLatest(createStudentRequest.type, handleCreateStudent);
  yield takeLatest(updateStudentRequest.type, handleUpdateStudent);
  yield takeLatest(deleteStudentRequest.type, handleDeleteStudent);
}
