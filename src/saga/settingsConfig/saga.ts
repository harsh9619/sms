import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import schoolService from "../../Services/school.service";
import userService from "../../Services/user.service";

function* fetchSettingsConfigSaga(): Generator<any, void, any> {
  try {
    const [schools, users, masterThemes] = yield Promise.all([
      schoolService.getSchools(),
      userService.getUsers(),
      schoolService.getMasterThemes().catch(() => [
        { id: 1, name: "default", label: "Ocean Blue", color: "#3b82f6", sortOrder: 1 },
        { id: 2, name: "emerald", label: "Emerald", color: "#10b981", sortOrder: 2 },
        { id: 3, name: "purple", label: "Royal Purple", color: "#8b5cf6", sortOrder: 3 },
        { id: 4, name: "rose", label: "Rose", color: "#f43f5e", sortOrder: 4 },
        { id: 5, name: "amber", label: "Sunset Amber", color: "#f97316", sortOrder: 5 },
      ]),
    ]);

    yield put(
      actions.fetchSettingsConfigSuccess({
        schools: Array.isArray(schools) ? schools : [],
        users: Array.isArray(users) ? users : [],
        masterThemes: Array.isArray(masterThemes) ? masterThemes : [],
      })
    );
  } catch (error: any) {
    yield put(
      actions.fetchSettingsConfigFailure(
        error?.message || "Failed to load settings data"
      )
    );
  }
}

function* updateSchoolConfigSaga(action: any): Generator<any, void, any> {
  try {
    const updated = yield call(schoolService.updateSchool, action.payload.id, action.payload);
    yield put(actions.updateSchoolConfigSuccess(updated || action.payload));
  } catch (error: any) {
    yield put(
      actions.updateSchoolConfigFailure(
        error?.message || "Failed to update school settings"
      )
    );
  }
}

function* createUserConfigSaga(action: any): Generator<any, void, any> {
  try {
    const created = yield call(userService.createUser, action.payload);
    yield put(actions.createUserConfigSuccess(created || action.payload));
  } catch (error: any) {
    yield put(
      actions.createUserConfigFailure(
        error?.message || "Failed to create user"
      )
    );
  }
}

function* updateUserConfigSaga(action: any): Generator<any, void, any> {
  try {
    const { id, user } = action.payload;
    const updated = yield call(userService.updateUser, id, user);
    yield put(actions.updateUserConfigSuccess(updated || { id, ...user }));
  } catch (error: any) {
    yield put(
      actions.updateUserConfigFailure(
        error?.message || "Failed to update user"
      )
    );
  }
}

function* deleteUserConfigSaga(action: any): Generator<any, void, any> {
  try {
    yield call(userService.deleteUser, action.payload);
    yield put(actions.deleteUserConfigSuccess(action.payload));
  } catch (error: any) {
    yield put(
      actions.deleteUserConfigFailure(
        error?.message || "Failed to delete user"
      )
    );
  }
}

export function* settingsConfigSaga() {
  yield takeLatest(types.FETCH_SETTINGS_CONFIG_REQUEST, fetchSettingsConfigSaga);
  yield takeLatest(types.UPDATE_SCHOOL_CONFIG_REQUEST, updateSchoolConfigSaga);
  yield takeLatest(types.CREATE_USER_CONFIG_REQUEST, createUserConfigSaga);
  yield takeLatest(types.UPDATE_USER_CONFIG_REQUEST, updateUserConfigSaga);
  yield takeLatest(types.DELETE_USER_CONFIG_REQUEST, deleteUserConfigSaga);
}
