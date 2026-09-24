import type {
  FetchSalaryRequestPayload,
  FetchSalarySuccessPayload,
  CreateSalaryRequestPayload,
  UpdateSalaryRequestPayload,
  FetchSalaryRequestAction,
  FetchSalarySuccessAction,
  FetchSalaryFailureAction,
  CreateSalaryRequestAction,
  CreateSalarySuccessAction,
  CreateSalaryFailureAction,
  UpdateSalaryRequestAction,
  UpdateSalarySuccessAction,
  UpdateSalaryFailureAction,
  DeleteSalaryRequestAction,
  DeleteSalarySuccessAction,
  DeleteSalaryFailureAction,
} from "./types";
import type { SalaryRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchSalariesRequest = (payload?: FetchSalaryRequestPayload): FetchSalaryRequestAction => ({
  type: types.FETCH_SALARIES_REQUEST,
  payload,
});

export const fetchSalariesSuccess = (
  payload: FetchSalarySuccessPayload | SalaryRecord[]
): FetchSalarySuccessAction => ({
  type: types.FETCH_SALARIES_SUCCESS,
  payload,
});

export const fetchSalariesFailure = (payload: string): FetchSalaryFailureAction => ({
  type: types.FETCH_SALARIES_FAILURE,
  payload,
});

export const createSalaryRequest = (
  payload: CreateSalaryRequestPayload
): CreateSalaryRequestAction => ({
  type: types.CREATE_SALARY_REQUEST,
  payload,
});

export const createSalarySuccess = (payload: SalaryRecord): CreateSalarySuccessAction => ({
  type: types.CREATE_SALARY_SUCCESS,
  payload,
});

export const createSalaryFailure = (payload: string): CreateSalaryFailureAction => ({
  type: types.CREATE_SALARY_FAILURE,
  payload,
});

export const updateSalaryRequest = (
  payload: UpdateSalaryRequestPayload
): UpdateSalaryRequestAction => ({
  type: types.UPDATE_SALARY_REQUEST,
  payload,
});

export const updateSalarySuccess = (payload: SalaryRecord): UpdateSalarySuccessAction => ({
  type: types.UPDATE_SALARY_SUCCESS,
  payload,
});

export const updateSalaryFailure = (payload: string): UpdateSalaryFailureAction => ({
  type: types.UPDATE_SALARY_FAILURE,
  payload,
});

export const deleteSalaryRequest = (payload: string): DeleteSalaryRequestAction => ({
  type: types.DELETE_SALARY_REQUEST,
  payload,
});

export const deleteSalarySuccess = (payload: string): DeleteSalarySuccessAction => ({
  type: types.DELETE_SALARY_SUCCESS,
  payload,
});

export const deleteSalaryFailure = (payload: string): DeleteSalaryFailureAction => ({
  type: types.DELETE_SALARY_FAILURE,
  payload,
});
