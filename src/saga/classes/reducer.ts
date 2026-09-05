import { ClassesState } from "./types";
import * as types from "./actionTypes";

const initialState: ClassesState = {
  classes: [],
  loading: false,
  error: null,
};

export function classesReducer(state: ClassesState = initialState, action: any): ClassesState {
  switch (action.type) {
    case types.FETCH_CLASSES_REQUEST:
    case types.CREATE_CLASS_REQUEST:
    case types.UPDATE_CLASS_REQUEST:
    case types.DELETE_CLASS_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_CLASSES_SUCCESS:
      return { ...state, loading: false, classes: action.payload };

    case types.CREATE_CLASS_SUCCESS:
      return { ...state, loading: false, classes: [...state.classes, action.payload] };

    case types.UPDATE_CLASS_SUCCESS:
      return {
        ...state,
        loading: false,
        classes: state.classes.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };

    case types.DELETE_CLASS_SUCCESS:
      return {
        ...state,
        loading: false,
        classes: state.classes.filter((c) => c.id !== action.payload),
      };

    case types.FETCH_CLASSES_FAILURE:
    case types.CREATE_CLASS_FAILURE:
    case types.UPDATE_CLASS_FAILURE:
    case types.DELETE_CLASS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
