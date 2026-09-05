import type { NoticeRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchNoticesRequest = (payload?: string) => ({
  type: types.FETCH_NOTICES_REQUEST,
  payload,
});

export const fetchNoticesSuccess = (payload: NoticeRecord[]) => ({
  type: types.FETCH_NOTICES_SUCCESS,
  payload,
});

export const fetchNoticesFailure = (payload: string) => ({
  type: types.FETCH_NOTICES_FAILURE,
  payload,
});

export const createNoticeRequest = (payload: any) => ({
  type: types.CREATE_NOTICE_REQUEST,
  payload,
});

export const createNoticeSuccess = (payload: NoticeRecord) => ({
  type: types.CREATE_NOTICE_SUCCESS,
  payload,
});

export const createNoticeFailure = (payload: string) => ({
  type: types.CREATE_NOTICE_FAILURE,
  payload,
});

export const updateNoticeRequest = (payload: { id: string; notice?: any; n?: any }) => ({
  type: types.UPDATE_NOTICE_REQUEST,
  payload: { id: payload.id, n: payload.n || payload.notice },
});

export const updateNoticeSuccess = (payload: NoticeRecord) => ({
  type: types.UPDATE_NOTICE_SUCCESS,
  payload,
});

export const updateNoticeFailure = (payload: string) => ({
  type: types.UPDATE_NOTICE_FAILURE,
  payload,
});

export const deleteNoticeRequest = (payload: string) => ({
  type: types.DELETE_NOTICE_REQUEST,
  payload,
});

export const deleteNoticeSuccess = (payload: string) => ({
  type: types.DELETE_NOTICE_SUCCESS,
  payload,
});

export const deleteNoticeFailure = (payload: string) => ({
  type: types.DELETE_NOTICE_FAILURE,
  payload,
});
