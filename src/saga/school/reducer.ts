import { SchoolState } from "./types";
import * as types from "./actionTypes";

const initialState: SchoolState = {
  schools: [],
  activeSchool: null,
  loading: false,
  error: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
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

    case types.CREATE_SCHOOL_REQUEST:
      return { ...state, creating: true, createError: null };

    case types.CREATE_SCHOOL_SUCCESS:
      return { ...state, creating: false, schools: [...state.schools, action.payload] };

    case types.CREATE_SCHOOL_FAILURE:
      return { ...state, creating: false, createError: action.payload };

    case types.UPDATE_SCHOOL_REQUEST:
      return { ...state, updating: true, updateError: null };

    case types.UPDATE_SCHOOL_SUCCESS:
      return {
        ...state,
        updating: false,
        schools: state.schools.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
        activeSchool:
          state.activeSchool?.id === action.payload.id
            ? { ...state.activeSchool, ...action.payload }
            : state.activeSchool,
      };

    case types.UPDATE_SCHOOL_FAILURE:
      return { ...state, updating: false, updateError: action.payload };

    default:
      return state;
  }
}

