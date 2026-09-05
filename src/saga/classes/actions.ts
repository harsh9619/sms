import type { ClassInfo } from "../../types";
import * as types from "./actionTypes";

export const fetchClassesRequest = () => ({
  type: types.FETCH_CLASSES_REQUEST,
});

export const fetchClassesSuccess = (payload: ClassInfo[]) => ({
  type: types.FETCH_CLASSES_SUCCESS,
  payload,
});

export const fetchClassesFailure = (payload: string) => ({
  type: types.FETCH_CLASSES_FAILURE,
  payload,
});

export const createClassRequest = (payload: any) => ({
  type: types.CREATE_CLASS_REQUEST,
  payload,
});

export const createClassSuccess = (payload: ClassInfo) => ({
  type: types.CREATE_CLASS_SUCCESS,
  payload,
});

export const createClassFailure = (payload: string) => ({
  type: types.CREATE_CLASS_FAILURE,
  payload,
});

export const updateClassRequest = (payload: { id: string; cls: any }) => ({
  type: types.UPDATE_CLASS_REQUEST,
  payload,
});

export const updateClassSuccess = (payload: ClassInfo) => ({
  type: types.UPDATE_CLASS_SUCCESS,
  payload,
});

export const updateClassFailure = (payload: string) => ({
  type: types.UPDATE_CLASS_FAILURE,
  payload,
});

export const deleteClassRequest = (payload: string) => ({
  type: types.DELETE_CLASS_REQUEST,
  payload,
});

export const deleteClassSuccess = (payload: string) => ({
  type: types.DELETE_CLASS_SUCCESS,
  payload,
});

export const deleteClassFailure = (payload: string) => ({
  type: types.DELETE_CLASS_FAILURE,
  payload,
});
