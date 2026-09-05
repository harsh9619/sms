import type { Student } from "../../types";
import * as types from "./actionTypes";

export const fetchStudentsRequest = () => ({
  type: types.FETCH_STUDENTS_REQUEST,
});

export const fetchStudentsSuccess = (payload: Student[]) => ({
  type: types.FETCH_STUDENTS_SUCCESS,
  payload,
});

export const fetchStudentsFailure = (payload: string) => ({
  type: types.FETCH_STUDENTS_FAILURE,
  payload,
});

export const createStudentRequest = (payload: any) => ({
  type: types.CREATE_STUDENT_REQUEST,
  payload,
});

export const createStudentSuccess = (payload: Student) => ({
  type: types.CREATE_STUDENT_SUCCESS,
  payload,
});

export const createStudentFailure = (payload: string) => ({
  type: types.CREATE_STUDENT_FAILURE,
  payload,
});

export const updateStudentRequest = (payload: { id: string; student: any }) => ({
  type: types.UPDATE_STUDENT_REQUEST,
  payload,
});

export const updateStudentSuccess = (payload: Student) => ({
  type: types.UPDATE_STUDENT_SUCCESS,
  payload,
});

export const updateStudentFailure = (payload: string) => ({
  type: types.UPDATE_STUDENT_FAILURE,
  payload,
});

export const deleteStudentRequest = (payload: string) => ({
  type: types.DELETE_STUDENT_REQUEST,
  payload,
});

export const deleteStudentSuccess = (payload: string) => ({
  type: types.DELETE_STUDENT_SUCCESS,
  payload,
});

export const deleteStudentFailure = (payload: string) => ({
  type: types.DELETE_STUDENT_FAILURE,
  payload,
});
