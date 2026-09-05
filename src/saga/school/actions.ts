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
