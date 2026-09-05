import type { MarkRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchMarksRequest = (payload?: { studentId?: string; classId?: string; subjectId?: string }) => ({
  type: types.FETCH_MARKS_REQUEST,
  payload,
});

export const fetchMarksSuccess = (payload: MarkRecord[]) => ({
  type: types.FETCH_MARKS_SUCCESS,
  payload,
});

export const fetchMarksFailure = (payload: string) => ({
  type: types.FETCH_MARKS_FAILURE,
  payload,
});

export const createMarksRequest = (payload: any) => ({
  type: types.CREATE_MARKS_REQUEST,
  payload,
});

export const createMarksSuccess = (payload: MarkRecord) => ({
  type: types.CREATE_MARKS_SUCCESS,
  payload,
});

export const createMarksFailure = (payload: string) => ({
  type: types.CREATE_MARKS_FAILURE,
  payload,
});

export const updateMarksRequest = (payload: { id: string; m: any }) => ({
  type: types.UPDATE_MARKS_REQUEST,
  payload,
});

export const updateMarksSuccess = (payload: MarkRecord) => ({
  type: types.UPDATE_MARKS_SUCCESS,
  payload,
});

export const updateMarksFailure = (payload: string) => ({
  type: types.UPDATE_MARKS_FAILURE,
  payload,
});

export const deleteMarksRequest = (payload: string) => ({
  type: types.DELETE_MARKS_REQUEST,
  payload,
});

export const deleteMarksSuccess = (payload: string) => ({
  type: types.DELETE_MARKS_SUCCESS,
  payload,
});

export const deleteMarksFailure = (payload: string) => ({
  type: types.DELETE_MARKS_FAILURE,
  payload,
});
