import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchMarksRequest,
  fetchMarksSuccess,
  fetchMarksFailure,
  createMarksRequest,
  createMarksSuccess,
  createMarksFailure,
  updateMarksRequest,
  updateMarksSuccess,
  updateMarksFailure,
  deleteMarksRequest,
  deleteMarksSuccess,
  deleteMarksFailure,
} from "../slices/marksSlice";
import { fetchMarks, createMarks, updateMarks, deleteMarks } from "../../lib/api";
import type { MarkRecord } from "../../types";

function* handleFetchMarks(action: PayloadAction<{ studentId?: string; classId?: string; subjectId?: string } | undefined>): Generator<any, void, any> {
  try {
    const marks: MarkRecord[] = yield call(fetchMarks, action.payload);
    yield put(fetchMarksSuccess(marks));
  } catch (error: any) {
    yield put(fetchMarksFailure(error.message || "Failed to fetch marks"));
  }
}

function* handleCreateMarks(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const mark: MarkRecord = yield call(createMarks, action.payload);
    yield put(createMarksSuccess(mark));
  } catch (error: any) {
    yield put(createMarksFailure(error.message || "Failed to create mark record"));
  }
}

function* handleUpdateMarks(action: PayloadAction<{ id: string; m: any }>): Generator<any, void, any> {
  try {
    const mark: MarkRecord = yield call(updateMarks, action.payload.id, action.payload.m);
    yield put(updateMarksSuccess(mark));
  } catch (error: any) {
    yield put(updateMarksFailure(error.message || "Failed to update mark record"));
  }
}

function* handleDeleteMarks(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteMarks, action.payload);
    yield put(deleteMarksSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteMarksFailure(error.message || "Failed to delete mark record"));
  }
}

export function* marksSaga() {
  yield takeLatest(fetchMarksRequest.type, handleFetchMarks);
  yield takeLatest(createMarksRequest.type, handleCreateMarks);
  yield takeLatest(updateMarksRequest.type, handleUpdateMarks);
  yield takeLatest(deleteMarksRequest.type, handleDeleteMarks);
}
