import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  loginSuccess,
  loginFailure,
  fetchCurrentUserSuccess,
  fetchCurrentUserFailure,
  fetchAuthAllUsersSuccess,
  fetchAuthAllUsersFailure,
} from "./actions";
import authService, { LoginResponse } from "../../Services/auth.service";
import type { User } from "../../types";

function* handleLogin(action: { type: string; payload: { email: string; password: string } }): Generator<any, void, any> {
  try {
    const response: LoginResponse = yield call(authService.login, action.payload.email, action.payload.password);
    yield put(loginSuccess({ user: response.user, token: response.token }));
  } catch (error: any) {
    yield put(loginFailure(error.message || "Invalid email or password"));
  }
}

function* handleFetchCurrentUser(): Generator<any, void, any> {
  try {
    const user: User = yield call(authService.getCurrentUser);
    yield put(fetchCurrentUserSuccess(user));
  } catch (error: any) {
    yield put(fetchCurrentUserFailure(error.message || "Failed to fetch current user"));
  }
}

function* handleFetchAuthAllUsers(): Generator<any, void, any> {
  try {
    const users: User[] = yield call(authService.getAllUsers);
    yield put(fetchAuthAllUsersSuccess(users));
  } catch (error: any) {
    yield put(fetchAuthAllUsersFailure(error.message || "Failed to fetch all users"));
  }
}

export function* authSaga() {
  yield takeLatest(types.LOGIN_REQUEST, handleLogin);
  yield takeLatest(types.FETCH_CURRENT_USER_REQUEST, handleFetchCurrentUser);
  yield takeLatest(types.FETCH_AUTH_ALL_USERS_REQUEST, handleFetchAuthAllUsers);
}
