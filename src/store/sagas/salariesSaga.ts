import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchSalariesRequest,
  fetchSalariesSuccess,
  fetchSalariesFailure,
  createSalaryRequest,
  createSalarySuccess,
  createSalaryFailure,
  updateSalaryRequest,
  updateSalarySuccess,
  updateSalaryFailure,
  deleteSalaryRequest,
  deleteSalarySuccess,
  deleteSalaryFailure,
} from "../slices/salariesSlice";
import { fetchSalaries, createSalary, updateSalary, deleteSalary } from "../../lib/api";
import type { SalaryRecord } from "../../types";

function* handleFetchSalaries(): Generator<any, void, any> {
  try {
    const salaries: SalaryRecord[] = yield call(fetchSalaries);
    yield put(fetchSalariesSuccess(salaries));
  } catch (error: any) {
    yield put(fetchSalariesFailure(error.message || "Failed to fetch salaries"));
  }
}

function* handleCreateSalary(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const sal: SalaryRecord = yield call(createSalary, action.payload);
    yield put(createSalarySuccess(sal));
  } catch (error: any) {
    yield put(createSalaryFailure(error.message || "Failed to create salary"));
  }
}

function* handleUpdateSalary(action: PayloadAction<{ id: string; sal: any }>): Generator<any, void, any> {
  try {
    const sal: SalaryRecord = yield call(updateSalary, action.payload.id, action.payload.sal);
    yield put(updateSalarySuccess(sal));
  } catch (error: any) {
    yield put(updateSalaryFailure(error.message || "Failed to update salary"));
  }
}

function* handleDeleteSalary(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteSalary, action.payload);
    yield put(deleteSalarySuccess(action.payload));
  } catch (error: any) {
    yield put(deleteSalaryFailure(error.message || "Failed to delete salary"));
  }
}

export function* salariesSaga() {
  yield takeLatest(fetchSalariesRequest.type, handleFetchSalaries);
  yield takeLatest(createSalaryRequest.type, handleCreateSalary);
  yield takeLatest(updateSalaryRequest.type, handleUpdateSalary);
  yield takeLatest(deleteSalaryRequest.type, handleDeleteSalary);
}
