import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchTimetablesRequest,
  fetchTimetablesSuccess,
  fetchTimetablesFailure,
  createTimetableRequest,
  createTimetableSuccess,
  createTimetableFailure,
  updateTimetableRequest,
  updateTimetableSuccess,
  updateTimetableFailure,
  deleteTimetableRequest,
  deleteTimetableSuccess,
  deleteTimetableFailure,
} from "../slices/timetablesSlice";
import { fetchTimetables, createTimetable, updateTimetable, deleteTimetable } from "../../lib/api";
import type { TimetableSlot } from "../../types";

function* handleFetchTimetables(action: PayloadAction<{ classId?: string; teacherId?: string } | undefined>): Generator<any, void, any> {
  try {
    const data: TimetableSlot[] = yield call(fetchTimetables, action.payload);
    yield put(fetchTimetablesSuccess(data));
  } catch (error: any) {
    yield put(fetchTimetablesFailure(error.message || "Failed to fetch timetables"));
  }
}

function* handleCreateTimetable(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const slot: TimetableSlot = yield call(createTimetable, action.payload);
    yield put(createTimetableSuccess(slot));
  } catch (error: any) {
    yield put(createTimetableFailure(error.message || "Failed to create timetable slot"));
  }
}

function* handleUpdateTimetable(action: PayloadAction<{ id: string; t: any }>): Generator<any, void, any> {
  try {
    const slot: TimetableSlot = yield call(updateTimetable, action.payload.id, action.payload.t);
    yield put(updateTimetableSuccess(slot));
  } catch (error: any) {
    yield put(updateTimetableFailure(error.message || "Failed to update timetable slot"));
  }
}

function* handleDeleteTimetable(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteTimetable, action.payload);
    yield put(deleteTimetableSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteTimetableFailure(error.message || "Failed to delete timetable slot"));
  }
}

export function* timetablesSaga() {
  yield takeLatest(fetchTimetablesRequest.type, handleFetchTimetables);
  yield takeLatest(createTimetableRequest.type, handleCreateTimetable);
  yield takeLatest(updateTimetableRequest.type, handleUpdateTimetable);
  yield takeLatest(deleteTimetableRequest.type, handleDeleteTimetable);
}
