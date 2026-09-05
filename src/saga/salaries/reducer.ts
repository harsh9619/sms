import { SalariesState } from "./types";
import * as types from "./actionTypes";

const initialState: SalariesState = {
  salaries: [],
  loading: false,
  error: null,
};

export function salariesReducer(state: SalariesState = initialState, action: any): SalariesState {
  switch (action.type) {
    case types.FETCH_SALARIES_REQUEST:
    case types.CREATE_SALARY_REQUEST:
    case types.UPDATE_SALARY_REQUEST:
    case types.DELETE_SALARY_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_SALARIES_SUCCESS:
      return { ...state, loading: false, salaries: action.payload };

    case types.CREATE_SALARY_SUCCESS:
      return { ...state, loading: false, salaries: [...state.salaries, action.payload] };

    case types.UPDATE_SALARY_SUCCESS:
      return {
        ...state,
        loading: false,
        salaries: state.salaries.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };

    case types.DELETE_SALARY_SUCCESS:
      return {
        ...state,
        loading: false,
        salaries: state.salaries.filter((s) => s.id !== action.payload),
      };

    case types.FETCH_SALARIES_FAILURE:
    case types.CREATE_SALARY_FAILURE:
    case types.UPDATE_SALARY_FAILURE:
    case types.DELETE_SALARY_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
