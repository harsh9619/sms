import { NoticesState } from "./types";
import * as types from "./actionTypes";

const initialState: NoticesState = {
  notices: [],
  loading: false,
  error: null,
};

export function noticesReducer(state: NoticesState = initialState, action: any): NoticesState {
  switch (action.type) {
    case types.FETCH_NOTICES_REQUEST:
    case types.CREATE_NOTICE_REQUEST:
    case types.UPDATE_NOTICE_REQUEST:
    case types.DELETE_NOTICE_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_NOTICES_SUCCESS:
      return { ...state, loading: false, notices: action.payload };

    case types.CREATE_NOTICE_SUCCESS:
      return { ...state, loading: false, notices: [...state.notices, action.payload] };

    case types.UPDATE_NOTICE_SUCCESS:
      return {
        ...state,
        loading: false,
        notices: state.notices.map((n) => (n.id === action.payload.id ? action.payload : n)),
      };

    case types.DELETE_NOTICE_SUCCESS:
      return {
        ...state,
        loading: false,
        notices: state.notices.filter((n) => n.id !== action.payload),
      };

    case types.FETCH_NOTICES_FAILURE:
    case types.CREATE_NOTICE_FAILURE:
    case types.UPDATE_NOTICE_FAILURE:
    case types.DELETE_NOTICE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
