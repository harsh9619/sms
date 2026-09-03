import { all, fork } from "redux-saga/effects";
import { authSaga } from "./sagas/authSaga";
import { schoolSaga } from "./sagas/schoolSaga";
import { studentsSaga } from "./sagas/studentsSaga";
import { teachersSaga } from "./sagas/teachersSaga";
import { classesSaga } from "./sagas/classesSaga";
import { usersSaga } from "./sagas/usersSaga";
import { feesSaga } from "./sagas/feesSaga";
import { salariesSaga } from "./sagas/salariesSaga";
import { timetablesSaga } from "./sagas/timetablesSaga";
import { homeworkSaga } from "./sagas/homeworkSaga";
import { noticesSaga } from "./sagas/noticesSaga";
import { marksSaga } from "./sagas/marksSaga";
import { attendanceSaga } from "./sagas/attendanceSaga";

export function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(schoolSaga),
    fork(studentsSaga),
    fork(teachersSaga),
    fork(classesSaga),
    fork(usersSaga),
    fork(feesSaga),
    fork(salariesSaga),
    fork(timetablesSaga),
    fork(homeworkSaga),
    fork(noticesSaga),
    fork(marksSaga),
    fork(attendanceSaga),
  ]);
}
