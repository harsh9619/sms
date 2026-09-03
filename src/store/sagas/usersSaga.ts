import { call, put, takeLatest } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
  createUserRequest,
  createUserSuccess,
  createUserFailure,
  updateUserRequest,
  updateUserSuccess,
  updateUserFailure,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
} from "../slices/usersSlice";
import { fetchUsers, fetchAllUsers, createUser, updateUser, deleteUser } from "../../lib/api";
import type { User } from "../../types";

function* handleFetchUsers(): Generator<any, void, any> {
  try {
    const users: User[] = yield call(fetchUsers);
    yield put(fetchUsersSuccess(users));
  } catch (error: any) {
    yield put(fetchUsersFailure(error.message || "Failed to fetch users"));
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

function* handleCreateUser(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const user: User = yield call(createUser, action.payload);
    yield put(createUserSuccess(user));
  } catch (error: any) {
    yield put(createUserFailure(error.message || "Failed to create user"));
  }
}

function* handleUpdateUser(action: PayloadAction<{ id: string; user: any }>): Generator<any, void, any> {
  try {
    const user: User = yield call(updateUser, action.payload.id, action.payload.user);
    yield put(updateUserSuccess(user));
  } catch (error: any) {
    yield put(updateUserFailure(error.message || "Failed to update user"));
  }
}

function* handleDeleteUser(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    yield call(deleteUser, action.payload);
    yield put(deleteUserSuccess(action.payload));
  } catch (error: any) {
    yield put(deleteUserFailure(error.message || "Failed to delete user"));
  }
}

export function* usersSaga() {
  yield takeLatest(fetchUsersRequest.type, handleFetchUsers);
  yield takeLatest(fetchAllUsersRequest.type, handleFetchAllUsers);
  yield takeLatest(createUserRequest.type, handleCreateUser);
  yield takeLatest(updateUserRequest.type, handleUpdateUser);
  yield takeLatest(deleteUserRequest.type, handleDeleteUser);
}
