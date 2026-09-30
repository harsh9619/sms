import * as types from "./actionTypes";
import {
  AssignSubjectTeacherPayload,
  AssignSubjectTeacherSuccessPayload,
  ConfigTeacher,
  FetchSubjectTeacherConfigParams,
  PaginationMeta,
} from "./types";
import { SubjectItem } from "../../Services/classSubject.service";
import { ClassInfo } from "../../types";

export const fetchSubjectTeacherConfigRequest = (params?: FetchSubjectTeacherConfigParams) => ({
  type: types.FETCH_SUBJECT_TEACHER_CONFIG_REQUEST,
  payload: params,
});

export const fetchSubjectTeacherConfigSuccess = (payload: {
  data: SubjectItem[];
  meta?: PaginationMeta;
} | SubjectItem[]) => ({
  type: types.FETCH_SUBJECT_TEACHER_CONFIG_SUCCESS,
  payload,
});

export const fetchSubjectTeacherConfigFailure = (error: string) => ({
  type: types.FETCH_SUBJECT_TEACHER_CONFIG_FAILURE,
  payload: error,
});

export const fetchConfigTeachersRequest = () => ({
  type: types.FETCH_CONFIG_TEACHERS_REQUEST,
});

export const fetchConfigTeachersSuccess = (teachers: ConfigTeacher[]) => ({
  type: types.FETCH_CONFIG_TEACHERS_SUCCESS,
  payload: teachers,
});

export const fetchConfigTeachersFailure = (error: string) => ({
  type: types.FETCH_CONFIG_TEACHERS_FAILURE,
  payload: error,
});

export const fetchConfigClassesRequest = () => ({
  type: types.FETCH_CONFIG_CLASSES_REQUEST,
});

export const fetchConfigClassesSuccess = (classes: ClassInfo[]) => ({
  type: types.FETCH_CONFIG_CLASSES_SUCCESS,
  payload: classes,
});

export const fetchConfigClassesFailure = (error: string) => ({
  type: types.FETCH_CONFIG_CLASSES_FAILURE,
  payload: error,
});

export const assignSubjectTeacherRequest = (payload: AssignSubjectTeacherPayload) => ({
  type: types.ASSIGN_SUBJECT_TEACHER_REQUEST,
  payload,
});

export const assignSubjectTeacherSuccess = (payload: AssignSubjectTeacherSuccessPayload) => ({
  type: types.ASSIGN_SUBJECT_TEACHER_SUCCESS,
  payload,
});

export const assignSubjectTeacherFailure = (error: string) => ({
  type: types.ASSIGN_SUBJECT_TEACHER_FAILURE,
  payload: error,
});

export const clearConfigMessages = () => ({
  type: types.CLEAR_CONFIG_MESSAGES,
});
