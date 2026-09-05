import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchClassesSuccess,
  fetchClassesFailure,
  createClassSuccess,
  createClassFailure,
  updateClassSuccess,
  updateClassFailure,
  deleteClassSuccess,
  deleteClassFailure,
} from "./actions";
import classService from "../../Services/class.service";
import type { ClassInfo } from "../../types";

function* handleFetchClasses(): Generator<any, void, any> {
  try {
    const classes: ClassInfo[] = yield call(classService.getClasses);
    yield put(fetchClassesSuccess(classes));
  } catch (error: any) {
    yield put(fetchClassesFailure(error.message || "Failed to fetch classes"));
  }
}

function* handleCreateClass(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const cls: ClassInfo = yield call(classService.createClass, action.payload);
    yield put(createClassSuccess(cls));
  } catch (error: any) {
    yield put(createClassFailure(error.message || "Failed to create class"));
  }
}

function* handleUpdateClass(action: { type: string; payload: { id: string; cls: any } }): Generator<any, void, any> {
  try {
    const cls: ClassInfo = yield call(classService.updateClass, action.payload.id, action.payload.cls);
    yield put(updateClassSuccess(cls));
  } catch (error: any) {
    yield put(updateClassFailure(error.message || "Failed to update class"));
  }
}

function* handleDeleteClass(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(classService.deleteClass, action.payload);
    yield put(deleteClassSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteClassFailure(error.message || "Failed to delete class"));
  }
}

export function* classesSaga() {
  yield takeLatest(types.FETCH_CLASSES_REQUEST, handleFetchClasses);
  yield takeLatest(types.CREATE_CLASS_REQUEST, handleCreateClass);
  yield takeLatest(types.UPDATE_CLASS_REQUEST, handleUpdateClass);
  yield takeLatest(types.DELETE_CLASS_REQUEST, handleDeleteClass);
}
