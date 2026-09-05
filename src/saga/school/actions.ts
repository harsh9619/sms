import type { School } from "../../context/SchoolContext";
import * as types from "./actionTypes";

export const fetchSchoolsRequest = () => ({
  type: types.FETCH_SCHOOLS_REQUEST,
});

export const fetchSchoolsSuccess = (payload: School[]) => ({
  type: types.FETCH_SCHOOLS_SUCCESS,
  payload,
});

export const fetchSchoolsFailure = (payload: string) => ({
  type: types.FETCH_SCHOOLS_FAILURE,
  payload,
});

export const setActiveSchool = (payload: School | null) => ({
  type: types.SET_ACTIVE_SCHOOL,
  payload,
});

export const createSchoolRequest = (payload: Partial<School> & { name: string; slug: string }) => ({
  type: types.CREATE_SCHOOL_REQUEST,
  payload,
});

export const createSchoolSuccess = (payload: School) => ({
  type: types.CREATE_SCHOOL_SUCCESS,
  payload,
});

export const createSchoolFailure = (payload: string) => ({
  type: types.CREATE_SCHOOL_FAILURE,
  payload,
});

export const updateSchoolRequest = (payload: { id: string } & Partial<School>) => ({
  type: types.UPDATE_SCHOOL_REQUEST,
  payload,
});

export const updateSchoolSuccess = (payload: School) => ({
  type: types.UPDATE_SCHOOL_SUCCESS,
  payload,
});

export const updateSchoolFailure = (payload: string) => ({
  type: types.UPDATE_SCHOOL_FAILURE,
  payload,
});
