import { FeesState } from "./types";
import * as types from "./actionTypes";

const initialState: FeesState = {
  fees: [],
  loading: false,
  error: null,
};

export function feesReducer(state: FeesState = initialState, action: any): FeesState {
  switch (action.type) {
    case types.FETCH_FEES_REQUEST:
    case types.CREATE_FEE_REQUEST:
    case types.UPDATE_FEE_REQUEST:
    case types.DELETE_FEE_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_FEES_SUCCESS:
      return { ...state, loading: false, fees: action.payload };

    case types.CREATE_FEE_SUCCESS:
      return { ...state, loading: false, fees: [...state.fees, action.payload] };

    case types.UPDATE_FEE_SUCCESS:
      return {
        ...state,
        loading: false,
        fees: state.fees.map((f) => (f.id === action.payload.id ? action.payload : f)),
      };

    case types.DELETE_FEE_SUCCESS:
      return {
        ...state,
        loading: false,
        fees: state.fees.filter((f) => f.id !== action.payload),
      };

    case types.FETCH_FEES_FAILURE:
    case types.CREATE_FEE_FAILURE:
    case types.UPDATE_FEE_FAILURE:
    case types.DELETE_FEE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
