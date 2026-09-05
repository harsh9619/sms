import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchHomeworkSuccess,
  fetchHomeworkFailure,
  createHomeworkSuccess,
  createHomeworkFailure,
  updateHomeworkSuccess,
  updateHomeworkFailure,
  deleteHomeworkSuccess,
  deleteHomeworkFailure,
} from "./actions";
import homeworkService from "../../Services/homework.service";
import type { HomeworkRecord } from "../../types";

function* handleFetchHomework(action: { type: string; payload?: { classId?: string; teacherId?: string } }): Generator<any, void, any> {
  try {
    const data: HomeworkRecord[] = yield call(homeworkService.getHomework, action.payload);
    yield put(fetchHomeworkSuccess(data));
  } catch (error: any) {
    yield put(fetchHomeworkFailure(error.message || "Failed to fetch homework"));
  }
}

function* handleCreateHomework(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const hw: HomeworkRecord = yield call(homeworkService.createHomework, action.payload);
    yield put(createHomeworkSuccess(hw));
  } catch (error: any) {
    yield put(createHomeworkFailure(error.message || "Failed to create homework"));
  }
}

function* handleUpdateHomework(action: { type: string; payload: { id: string; hw: any } }): Generator<any, void, any> {
  try {
    const hw: HomeworkRecord = yield call(homeworkService.updateHomework, action.payload.id, action.payload.hw);
    yield put(updateHomeworkSuccess(hw));
  } catch (error: any) {
    yield put(updateHomeworkFailure(error.message || "Failed to update homework"));
  }
}

function* handleDeleteHomework(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(homeworkService.deleteHomework, action.payload);
    yield put(deleteHomeworkSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteHomeworkFailure(error.message || "Failed to delete homework"));
  }
}

export function* homeworkSaga() {
  yield takeLatest(types.FETCH_HOMEWORK_REQUEST, handleFetchHomework);
  yield takeLatest(types.CREATE_HOMEWORK_REQUEST, handleCreateHomework);
  yield takeLatest(types.UPDATE_HOMEWORK_REQUEST, handleUpdateHomework);
  yield takeLatest(types.DELETE_HOMEWORK_REQUEST, handleDeleteHomework);
}
