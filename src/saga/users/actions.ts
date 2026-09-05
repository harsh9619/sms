import type { User } from "../../types";
import * as types from "./actionTypes";

export const fetchUsersRequest = () => ({
  type: types.FETCH_USERS_REQUEST,
});

export const fetchUsersSuccess = (payload: User[]) => ({
  type: types.FETCH_USERS_SUCCESS,
  payload,
});

export const fetchUsersFailure = (payload: string) => ({
  type: types.FETCH_USERS_FAILURE,
  payload,
});

export const fetchAllUsersRequest = () => ({
  type: types.FETCH_ALL_USERS_REQUEST,
});

export const fetchAllUsersSuccess = (payload: User[]) => ({
  type: types.FETCH_ALL_USERS_SUCCESS,
  payload,
});

export const fetchAllUsersFailure = (payload: string) => ({
  type: types.FETCH_ALL_USERS_FAILURE,
  payload,
});

export const createUserRequest = (payload: any) => ({
  type: types.CREATE_USER_REQUEST,
  payload,
});

export const createUserSuccess = (payload: User) => ({
  type: types.CREATE_USER_SUCCESS,
  payload,
});

export const createUserFailure = (payload: string) => ({
  type: types.CREATE_USER_FAILURE,
  payload,
});

export const updateUserRequest = (payload: { id: string; user: any }) => ({
  type: types.UPDATE_USER_REQUEST,
  payload,
});

export const updateUserSuccess = (payload: User) => ({
  type: types.UPDATE_USER_SUCCESS,
  payload,
});

export const updateUserFailure = (payload: string) => ({
  type: types.UPDATE_USER_FAILURE,
  payload,
});

export const deleteUserRequest = (payload: string) => ({
  type: types.DELETE_USER_REQUEST,
  payload,
});

export const deleteUserSuccess = (payload: string) => ({
  type: types.DELETE_USER_SUCCESS,
  payload,
});

export const deleteUserFailure = (payload: string) => ({
  type: types.DELETE_USER_FAILURE,
  payload,
});
