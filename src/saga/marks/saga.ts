import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchMarksSuccess,
  fetchMarksFailure,
  createMarksSuccess,
  createMarksFailure,
  updateMarksSuccess,
  updateMarksFailure,
  deleteMarksSuccess,
  deleteMarksFailure,
} from "./actions";
import markService from "../../Services/mark.service";
import type { MarkRecord } from "../../types";

function* handleFetchMarks(action: { type: string; payload?: { studentId?: string; classId?: string; subjectId?: string } }): Generator<any, void, any> {
  try {
    const marks: MarkRecord[] = yield call(markService.getMarks, action.payload);
    yield put(fetchMarksSuccess(marks));
  } catch (error: any) {
    yield put(fetchMarksFailure(error.message || "Failed to fetch marks"));
  }
}

function* handleCreateMarks(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const mark: MarkRecord = yield call(markService.createMarks, action.payload);
    yield put(createMarksSuccess(mark));
  } catch (error: any) {
    yield put(createMarksFailure(error.message || "Failed to create mark record"));
  }
}

function* handleUpdateMarks(action: { type: string; payload: { id: string; m: any } }): Generator<any, void, any> {
  try {
    const mark: MarkRecord = yield call(markService.updateMarks, action.payload.id, action.payload.m);
    yield put(updateMarksSuccess(mark));
  } catch (error: any) {
    yield put(updateMarksFailure(error.message || "Failed to update mark record"));
  }
}

function* handleDeleteMarks(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(markService.deleteMarks, action.payload);
    yield put(deleteMarksSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteMarksFailure(error.message || "Failed to delete mark record"));
  }
}

export function* marksSaga() {
  yield takeLatest(types.FETCH_MARKS_REQUEST, handleFetchMarks);
  yield takeLatest(types.CREATE_MARKS_REQUEST, handleCreateMarks);
  yield takeLatest(types.UPDATE_MARKS_REQUEST, handleUpdateMarks);
  yield takeLatest(types.DELETE_MARKS_REQUEST, handleDeleteMarks);
}
