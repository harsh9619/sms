import * as types from "./actionTypes";
import { SettingsConfigState } from "./types";

const initialState: SettingsConfigState = {
  schools: [],
  users: [],
  masterThemes: [],
  loading: false,
  updating: false,
  themesLoading: false,
  successMsg: null,
  error: null,
};

export const settingsConfigReducer = (
  state = initialState,
  action: any
): SettingsConfigState => {
  switch (action.type) {
    case types.FETCH_SETTINGS_CONFIG_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.FETCH_SETTINGS_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        schools: action.payload.schools,
        users: action.payload.users,
        masterThemes: action.payload.masterThemes,
        error: null,
      };
    case types.FETCH_SETTINGS_CONFIG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.UPDATE_SCHOOL_CONFIG_REQUEST:
      return {
        ...state,
        updating: true,
        error: null,
      };
    case types.UPDATE_SCHOOL_CONFIG_SUCCESS:
      return {
        ...state,
        updating: false,
        schools: state.schools.map((s) => (String(s.id) === String(action.payload.id) ? action.payload : s)),
        successMsg: "School updated successfully!",
        error: null,
      };
    case types.UPDATE_SCHOOL_CONFIG_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload,
      };

    case types.CREATE_USER_CONFIG_REQUEST:
    case types.UPDATE_USER_CONFIG_REQUEST:
    case types.DELETE_USER_CONFIG_REQUEST:
      return {
        ...state,
        updating: true,
        error: null,
      };

    case types.CREATE_USER_CONFIG_SUCCESS:
      return {
        ...state,
        updating: false,
        users: [action.payload, ...state.users],
        successMsg: "User created successfully!",
        error: null,
      };
    case types.UPDATE_USER_CONFIG_SUCCESS:
      return {
        ...state,
        updating: false,
        users: state.users.map((u) => (String(u.id) === String(action.payload.id) ? action.payload : u)),
        successMsg: "User updated successfully!",
        error: null,
      };
    case types.DELETE_USER_CONFIG_SUCCESS:
      return {
        ...state,
        updating: false,
        users: state.users.filter((u) => String(u.id) !== String(action.payload)),
        successMsg: "User deleted successfully!",
        error: null,
      };

    case types.CREATE_USER_CONFIG_FAILURE:
    case types.UPDATE_USER_CONFIG_FAILURE:
    case types.DELETE_USER_CONFIG_FAILURE:
      return {
        ...state,
        updating: false,
        error: action.payload,
      };

    case types.CLEAR_SETTINGS_CONFIG_MESSAGES:
      return {
        ...state,
        successMsg: null,
        error: null,
      };

    default:
      return state;
  }
};
