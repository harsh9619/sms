import type { SalaryRecord } from "../../types";
import * as types from "./actionTypes";

export const fetchSalariesRequest = () => ({
  type: types.FETCH_SALARIES_REQUEST,
});

export const fetchSalariesSuccess = (payload: SalaryRecord[]) => ({
  type: types.FETCH_SALARIES_SUCCESS,
  payload,
});

export const fetchSalariesFailure = (payload: string) => ({
  type: types.FETCH_SALARIES_FAILURE,
  payload,
});

export const createSalaryRequest = (payload: any) => ({
  type: types.CREATE_SALARY_REQUEST,
  payload,
});

export const createSalarySuccess = (payload: SalaryRecord) => ({
  type: types.CREATE_SALARY_SUCCESS,
  payload,
});

export const createSalaryFailure = (payload: string) => ({
  type: types.CREATE_SALARY_FAILURE,
  payload,
});

export const updateSalaryRequest = (payload: { id: string; salary?: any; sal?: any }) => ({
  type: types.UPDATE_SALARY_REQUEST,
  payload: { id: payload.id, sal: payload.sal || payload.salary },
});

export const updateSalarySuccess = (payload: SalaryRecord) => ({
  type: types.UPDATE_SALARY_SUCCESS,
  payload,
});

export const updateSalaryFailure = (payload: string) => ({
  type: types.UPDATE_SALARY_FAILURE,
  payload,
});

export const deleteSalaryRequest = (payload: string) => ({
  type: types.DELETE_SALARY_REQUEST,
  payload,
});

export const deleteSalarySuccess = (payload: string) => ({
  type: types.DELETE_SALARY_SUCCESS,
  payload,
});

export const deleteSalaryFailure = (payload: string) => ({
  type: types.DELETE_SALARY_FAILURE,
  payload,
});
