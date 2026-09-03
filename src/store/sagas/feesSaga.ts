import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchFeesRequest,
  fetchFeesSuccess,
  fetchFeesFailure,
  createFeeRequest,
  createFeeSuccess,
  createFeeFailure,
  updateFeeRequest,
  updateFeeSuccess,
  updateFeeFailure,
  deleteFeeRequest,
  deleteFeeSuccess,
  deleteFeeFailure,
} from "../slices/feesSlice";
import { fetchFees, createFee, updateFee, deleteFee } from "../../lib/api";
import type { FeeRecord } from "../../types";

function* handleFetchFees(): Generator<any, void, any> {
  try {
    const fees: FeeRecord[] = yield call(fetchFees);
    yield put(fetchFeesSuccess(fees));
  } catch (error: any) {
    yield put(fetchFeesFailure(error.message || "Failed to fetch fees"));
  }
}

function* handleCreateFee(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const fee: FeeRecord = yield call(createFee, action.payload);
    yield put(createFeeSuccess(fee));
  } catch (error: any) {
    yield put(createFeeFailure(error.message || "Failed to create fee"));
  }
}

function* handleUpdateFee(action: PayloadAction<{ id: string; fee: any }>): Generator<any, void, any> {
  try {
    const fee: FeeRecord = yield call(updateFee, action.payload.id, action.payload.fee);
    yield put(updateFeeSuccess(fee));
  } catch (error: any) {
    yield put(updateFeeFailure(error.message || "Failed to update fee"));
  }
}

function* handleDeleteFee(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteFee, action.payload);
    yield put(deleteFeeSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteFeeFailure(error.message || "Failed to delete fee"));
  }
}

export function* feesSaga() {
  yield takeLatest(fetchFeesRequest.type, handleFetchFees);
  yield takeLatest(createFeeRequest.type, handleCreateFee);
  yield takeLatest(updateFeeRequest.type, handleUpdateFee);
  yield takeLatest(deleteFeeRequest.type, handleDeleteFee);
}
