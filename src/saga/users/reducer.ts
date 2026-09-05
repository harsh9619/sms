import { UsersState } from "./types";
import * as types from "./actionTypes";

const initialState: UsersState = {
  users: [],
  allUsers: [],
  loading: false,
  error: null,
};

export function usersReducer(state: UsersState = initialState, action: any): UsersState {
  switch (action.type) {
    case types.FETCH_USERS_REQUEST:
    case types.FETCH_ALL_USERS_REQUEST:
    case types.CREATE_USER_REQUEST:
    case types.UPDATE_USER_REQUEST:
    case types.DELETE_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_USERS_SUCCESS:
      return { ...state, loading: false, users: action.payload };

    case types.FETCH_ALL_USERS_SUCCESS:
      return { ...state, loading: false, allUsers: action.payload };

    case types.CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: [...state.users, action.payload],
        allUsers: [...state.allUsers, action.payload],
      };

    case types.UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.map((u) => (u.id === action.payload.id ? action.payload : u)),
        allUsers: state.allUsers.map((u) => (u.id === action.payload.id ? action.payload : u)),
      };

    case types.DELETE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((u) => u.id !== action.payload),
        allUsers: state.allUsers.filter((u) => u.id !== action.payload),
      };

    case types.FETCH_USERS_FAILURE:
    case types.FETCH_ALL_USERS_FAILURE:
    case types.CREATE_USER_FAILURE:
    case types.UPDATE_USER_FAILURE:
    case types.DELETE_USER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
