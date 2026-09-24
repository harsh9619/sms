import type {
  FetchFeeRequestPayload,
  FetchFeeSuccessPayload,
  CreateFeeRequestPayload,
  UpdateFeeRequestPayload,
  FetchFeeRequestAction,
  FetchFeeSuccessAction,
  FetchFeeFailureAction,
  CreateFeeRequestAction,
  CreateFeeSuccessAction,
  CreateFeeFailureAction,
  UpdateFeeRequestAction,
  UpdateFeeSuccessAction,
  UpdateFeeFailureAction,
  DeleteFeeRequestAction,
  DeleteFeeSuccessAction,
  DeleteFeeFailureAction,
} from "./types";
import type { FeeRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchFeesRequest = (payload?: FetchFeeRequestPayload): FetchFeeRequestAction => ({
  type: types.FETCH_FEES_REQUEST,
  payload,
});

export const fetchFeesSuccess = (
  payload: FetchFeeSuccessPayload | FeeRecord[]
): FetchFeeSuccessAction => ({
  type: types.FETCH_FEES_SUCCESS,
  payload,
});

export const fetchFeesFailure = (payload: string): FetchFeeFailureAction => ({
  type: types.FETCH_FEES_FAILURE,
  payload,
});

export const createFeeRequest = (payload: CreateFeeRequestPayload): CreateFeeRequestAction => ({
  type: types.CREATE_FEE_REQUEST,
  payload,
});

export const createFeeSuccess = (payload: FeeRecord): CreateFeeSuccessAction => ({
  type: types.CREATE_FEE_SUCCESS,
  payload,
});

export const createFeeFailure = (payload: string): CreateFeeFailureAction => ({
  type: types.CREATE_FEE_FAILURE,
  payload,
});

export const updateFeeRequest = (payload: UpdateFeeRequestPayload): UpdateFeeRequestAction => ({
  type: types.UPDATE_FEE_REQUEST,
  payload,
});

export const updateFeeSuccess = (payload: FeeRecord): UpdateFeeSuccessAction => ({
  type: types.UPDATE_FEE_SUCCESS,
  payload,
});

export const updateFeeFailure = (payload: string): UpdateFeeFailureAction => ({
  type: types.UPDATE_FEE_FAILURE,
  payload,
});

export const deleteFeeRequest = (payload: string): DeleteFeeRequestAction => ({
  type: types.DELETE_FEE_REQUEST,
  payload,
});

export const deleteFeeSuccess = (payload: string): DeleteFeeSuccessAction => ({
  type: types.DELETE_FEE_SUCCESS,
  payload,
});

export const deleteFeeFailure = (payload: string): DeleteFeeFailureAction => ({
  type: types.DELETE_FEE_FAILURE,
  payload,
});
