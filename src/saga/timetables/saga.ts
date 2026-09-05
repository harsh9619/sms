import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchTimetablesSuccess,
  fetchTimetablesFailure,
  createTimetableSuccess,
  createTimetableFailure,
  updateTimetableSuccess,
  updateTimetableFailure,
  deleteTimetableSuccess,
  deleteTimetableFailure,
} from "./actions";
import timetableService from "../../Services/timetable.service";
import type { TimetableSlot } from "../../types";

function* handleFetchTimetables(action: { type: string; payload?: { classId?: string; teacherId?: string } }): Generator<any, void, any> {
  try {
    const data: TimetableSlot[] = yield call(timetableService.getTimetables, action.payload);
    yield put(fetchTimetablesSuccess(data));
  } catch (error: any) {
    yield put(fetchTimetablesFailure(error.message || "Failed to fetch timetables"));
  }
}

function* handleCreateTimetable(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const slot: TimetableSlot = yield call(timetableService.createTimetable, action.payload);
    yield put(createTimetableSuccess(slot));
  } catch (error: any) {
    yield put(createTimetableFailure(error.message || "Failed to create timetable slot"));
  }
}

function* handleUpdateTimetable(action: { type: string; payload: { id: string; t: any } }): Generator<any, void, any> {
  try {
    const slot: TimetableSlot = yield call(timetableService.updateTimetable, action.payload.id, action.payload.t);
    yield put(updateTimetableSuccess(slot));
  } catch (error: any) {
    yield put(updateTimetableFailure(error.message || "Failed to update timetable slot"));
  }
}

function* handleDeleteTimetable(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(timetableService.deleteTimetable, action.payload);
    yield put(deleteTimetableSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteTimetableFailure(error.message || "Failed to delete timetable slot"));
  }
}

export function* timetablesSaga() {
  yield takeLatest(types.FETCH_TIMETABLES_REQUEST, handleFetchTimetables);
  yield takeLatest(types.CREATE_TIMETABLE_REQUEST, handleCreateTimetable);
  yield takeLatest(types.UPDATE_TIMETABLE_REQUEST, handleUpdateTimetable);
  yield takeLatest(types.DELETE_TIMETABLE_REQUEST, handleDeleteTimetable);
}
