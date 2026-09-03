import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  fetchCurrentUserRequest,
  fetchCurrentUserSuccess,
  fetchCurrentUserFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
} from "../slices/authSlice";
import { loginUser, fetchCurrentUser, fetchAllUsers, LoginResponse } from "../../lib/api";
import type { User } from "../../types";

function* handleLogin(action: PayloadAction<{ email: string; password: string }>): Generator<any, void, any> {
  try {
    const response: LoginResponse = yield call(loginUser, action.payload.email, action.payload.password);
    yield put(loginSuccess({ user: response.user, token: response.token }));
  } catch (error: any) {
    yield put(loginFailure(error.message || "Invalid email or password"));
  }
}

function* handleFetchCurrentUser(): Generator<any, void, any> {
  try {
    const user: User = yield call(fetchCurrentUser);
    yield put(fetchCurrentUserSuccess(user));
  } catch (error: any) {
    yield put(fetchCurrentUserFailure(error.message || "Failed to fetch current user"));
  }
}

function* handleFetchAllUsers(): Generator<any, void, any> {
  try {
    const users: User[] = yield call(fetchAllUsers);
    yield put(fetchAllUsersSuccess(users));
  } catch (error: any) {
    yield put(fetchAllUsersFailure(error.message || "Failed to fetch all users"));
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(fetchCurrentUserRequest.type, handleFetchCurrentUser);
  yield takeLatest(fetchAllUsersRequest.type, handleFetchAllUsers);
}
