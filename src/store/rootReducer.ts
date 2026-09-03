import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import schoolReducer from "./slices/schoolSlice";
import studentsReducer from "./slices/studentsSlice";
import teachersReducer from "./slices/teachersSlice";
import classesReducer from "./slices/classesSlice";
import usersReducer from "./slices/usersSlice";
import feesReducer from "./slices/feesSlice";
import salariesReducer from "./slices/salariesSlice";
import timetablesReducer from "./slices/timetablesSlice";
import homeworkReducer from "./slices/homeworkSlice";
import noticesReducer from "./slices/noticesSlice";
import marksReducer from "./slices/marksSlice";
import attendanceReducer from "./slices/attendanceSlice";

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
