import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchSalariesSuccess,
  fetchSalariesFailure,
  createSalarySuccess,
  createSalaryFailure,
  updateSalarySuccess,
  updateSalaryFailure,
  deleteSalarySuccess,
  deleteSalaryFailure,
} from "./actions";
import salaryService from "../../Services/salary.service";
import type { SalaryRecord } from "../../types";

function* handleFetchSalaries(): Generator<any, void, any> {
  try {
    const salaries: SalaryRecord[] = yield call(salaryService.getSalaries);
    yield put(fetchSalariesSuccess(salaries));
  } catch (error: any) {
    yield put(fetchSalariesFailure(error.message || "Failed to fetch salaries"));
  }
}

function* handleCreateSalary(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const sal: SalaryRecord = yield call(salaryService.createSalary, action.payload);
    yield put(createSalarySuccess(sal));
  } catch (error: any) {
    yield put(createSalaryFailure(error.message || "Failed to create salary"));
  }
}

function* handleUpdateSalary(action: { type: string; payload: { id: string; sal: any } }): Generator<any, void, any> {
  try {
    const sal: SalaryRecord = yield call(salaryService.updateSalary, action.payload.id, action.payload.sal);
    yield put(updateSalarySuccess(sal));
  } catch (error: any) {
    yield put(updateSalaryFailure(error.message || "Failed to update salary"));
  }
}

function* handleDeleteSalary(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(salaryService.deleteSalary, action.payload);
    yield put(deleteSalarySuccess(action.payload));
  } catch (error: any) {
    yield put(deleteSalaryFailure(error.message || "Failed to delete salary"));
  }
}

export function* salariesSaga() {
  yield takeLatest(types.FETCH_SALARIES_REQUEST, handleFetchSalaries);
  yield takeLatest(types.CREATE_SALARY_REQUEST, handleCreateSalary);
  yield takeLatest(types.UPDATE_SALARY_REQUEST, handleUpdateSalary);
  yield takeLatest(types.DELETE_SALARY_REQUEST, handleDeleteSalary);
}
