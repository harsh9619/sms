import type { Student } from "../../types";
import * as types from "./actionTypes";
import {
  FetchStudentRequest,
  FetchStudentSuccess,
  FetchStudentFailure,
  FetchStudentRequestPayload,
  FetchStudentSuccessPayload,
  FetchStudentFailurePayload,
  CreateStudentRequest,
  CreateStudentSuccess,
  CreateStudentFailure,
  CreateStudentRequestPayload,
  CreateStudentSuccessPayload,
  CreateStudentFailurePayload,
  UpdateStudentRequest,
  UpdateStudentSuccess,
  UpdateStudentFailure,
  UpdateStudentRequestPayload,
  UpdateStudentSuccessPayload,
  UpdateStudentFailurePayload,
  DeleteStudentRequest,
  DeleteStudentSuccess,
  DeleteStudentFailure,
  DeleteStudentRequestPayload,
  DeleteStudentSuccessPayload,
  DeleteStudentFailurePayload,
} from "./types";
import {
  FETCH_STUDENTS_REQUEST,
  FETCH_STUDENTS_SUCCESS,
  FETCH_STUDENTS_FAILURE,
  CREATE_STUDENT_REQUEST,
  CREATE_STUDENT_SUCCESS,
  CREATE_STUDENT_FAILURE,
  UPDATE_STUDENT_REQUEST,
  UPDATE_STUDENT_SUCCESS,
  UPDATE_STUDENT_FAILURE,
  DELETE_STUDENT_REQUEST,
  DELETE_STUDENT_SUCCESS,
  DELETE_STUDENT_FAILURE,
  BULK_CREATE_STUDENTS_REQUEST,
  BULK_CREATE_STUDENTS_SUCCESS,
  BULK_CREATE_STUDENTS_FAILURE,
} from "./actionTypes";



export const fetchStudentsRequest = (
  payload: FetchStudentRequestPayload
): FetchStudentRequest => ({
  type: FETCH_STUDENTS_REQUEST,
  payload,
});

export const fetchStudentsSuccess = (
  payload: FetchStudentSuccessPayload
): FetchStudentSuccess => ({
  type: FETCH_STUDENTS_SUCCESS,
  payload,
});

export const fetchStudentsFailure = (
  payload: FetchStudentFailurePayload
): FetchStudentFailure => ({
  type: FETCH_STUDENTS_FAILURE,
  payload,
});


export const createStudentRequest = (
  payload: CreateStudentRequestPayload
): CreateStudentRequest => ({
  type: CREATE_STUDENT_REQUEST,
  payload,
});

export const createStudentSuccess = (
  payload: CreateStudentSuccessPayload
): CreateStudentSuccess => ({
  type: CREATE_STUDENT_SUCCESS,
  payload,
});

export const createStudentFailure = (
  payload: CreateStudentFailurePayload
): CreateStudentFailure => ({
  type: CREATE_STUDENT_FAILURE,
  payload,
});

export const updateStudentRequest = (
  payload: UpdateStudentRequestPayload
): UpdateStudentRequest => ({
  type: UPDATE_STUDENT_REQUEST,
  payload,
});

export const updateStudentSuccess = (
  payload: UpdateStudentSuccessPayload
): UpdateStudentSuccess => ({
  type: UPDATE_STUDENT_SUCCESS,
  payload,
});

export const updateStudentFailure = (
  payload: UpdateStudentFailurePayload
): UpdateStudentFailure => ({
  type: UPDATE_STUDENT_FAILURE,
  payload,
});

export const deleteStudentRequest = (
  payload: DeleteStudentRequestPayload
): DeleteStudentRequest => ({
  type: DELETE_STUDENT_REQUEST,
  payload,
});

export const deleteStudentSuccess = (
  payload: DeleteStudentSuccessPayload
): DeleteStudentSuccess => ({
  type: DELETE_STUDENT_SUCCESS,
  payload,
});

export const deleteStudentFailure = (
  payload: DeleteStudentFailurePayload
): DeleteStudentFailure => ({
  type: DELETE_STUDENT_FAILURE,
  payload,
});

export const bulkCreateStudentsRequest = (payload: { students: any[] }) => ({
  type: BULK_CREATE_STUDENTS_REQUEST,
  payload,
});

export const bulkCreateStudentsSuccess = (payload: any) => ({
  type: BULK_CREATE_STUDENTS_SUCCESS,
  payload,
});

export const bulkCreateStudentsFailure = (payload: any) => ({
  type: BULK_CREATE_STUDENTS_FAILURE,
  payload,
});
