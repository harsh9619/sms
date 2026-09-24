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
import type {
  FetchFeeRequestAction,
  CreateFeeRequestAction,
  UpdateFeeRequestAction,
  DeleteFeeRequestAction,
} from "./types";
import feeService from "../../Services/fee.service";
import type { FeeRecord } from "../../types";

function* handleFetchFees(action: FetchFeeRequestAction): Generator<any, void, any> {
  try {
    const response: any = yield call(feeService.getFees, action.payload);
    yield put(fetchFeesSuccess(response));
  } catch (error: any) {
    yield put(fetchFeesFailure(error.message || "Failed to fetch fees"));
  }
}

function* handleCreateFee(action: CreateFeeRequestAction): Generator<any, void, any> {
  try {
    const fee: FeeRecord = yield call(feeService.createFee, action.payload);
    yield put(createFeeSuccess(fee));
  } catch (error: any) {
    yield put(createFeeFailure(error.message || "Failed to create fee"));
  }
}

function* handleUpdateFee(action: UpdateFeeRequestAction): Generator<any, void, any> {
  try {
    const fee: FeeRecord = yield call(feeService.updateFee, action.payload.id, action.payload.fee);
    yield put(updateFeeSuccess(fee));
  } catch (error: any) {
    yield put(updateFeeFailure(error.message || "Failed to update fee"));
  }
}

function* handleDeleteFee(action: DeleteFeeRequestAction): Generator<any, void, any> {
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
