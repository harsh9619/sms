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
import type {
  FetchSalaryRequestAction,
  CreateSalaryRequestAction,
  UpdateSalaryRequestAction,
  DeleteSalaryRequestAction,
} from "./types";
import salaryService from "../../Services/salary.service";
import type { SalaryRecord } from "../../types";

function* handleFetchSalaries(action: FetchSalaryRequestAction): Generator<any, void, any> {
  try {
    const response: any = yield call(salaryService.getSalaries, action.payload);
    yield put(fetchSalariesSuccess(response));
  } catch (error: any) {
    yield put(fetchSalariesFailure(error.message || "Failed to fetch salaries"));
  }
}

function* handleCreateSalary(action: CreateSalaryRequestAction): Generator<any, void, any> {
  try {
    const sal: SalaryRecord = yield call(salaryService.createSalary, action.payload);
    yield put(createSalarySuccess(sal));
  } catch (error: any) {
    yield put(createSalaryFailure(error.message || "Failed to create salary"));
  }
}

function* handleUpdateSalary(action: UpdateSalaryRequestAction): Generator<any, void, any> {
  try {
    const recordId = action.payload.id;
    const recordPayload = action.payload.salary || action.payload.sal || action.payload;
    const sal: SalaryRecord = yield call(salaryService.updateSalary, recordId, recordPayload);
    yield put(updateSalarySuccess(sal));
  } catch (error: any) {
    yield put(updateSalaryFailure(error.message || "Failed to update salary"));
  }
}

function* handleDeleteSalary(action: DeleteSalaryRequestAction): Generator<any, void, any> {
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
