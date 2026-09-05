import { AuthState } from "./types";
import * as types from "./actionTypes";

const initialUserStr = localStorage.getItem("sms_user");
const initialToken = localStorage.getItem("sms_token");
const initialSimulatedRole = (localStorage.getItem("sms_simulated_role") as any) || null;

const initialState: AuthState = {
  user: initialUserStr ? JSON.parse(initialUserStr) : null,
  token: initialToken,
  simulatedRole: initialSimulatedRole,
  allUsers: [],
  loading: false,
  error: null,
};

export function authReducer(state: AuthState = initialState, action: any): AuthState {
  switch (action.type) {
    case types.LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case types.LOGIN_SUCCESS:
      localStorage.setItem("sms_user", JSON.stringify(action.payload.user));
      localStorage.setItem("sms_token", action.payload.token);
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };

    case types.LOGIN_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.FETCH_CURRENT_USER_REQUEST:
      return { ...state, loading: true };

    case types.FETCH_CURRENT_USER_SUCCESS:
      localStorage.setItem("sms_user", JSON.stringify(action.payload));
      return { ...state, loading: false, user: action.payload };

    case types.FETCH_CURRENT_USER_FAILURE:
      localStorage.removeItem("sms_user");
      localStorage.removeItem("sms_token");
      return { ...state, loading: false, user: null, token: null, error: action.payload };

    case types.FETCH_AUTH_ALL_USERS_REQUEST:
      return { ...state, loading: true };

    case types.FETCH_AUTH_ALL_USERS_SUCCESS:
      return { ...state, loading: false, allUsers: action.payload };

    case types.FETCH_AUTH_ALL_USERS_FAILURE:
      return { ...state, loading: false, error: action.payload };


    case types.SET_SIMULATED_ROLE:
      if (action.payload) {
        localStorage.setItem("sms_simulated_role", action.payload);
      } else {
        localStorage.removeItem("sms_simulated_role");
      }
      return { ...state, simulatedRole: action.payload };

    case types.LOGOUT:
      localStorage.removeItem("sms_user");
      localStorage.removeItem("sms_token");
      localStorage.removeItem("sms_simulated_role");
      localStorage.removeItem("sms_active_school_id");
      return {
        ...state,
        user: null,
        token: null,
        simulatedRole: null,
        error: null,
      };

    default:
      return state;
  }
}
