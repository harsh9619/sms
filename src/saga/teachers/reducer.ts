import { TeachersState } from "./types";
import * as types from "./actionTypes";

const initialState: TeachersState = {
  teachers: [],
  loading: false,
  error: null,
};

export function teachersReducer(state: TeachersState = initialState, action: any): TeachersState {
  switch (action.type) {
    case types.FETCH_TEACHERS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_TEACHERS_SUCCESS:
      return { ...state, loading: false, teachers: action.payload };

    case types.FETCH_TEACHERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
