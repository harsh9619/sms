import { call, put, takeLatest, select, StrictEffect } from "redux-saga/effects";
import {
  FETCH_SUBJECT_TEACHER_CONFIG_REQUEST,
  FETCH_CONFIG_TEACHERS_REQUEST,
  FETCH_CONFIG_CLASSES_REQUEST,
  ASSIGN_SUBJECT_TEACHER_REQUEST,
} from "./actionTypes";
import {
  fetchSubjectTeacherConfigSuccess,
  fetchSubjectTeacherConfigFailure,
  fetchConfigTeachersSuccess,
  fetchConfigTeachersFailure,
  fetchConfigClassesSuccess,
  fetchConfigClassesFailure,
  assignSubjectTeacherSuccess,
  assignSubjectTeacherFailure,
} from "./actions";
import classSubjectService from "../../Services/classSubject.service";
import classService from "../../Services/class.service";
import httpService from "../../Services/http.service";
import { AssignSubjectTeacherPayload, ConfigTeacher, FetchSubjectTeacherConfigParams } from "./types";
import { AppState } from "../rootReducer";

function* handleFetchSubjectTeacherConfig(action: {
  type: string;
  payload?: FetchSubjectTeacherConfigParams;
}): Generator<StrictEffect, void, any> {
  try {
    const response = yield call(classSubjectService.getSubjectsWithTeachers, action.payload);
    yield put(fetchSubjectTeacherConfigSuccess(response));
  } catch (error: any) {
    yield put(fetchSubjectTeacherConfigFailure(error.message || "Failed to fetch subject-teacher configurations"));
  }
}

function* handleFetchConfigTeachers(): Generator<StrictEffect, void, any> {
  try {
    const data = yield call([httpService, httpService.get], "/api/teachers");
    yield put(fetchConfigTeachersSuccess(data || []));
  } catch (error: any) {
    yield put(fetchConfigTeachersFailure(error.message || "Failed to fetch teachers list"));
  }
}

function* handleFetchConfigClasses(): Generator<StrictEffect, void, any> {
  try {
    const data = yield call(classService.getClasses);
    yield put(fetchConfigClassesSuccess(data || []));
  } catch (error: any) {
    yield put(fetchConfigClassesFailure(error.message || "Failed to fetch classes"));
  }
}

function* handleAssignSubjectTeacher(action: {
  type: string;
  payload: AssignSubjectTeacherPayload;
}): Generator<StrictEffect, void, any> {
  const { classSubjectId, teacherId } = action.payload;
  try {
    yield call(classSubjectService.assignSubjectTeacher, classSubjectId, teacherId);

    // Get current teachers list from state to find teacherName
    const state: AppState = yield select();
    const teachersList: ConfigTeacher[] = state.subjectTeacherConfig?.teachers || [];
    const assignedTeacher = teachersList.find((t) => String(t.id) === String(teacherId));

    yield put(
      assignSubjectTeacherSuccess({
        classSubjectId,
        teacherId,
        teacherName: assignedTeacher?.name,
      })
    );
  } catch (error: any) {
    yield put(assignSubjectTeacherFailure(error.message || "Failed to update teacher assignment"));
  }
}

export function* subjectTeacherConfigSaga() {
  yield takeLatest(FETCH_SUBJECT_TEACHER_CONFIG_REQUEST, handleFetchSubjectTeacherConfig);
  yield takeLatest(FETCH_CONFIG_TEACHERS_REQUEST, handleFetchConfigTeachers);
  yield takeLatest(FETCH_CONFIG_CLASSES_REQUEST, handleFetchConfigClasses);
  yield takeLatest(ASSIGN_SUBJECT_TEACHER_REQUEST, handleAssignSubjectTeacher);
}

export default subjectTeacherConfigSaga;
