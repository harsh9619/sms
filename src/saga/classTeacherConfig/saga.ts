import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import classService from "../../Services/class.service";
import httpService from "../../Services/http.service";

function* fetchClassTeacherConfigSaga(): Generator<any, void, any> {
  try {
    const [classTeachers, classesList, teachers] = yield Promise.all([
      classService.getClassTeachers(),
      classService.getClasses(),
      httpService.get("/api/teachers").catch(() => []),
    ]);

    yield put(
      actions.fetchClassTeacherConfigSuccess({
        classTeachers: Array.isArray(classTeachers) ? classTeachers : [],
        classesList: Array.isArray(classesList) ? classesList : [],
        teachers: Array.isArray(teachers) ? teachers : [],
      })
    );
  } catch (error: any) {
    yield put(
      actions.fetchClassTeacherConfigFailure(
        error?.message || "Failed to load class teacher configuration data"
      )
    );
  }
}

function* assignClassTeacherSaga(action: any): Generator<any, void, any> {
  try {
    const { id, teacherId } = action.payload;
    const res = yield call(classService.updateClassTeacher, String(id), {
      teacherId: teacherId || null,
    });

    yield put(
      actions.assignClassTeacherSuccess({
        id,
        teacherId,
        teacherName: res?.teacherName,
      })
    );
  } catch (error: any) {
    yield put(
      actions.assignClassTeacherFailure(
        error?.message || "Failed to assign class teacher"
      )
    );
    // Refresh to sync state on failure
    yield put(actions.fetchClassTeacherConfigRequest());
  }
}

export function* classTeacherConfigSaga() {
  yield takeLatest(
    types.FETCH_CLASS_TEACHER_CONFIG_REQUEST,
    fetchClassTeacherConfigSaga
  );
  yield takeLatest(
    types.ASSIGN_CLASS_TEACHER_REQUEST,
    assignClassTeacherSaga
  );
}
