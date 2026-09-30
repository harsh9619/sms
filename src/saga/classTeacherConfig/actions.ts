import * as types from "./actionTypes";
import { ClassTeacherConfigItem } from "./types";

export const fetchClassTeacherConfigRequest = () => ({
  type: types.FETCH_CLASS_TEACHER_CONFIG_REQUEST,
});

export const fetchClassTeacherConfigSuccess = (data: {
  classTeachers: ClassTeacherConfigItem[];
  classesList: any[];
  teachers: any[];
}) => ({
  type: types.FETCH_CLASS_TEACHER_CONFIG_SUCCESS,
  payload: data,
});

export const fetchClassTeacherConfigFailure = (error: string) => ({
  type: types.FETCH_CLASS_TEACHER_CONFIG_FAILURE,
  payload: error,
});

export const assignClassTeacherRequest = (payload: {
  id: string | number;
  teacherId: string | number | null;
}) => ({
  type: types.ASSIGN_CLASS_TEACHER_REQUEST,
  payload,
});

export const assignClassTeacherSuccess = (data: {
  id: string | number;
  teacherId: string | number | null;
  teacherName?: string | null;
}) => ({
  type: types.ASSIGN_CLASS_TEACHER_SUCCESS,
  payload: data,
});

export const assignClassTeacherFailure = (error: string) => ({
  type: types.ASSIGN_CLASS_TEACHER_FAILURE,
  payload: error,
});

export const clearClassTeacherConfigMessages = () => ({
  type: types.CLEAR_CLASS_TEACHER_CONFIG_MESSAGES,
});
