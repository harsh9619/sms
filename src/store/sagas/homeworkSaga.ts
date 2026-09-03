import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchHomeworkRequest,
  fetchHomeworkSuccess,
  fetchHomeworkFailure,
  createHomeworkRequest,
  createHomeworkSuccess,
  createHomeworkFailure,
  updateHomeworkRequest,
  updateHomeworkSuccess,
  updateHomeworkFailure,
  deleteHomeworkRequest,
  deleteHomeworkSuccess,
  deleteHomeworkFailure,
} from "../slices/homeworkSlice";
import { fetchHomework, createHomework, updateHomework, deleteHomework } from "../../lib/api";
import type { HomeworkRecord } from "../../types";

function* handleFetchHomework(action: PayloadAction<{ classId?: string; teacherId?: string } | undefined>): Generator<any, void, any> {
  try {
    const data: HomeworkRecord[] = yield call(fetchHomework, action.payload);
    yield put(fetchHomeworkSuccess(data));
  } catch (error: any) {
    yield put(fetchHomeworkFailure(error.message || "Failed to fetch homework"));
  }
}

function* handleCreateHomework(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const hw: HomeworkRecord = yield call(createHomework, action.payload);
    yield put(createHomeworkSuccess(hw));
  } catch (error: any) {
    yield put(createHomeworkFailure(error.message || "Failed to create homework"));
  }
}

function* handleUpdateHomework(action: PayloadAction<{ id: string; hw: any }>): Generator<any, void, any> {
  try {
    const hw: HomeworkRecord = yield call(updateHomework, action.payload.id, action.payload.hw);
    yield put(updateHomeworkSuccess(hw));
  } catch (error: any) {
    yield put(updateHomeworkFailure(error.message || "Failed to update homework"));
  }
}

function* handleDeleteHomework(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteHomework, action.payload);
    yield put(deleteHomeworkSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteHomeworkFailure(error.message || "Failed to delete homework"));
  }
}

export function* homeworkSaga() {
  yield takeLatest(fetchHomeworkRequest.type, handleFetchHomework);
  yield takeLatest(createHomeworkRequest.type, handleCreateHomework);
  yield takeLatest(updateHomeworkRequest.type, handleUpdateHomework);
  yield takeLatest(deleteHomeworkRequest.type, handleDeleteHomework);
}
