import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchFeesSuccess,
  fetchFeesFailure,
  createFeeSuccess,
  createFeeFailure,
  updateFeeSuccess,
  updateFeeFailure,
  deleteFeeSuccess,
  deleteFeeFailure,
} from "./actions";
import feeService from "../../Services/fee.service";
import type { FeeRecord } from "../../types";

function* handleFetchFees(): Generator<any, void, any> {
  try {
    const fees: FeeRecord[] = yield call(feeService.getFees);
    yield put(fetchFeesSuccess(fees));
  } catch (error: any) {
    yield put(fetchFeesFailure(error.message || "Failed to fetch fees"));
  }
}

function* handleCreateFee(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const fee: FeeRecord = yield call(feeService.createFee, action.payload);
    yield put(createFeeSuccess(fee));
  } catch (error: any) {
    yield put(createFeeFailure(error.message || "Failed to create fee"));
  }
}

function* handleUpdateFee(action: { type: string; payload: { id: string; fee: any } }): Generator<any, void, any> {
  try {
    const fee: FeeRecord = yield call(feeService.updateFee, action.payload.id, action.payload.fee);
    yield put(updateFeeSuccess(fee));
  } catch (error: any) {
    yield put(updateFeeFailure(error.message || "Failed to update fee"));
  }
}

function* handleDeleteFee(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(feeService.deleteFee, action.payload);
    yield put(deleteFeeSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteFeeFailure(error.message || "Failed to delete fee"));
  }
}

export function* feesSaga() {
  yield takeLatest(types.FETCH_FEES_REQUEST, handleFetchFees);
  yield takeLatest(types.CREATE_FEE_REQUEST, handleCreateFee);
  yield takeLatest(types.UPDATE_FEE_REQUEST, handleUpdateFee);
  yield takeLatest(types.DELETE_FEE_REQUEST, handleDeleteFee);
}
