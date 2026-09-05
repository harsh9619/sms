import { SchoolState } from "./types";
import * as types from "./actionTypes";

const initialState: SchoolState = {
  schools: [],
  activeSchool: null,
  loading: false,
  error: null,
};

export function schoolReducer(state: SchoolState = initialState, action: any): SchoolState {
  switch (action.type) {
    case types.FETCH_SCHOOLS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_SCHOOLS_SUCCESS:
      return { ...state, loading: false, schools: action.payload };

    case types.FETCH_SCHOOLS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.SET_ACTIVE_SCHOOL:
      if (action.payload) {
        localStorage.setItem("sms_active_school_id", action.payload.id);
        window.dispatchEvent(new Event("sms_active_school_changed"));
      } else {
        localStorage.removeItem("sms_active_school_id");
        window.dispatchEvent(new Event("sms_active_school_changed"));
      }
      return { ...state, activeSchool: action.payload };

    default:
      return state;
  }
}
