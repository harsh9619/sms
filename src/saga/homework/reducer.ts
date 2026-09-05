import { HomeworkState } from "./types";
import * as types from "./actionTypes";

const initialState: HomeworkState = {
  homework: [],
  loading: false,
  error: null,
};

export function homeworkReducer(state: HomeworkState = initialState, action: any): HomeworkState {
  switch (action.type) {
    case types.FETCH_HOMEWORK_REQUEST:
    case types.CREATE_HOMEWORK_REQUEST:
    case types.UPDATE_HOMEWORK_REQUEST:
    case types.DELETE_HOMEWORK_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_HOMEWORK_SUCCESS:
      return { ...state, loading: false, homework: action.payload };

    case types.CREATE_HOMEWORK_SUCCESS:
      return { ...state, loading: false, homework: [...state.homework, action.payload] };

    case types.UPDATE_HOMEWORK_SUCCESS:
      return {
        ...state,
        loading: false,
        homework: state.homework.map((h) => (h.id === action.payload.id ? action.payload : h)),
      };

    case types.DELETE_HOMEWORK_SUCCESS:
      return {
        ...state,
        loading: false,
        homework: state.homework.filter((h) => h.id !== action.payload),
      };

    case types.FETCH_HOMEWORK_FAILURE:
    case types.CREATE_HOMEWORK_FAILURE:
    case types.UPDATE_HOMEWORK_FAILURE:
    case types.DELETE_HOMEWORK_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
