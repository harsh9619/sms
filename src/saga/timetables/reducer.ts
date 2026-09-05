import { TimetablesState } from "./types";
import * as types from "./actionTypes";

const initialState: TimetablesState = {
  timetables: [],
  loading: false,
  error: null,
};

export function timetablesReducer(state: TimetablesState = initialState, action: any): TimetablesState {
  switch (action.type) {
    case types.FETCH_TIMETABLES_REQUEST:
    case types.CREATE_TIMETABLE_REQUEST:
    case types.UPDATE_TIMETABLE_REQUEST:
    case types.DELETE_TIMETABLE_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_TIMETABLES_SUCCESS:
      return { ...state, loading: false, timetables: action.payload };

    case types.CREATE_TIMETABLE_SUCCESS:
      return { ...state, loading: false, timetables: [...state.timetables, action.payload] };

    case types.UPDATE_TIMETABLE_SUCCESS:
      return {
        ...state,
        loading: false,
        timetables: state.timetables.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };

    case types.DELETE_TIMETABLE_SUCCESS:
      return {
        ...state,
        loading: false,
        timetables: state.timetables.filter((t) => t.id !== action.payload),
      };

    case types.FETCH_TIMETABLES_FAILURE:
    case types.CREATE_TIMETABLE_FAILURE:
    case types.UPDATE_TIMETABLE_FAILURE:
    case types.DELETE_TIMETABLE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
