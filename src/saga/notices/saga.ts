import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchNoticesSuccess,
  fetchNoticesFailure,
  createNoticeSuccess,
  createNoticeFailure,
  updateNoticeSuccess,
  updateNoticeFailure,
  deleteNoticeSuccess,
  deleteNoticeFailure,
} from "./actions";
import noticeService from "../../Services/notice.service";
import type { NoticeRecord } from "../../types";

function* handleFetchNotices(action: { type: string; payload?: string }): Generator<any, void, any> {
  try {
    const notices: NoticeRecord[] = yield call(noticeService.getNotices, action.payload);
    yield put(fetchNoticesSuccess(notices));
  } catch (error: any) {
    yield put(fetchNoticesFailure(error.message || "Failed to fetch notices"));
  }
}

function* handleCreateNotice(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const notice: NoticeRecord = yield call(noticeService.createNotice, action.payload);
    yield put(createNoticeSuccess(notice));
  } catch (error: any) {
    yield put(createNoticeFailure(error.message || "Failed to create notice"));
  }
}

function* handleUpdateNotice(action: { type: string; payload: { id: string; n: any } }): Generator<any, void, any> {
  try {
    const notice: NoticeRecord = yield call(noticeService.updateNotice, action.payload.id, action.payload.n);
    yield put(updateNoticeSuccess(notice));
  } catch (error: any) {
    yield put(updateNoticeFailure(error.message || "Failed to update notice"));
  }
}

function* handleDeleteNotice(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(noticeService.deleteNotice, action.payload);
    yield put(deleteNoticeSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteNoticeFailure(error.message || "Failed to delete notice"));
  }
}

export function* noticesSaga() {
  yield takeLatest(types.FETCH_NOTICES_REQUEST, handleFetchNotices);
  yield takeLatest(types.CREATE_NOTICE_REQUEST, handleCreateNotice);
  yield takeLatest(types.UPDATE_NOTICE_REQUEST, handleUpdateNotice);
  yield takeLatest(types.DELETE_NOTICE_REQUEST, handleDeleteNotice);
}
