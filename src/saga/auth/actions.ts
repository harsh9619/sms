import type { User, UserRole } from "../../types";
import * as types from "./actionTypes";

export const loginRequest = (payload: { email?: string; phone?: string; user_name?: string; username?: string; identifier?: string; loginType?: "email" | "mobile" | "username"; password: string }) => ({
  type: types.LOGIN_REQUEST,
  payload,
});

export const loginSuccess = (payload: { user: User; token: string }) => ({
  type: types.LOGIN_SUCCESS,
  payload,
});

export const loginFailure = (payload: string) => ({
  type: types.LOGIN_FAILURE,
  payload,
});

export const fetchCurrentUserRequest = () => ({
  type: types.FETCH_CURRENT_USER_REQUEST,
});

export const fetchCurrentUserSuccess = (payload: User) => ({
  type: types.FETCH_CURRENT_USER_SUCCESS,
  payload,
});

export const fetchCurrentUserFailure = (payload: string) => ({
  type: types.FETCH_CURRENT_USER_FAILURE,
  payload,
});

export const fetchAuthAllUsersRequest = (payload?: string | { schoolId?: string }) => ({
  type: types.FETCH_AUTH_ALL_USERS_REQUEST,
  payload,
});

export const fetchAuthAllUsersSuccess = (payload: User[]) => ({
  type: types.FETCH_AUTH_ALL_USERS_SUCCESS,
  payload,
});

export const fetchAuthAllUsersFailure = (payload: string) => ({
  type: types.FETCH_AUTH_ALL_USERS_FAILURE,
  payload,
});


export const setSimulatedRole = (payload: UserRole | null) => ({
  type: types.SET_SIMULATED_ROLE,
  payload,
});

export const logout = () => ({
  type: types.LOGOUT,
});
