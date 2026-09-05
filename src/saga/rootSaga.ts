import { all, fork } from "redux-saga/effects";
import { authSaga } from "./auth";
import { schoolSaga } from "./school";
import { studentsSaga } from "./students";
import { teachersSaga } from "./teachers";
import { classesSaga } from "./classes";
import { usersSaga } from "./users";
import { feesSaga } from "./fees";
import { salariesSaga } from "./salaries";
import { timetablesSaga } from "./timetables";
import { homeworkSaga } from "./homework";
import { noticesSaga } from "./notices";
import { marksSaga } from "./marks";
import { attendanceSaga } from "./attendance";

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
