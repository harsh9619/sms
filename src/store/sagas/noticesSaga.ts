import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchNoticesRequest,
  fetchNoticesSuccess,
  fetchNoticesFailure,
  createNoticeRequest,
  createNoticeSuccess,
  createNoticeFailure,
  updateNoticeRequest,
  updateNoticeSuccess,
  updateNoticeFailure,
  deleteNoticeRequest,
  deleteNoticeSuccess,
  deleteNoticeFailure,
} from "../slices/noticesSlice";
import { fetchNotices, createNotice, updateNotice, deleteNotice } from "../../lib/api";
import type { NoticeRecord } from "../../types";

function* handleFetchNotices(action: PayloadAction<string | undefined>): Generator<any, void, any> {
  try {
    const notices: NoticeRecord[] = yield call(fetchNotices, action.payload);
    yield put(fetchNoticesSuccess(notices));
  } catch (error: any) {
    yield put(fetchNoticesFailure(error.message || "Failed to fetch notices"));
  }
}

function* handleCreateNotice(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const notice: NoticeRecord = yield call(createNotice, action.payload);
    yield put(createNoticeSuccess(notice));
  } catch (error: any) {
    yield put(createNoticeFailure(error.message || "Failed to create notice"));
  }
}

function* handleUpdateNotice(action: PayloadAction<{ id: string; n: any }>): Generator<any, void, any> {
  try {
    const notice: NoticeRecord = yield call(updateNotice, action.payload.id, action.payload.n);
    yield put(updateNoticeSuccess(notice));
  } catch (error: any) {
    yield put(updateNoticeFailure(error.message || "Failed to update notice"));
  }
}

function* handleDeleteNotice(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteNotice, action.payload);
    yield put(deleteNoticeSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteNoticeFailure(error.message || "Failed to delete notice"));
  }
}

export function* noticesSaga() {
  yield takeLatest(fetchNoticesRequest.type, handleFetchNotices);
  yield takeLatest(createNoticeRequest.type, handleCreateNotice);
  yield takeLatest(updateNoticeRequest.type, handleUpdateNotice);
  yield takeLatest(deleteNoticeRequest.type, handleDeleteNotice);
}
