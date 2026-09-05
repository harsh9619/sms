import type { Teacher } from "../../types";
import * as types from "./actionTypes";

export const fetchTeachersRequest = () => ({
  type: types.FETCH_TEACHERS_REQUEST,
});

export const fetchTeachersSuccess = (payload: Teacher[]) => ({
  type: types.FETCH_TEACHERS_SUCCESS,
  payload,
});

export const fetchTeachersFailure = (payload: string) => ({
  type: types.FETCH_TEACHERS_FAILURE,
  payload,
});
