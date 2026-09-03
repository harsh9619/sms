import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchClassesRequest,
  fetchClassesSuccess,
  fetchClassesFailure,
  createClassRequest,
  createClassSuccess,
  createClassFailure,
  updateClassRequest,
  updateClassSuccess,
  updateClassFailure,
  deleteClassRequest,
  deleteClassSuccess,
  deleteClassFailure,
} from "../slices/classesSlice";
import { fetchClasses, createClass, updateClass, deleteClass } from "../../lib/api";
import type { ClassInfo } from "../../types";

function* handleFetchClasses(): Generator<any, void, any> {
  try {
    const classes: ClassInfo[] = yield call(fetchClasses);
    yield put(fetchClassesSuccess(classes));
  } catch (error: any) {
    yield put(fetchClassesFailure(error.message || "Failed to fetch classes"));
  }
}

function* handleCreateClass(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const cls: ClassInfo = yield call(createClass, action.payload);
    yield put(createClassSuccess(cls));
  } catch (error: any) {
    yield put(createClassFailure(error.message || "Failed to create class"));
  }
}

function* handleUpdateClass(action: PayloadAction<{ id: string; cls: any }>): Generator<any, void, any> {
  try {
    const cls: ClassInfo = yield call(updateClass, action.payload.id, action.payload.cls);
    yield put(updateClassSuccess(cls));
  } catch (error: any) {
    yield put(updateClassFailure(error.message || "Failed to update class"));
  }
}

function* handleDeleteClass(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteClass, action.payload);
    yield put(deleteClassSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteClassFailure(error.message || "Failed to delete class"));
  }
}

export function* classesSaga() {
  yield takeLatest(fetchClassesRequest.type, handleFetchClasses);
  yield takeLatest(createClassRequest.type, handleCreateClass);
  yield takeLatest(updateClassRequest.type, handleUpdateClass);
  yield takeLatest(deleteClassRequest.type, handleDeleteClass);
}
