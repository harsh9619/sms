import type { HomeworkRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchHomeworkRequest = (payload?: { classId?: string; teacherId?: string }) => ({
  type: types.FETCH_HOMEWORK_REQUEST,
  payload,
});

export const fetchHomeworkSuccess = (payload: HomeworkRecord[]) => ({
  type: types.FETCH_HOMEWORK_SUCCESS,
  payload,
});

export const fetchHomeworkFailure = (payload: string) => ({
  type: types.FETCH_HOMEWORK_FAILURE,
  payload,
});

export const createHomeworkRequest = (payload: any) => ({
  type: types.CREATE_HOMEWORK_REQUEST,
  payload,
});

export const createHomeworkSuccess = (payload: HomeworkRecord) => ({
  type: types.CREATE_HOMEWORK_SUCCESS,
  payload,
});

export const createHomeworkFailure = (payload: string) => ({
  type: types.CREATE_HOMEWORK_FAILURE,
  payload,
});

export const updateHomeworkRequest = (payload: { id: string; hw: any }) => ({
  type: types.UPDATE_HOMEWORK_REQUEST,
  payload,
});

export const updateHomeworkSuccess = (payload: HomeworkRecord) => ({
  type: types.UPDATE_HOMEWORK_SUCCESS,
  payload,
});

export const updateHomeworkFailure = (payload: string) => ({
  type: types.UPDATE_HOMEWORK_FAILURE,
  payload,
});

export const deleteHomeworkRequest = (payload: string) => ({
  type: types.DELETE_HOMEWORK_REQUEST,
  payload,
});

export const deleteHomeworkSuccess = (payload: string) => ({
  type: types.DELETE_HOMEWORK_SUCCESS,
  payload,
});

export const deleteHomeworkFailure = (payload: string) => ({
  type: types.DELETE_HOMEWORK_FAILURE,
  payload,
});
