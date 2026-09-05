import { MarksState } from "./types";
import * as types from "./actionTypes";

const initialState: MarksState = {
  marks: [],
  loading: false,
  error: null,
};

export function marksReducer(state: MarksState = initialState, action: any): MarksState {
  switch (action.type) {
    case types.FETCH_MARKS_REQUEST:
    case types.CREATE_MARKS_REQUEST:
    case types.UPDATE_MARKS_REQUEST:
    case types.DELETE_MARKS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_MARKS_SUCCESS:
      return { ...state, loading: false, marks: action.payload };

    case types.CREATE_MARKS_SUCCESS:
      return { ...state, loading: false, marks: [...state.marks, action.payload] };

    case types.UPDATE_MARKS_SUCCESS:
      return {
        ...state,
        loading: false,
        marks: state.marks.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };

    case types.DELETE_MARKS_SUCCESS:
      return {
        ...state,
        loading: false,
        marks: state.marks.filter((m) => m.id !== action.payload),
      };

    case types.FETCH_MARKS_FAILURE:
    case types.CREATE_MARKS_FAILURE:
    case types.UPDATE_MARKS_FAILURE:
    case types.DELETE_MARKS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
