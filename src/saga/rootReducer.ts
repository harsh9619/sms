import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "./auth";
import { schoolReducer } from "./school";
import { studentsReducer } from "./students";
import { teachersReducer } from "./teachers";
import { classesReducer } from "./classes";
import { usersReducer } from "./users";
import { feesReducer } from "./fees";
import { salariesReducer } from "./salaries";
import { timetablesReducer } from "./timetables";
import { homeworkReducer } from "./homework";
import { noticesReducer } from "./notices";
import { marksReducer } from "./marks";
import { attendanceReducer } from "./attendance";

export const rootReducer = combineReducers({
  auth: authReducer,
  school: schoolReducer,
  students: studentsReducer,
  teachers: teachersReducer,
  classes: classesReducer,
  users: usersReducer,
  fees: feesReducer,
  salaries: salariesReducer,
  timetables: timetablesReducer,
  homework: homeworkReducer,
  notices: noticesReducer,
  marks: marksReducer,
  attendance: attendanceReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppState = RootState;
