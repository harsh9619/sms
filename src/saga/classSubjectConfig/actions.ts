import * as types from "./actionTypes";
import { SubjectMaster, SubjectItem } from "../../Services/classSubject.service";
import type { ClassInfo } from "../../types";

export const fetchClassSubjectConfigRequest = () => ({
  type: types.FETCH_CLASS_SUBJECT_CONFIG_REQUEST,
});

export const fetchClassSubjectConfigSuccess = (payload: {
  classesList: ClassInfo[];
  classMasters: any[];
  divMasters: string[];
  masterSubjects: SubjectMaster[];
  allAssignedSubjects: SubjectItem[];
}) => ({
  type: types.FETCH_CLASS_SUBJECT_CONFIG_SUCCESS,
  payload,
});

export const fetchClassSubjectConfigFailure = (error: string) => ({
  type: types.FETCH_CLASS_SUBJECT_CONFIG_FAILURE,
  payload: error,
});

export const syncClassSubjectsRequest = (payload: {
  classIds: string[];
  masterSubjectNumbers: number[];
}) => ({
  type: types.SYNC_CLASS_SUBJECTS_REQUEST,
  payload,
});

export const syncClassSubjectsSuccess = () => ({
  type: types.SYNC_CLASS_SUBJECTS_SUCCESS,
});

export const syncClassSubjectsFailure = (error: string) => ({
  type: types.SYNC_CLASS_SUBJECTS_FAILURE,
  payload: error,
});

export const batchCreateClassesRequest = (payload: { name: string; section: string }[]) => ({
  type: types.BATCH_CREATE_CLASSES_REQUEST,
  payload,
});

export const batchCreateClassesSuccess = () => ({
  type: types.BATCH_CREATE_CLASSES_SUCCESS,
});

export const batchCreateClassesFailure = (error: string) => ({
  type: types.BATCH_CREATE_CLASSES_FAILURE,
  payload: error,
});

export const deleteClassGroupRequest = (classIds: string[]) => ({
  type: types.DELETE_CLASS_GROUP_REQUEST,
  payload: classIds,
});

export const deleteClassGroupSuccess = () => ({
  type: types.DELETE_CLASS_GROUP_SUCCESS,
});

export const deleteClassGroupFailure = (error: string) => ({
  type: types.DELETE_CLASS_GROUP_FAILURE,
  payload: error,
});

export const clearClassSubjectConfigMessages = () => ({
  type: types.CLEAR_CLASS_SUBJECT_CONFIG_MESSAGES,
});
