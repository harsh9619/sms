import type { FeeRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchFeesRequest = () => ({
  type: types.FETCH_FEES_REQUEST,
});

export const fetchFeesSuccess = (payload: FeeRecord[]) => ({
  type: types.FETCH_FEES_SUCCESS,
  payload,
});

export const fetchFeesFailure = (payload: string) => ({
  type: types.FETCH_FEES_FAILURE,
  payload,
});

export const createFeeRequest = (payload: any) => ({
  type: types.CREATE_FEE_REQUEST,
  payload,
});

export const createFeeSuccess = (payload: FeeRecord) => ({
  type: types.CREATE_FEE_SUCCESS,
  payload,
});

export const createFeeFailure = (payload: string) => ({
  type: types.CREATE_FEE_FAILURE,
  payload,
});

export const updateFeeRequest = (payload: { id: string; fee: any }) => ({
  type: types.UPDATE_FEE_REQUEST,
  payload,
});

export const updateFeeSuccess = (payload: FeeRecord) => ({
  type: types.UPDATE_FEE_SUCCESS,
  payload,
});

export const updateFeeFailure = (payload: string) => ({
  type: types.UPDATE_FEE_FAILURE,
  payload,
});

export const deleteFeeRequest = (payload: string) => ({
  type: types.DELETE_FEE_REQUEST,
  payload,
});

export const deleteFeeSuccess = (payload: string) => ({
  type: types.DELETE_FEE_SUCCESS,
  payload,
});

export const deleteFeeFailure = (payload: string) => ({
  type: types.DELETE_FEE_FAILURE,
  payload,
});
