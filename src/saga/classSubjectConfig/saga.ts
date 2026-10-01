import { call, put, takeLatest } from "redux-saga/effects";
import * as types from "./actionTypes";
import * as actions from "./actions";
import classService from "../../Services/class.service";
import classSubjectService from "../../Services/classSubject.service";

function* fetchClassSubjectConfigSaga(): Generator<any, void, any> {
  try {
    const [classes, masters, divs, subjects, assigned] = yield Promise.all([
      classService.getClasses(),
      classService.getClassMasters(),
      classService.getDivMasters(),
      classSubjectService.getSubjectMasters().catch(() => []),
      classSubjectService.getSubjects().catch(() => []),
    ]);

    yield put(
      actions.fetchClassSubjectConfigSuccess({
        classesList: Array.isArray(classes) ? classes : [],
        classMasters: Array.isArray(masters) ? masters : [],
        divMasters: Array.isArray(divs) ? divs.map((d: any) => d.name) : [],
        masterSubjects: Array.isArray(subjects) ? subjects : [],
        allAssignedSubjects: Array.isArray(assigned) ? assigned : [],
      })
    );
  } catch (error: any) {
    yield put(
      actions.fetchClassSubjectConfigFailure(
        error?.message || "Failed to load class & subject configuration"
      )
    );
  }
}

function* syncClassSubjectsSaga(action: any): Generator<any, void, any> {
  try {
    const { classIds, masterSubjectNumbers } = action.payload;
    yield Promise.all(
      classIds.map((classId: string) =>
        classSubjectService.syncClassSubjects(classId, masterSubjectNumbers)
      )
    );
    yield put(actions.syncClassSubjectsSuccess());
    yield put(actions.fetchClassSubjectConfigRequest());
  } catch (error: any) {
    yield put(
      actions.syncClassSubjectsFailure(
        error?.message || "Failed to save class subject configuration"
      )
    );
  }
}

function* batchCreateClassesSaga(action: any): Generator<any, void, any> {
  try {
    const payload = action.payload;
    const classesPayload = Array.isArray(payload) ? payload : (payload?.classes || []);
    const masterSubjectNumbers: number[] = Array.isArray(payload) ? [] : (payload?.masterSubjectNumbers || []);

    const createdClasses = yield call(classService.createClassesBatch, classesPayload);

    if (
      Array.isArray(masterSubjectNumbers) &&
      masterSubjectNumbers.length > 0
    ) {
      let createdClassIds: string[] = [];
      if (Array.isArray(createdClasses) && createdClasses.length > 0) {
        createdClassIds = createdClasses
          .map((c: any) => c?.id || c?.schoolClassId || c?.classId || c?.class_id)
          .filter(Boolean)
          .map(String);
      }

      if (createdClassIds.length === 0) {
        const latestClasses = yield call(classService.getClasses);
        if (Array.isArray(latestClasses)) {
          const payloadKeys = new Set(
            classesPayload.map((cp: any) => `${cp.name.trim()}_${(cp.section || "").trim().toUpperCase()}`)
          );
          createdClassIds = latestClasses
            .filter((c: any) => {
              const sec = c.section || c.division || "";
              const key = `${c.name.trim()}_${sec.trim().toUpperCase()}`;
              return payloadKeys.has(key);
            })
            .map((c: any) => String(c.id || c.schoolClassId))
            .filter(Boolean);
        }
      }

      if (createdClassIds.length > 0) {
        yield Promise.all(
          createdClassIds.map((classId: string) =>
            classSubjectService.syncClassSubjects(classId, masterSubjectNumbers)
          )
        );
      }
    }

    yield put(actions.batchCreateClassesSuccess());
    yield put(actions.fetchClassSubjectConfigRequest());
  } catch (error: any) {
    yield put(
      actions.batchCreateClassesFailure(
        error?.message || "Failed to create classes"
      )
    );
  }
}

function* deleteClassGroupSaga(action: any): Generator<any, void, any> {
  try {
    const classIds: string[] = action.payload;
    yield Promise.all(
      classIds.map((id) =>
        classService.deleteClass(id).catch((err: any) => {
          if (err?.response?.status === 404 || err?.status === 404) {
            return null;
          }
          throw err;
        })
      )
    );
    yield put(actions.deleteClassGroupSuccess());
    yield put(actions.fetchClassSubjectConfigRequest());
  } catch (error: any) {
    yield put(
      actions.deleteClassGroupFailure(
        error?.message || "Failed to remove class"
      )
    );
  }
}

export function* classSubjectConfigSaga() {
  yield takeLatest(
    types.FETCH_CLASS_SUBJECT_CONFIG_REQUEST,
    fetchClassSubjectConfigSaga
  );
  yield takeLatest(
    types.SYNC_CLASS_SUBJECTS_REQUEST,
    syncClassSubjectsSaga
  );
  yield takeLatest(
    types.BATCH_CREATE_CLASSES_REQUEST,
    batchCreateClassesSaga
  );
  yield takeLatest(
    types.DELETE_CLASS_GROUP_REQUEST,
    deleteClassGroupSaga
  );
}
