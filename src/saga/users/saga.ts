import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import {
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
  createUserSuccess,
  createUserFailure,
  updateUserSuccess,
  updateUserFailure,
  deleteUserSuccess,
  deleteUserFailure,
} from "./actions";
import userService from "../../Services/user.service";
import type { User } from "../../types";

function* handleFetchUsers(): Generator<any, void, any> {
  try {
    const users: User[] = yield call(userService.getUsers);
    yield put(fetchUsersSuccess(users));
  } catch (error: any) {
    yield put(fetchUsersFailure(error.message || "Failed to fetch users"));
  }
}

function* handleFetchAllUsers(): Generator<any, void, any> {
  try {
    const users: User[] = yield call(userService.getAllUsers);
    yield put(fetchAllUsersSuccess(users));
  } catch (error: any) {
    yield put(fetchAllUsersFailure(error.message || "Failed to fetch all users"));
  }
}

function* handleCreateUser(action: { type: string; payload: any }): Generator<any, void, any> {
  try {
    const user: User = yield call(userService.createUser, action.payload);
    yield put(createUserSuccess(user));
  } catch (error: any) {
    yield put(createUserFailure(error.message || "Failed to create user"));
  }
}

function* handleUpdateUser(action: { type: string; payload: { id: string; user: any } }): Generator<any, void, any> {
  try {
    const user: User = yield call(userService.updateUser, action.payload.id, action.payload.user);
    yield put(updateUserSuccess(user));
  } catch (error: any) {
    yield put(updateUserFailure(error.message || "Failed to update user"));
  }
}

function* handleDeleteUser(action: { type: string; payload: string }): Generator<any, void, any> {
  try {
    yield call(userService.deleteUser, action.payload);
    yield put(deleteUserSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteUserFailure(error.message || "Failed to delete user"));
  }
}

export function* usersSaga() {
  yield takeLatest(types.FETCH_USERS_REQUEST, handleFetchUsers);
  yield takeLatest(types.FETCH_ALL_USERS_REQUEST, handleFetchAllUsers);
  yield takeLatest(types.CREATE_USER_REQUEST, handleCreateUser);
  yield takeLatest(types.UPDATE_USER_REQUEST, handleUpdateUser);
  yield takeLatest(types.DELETE_USER_REQUEST, handleDeleteUser);
}
