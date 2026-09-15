import * as types from "./actionTypes";
import {
  FetchTeacherRequestPayload,
  FetchTeacherSuccessPayload,
  FetchTeacherFailurePayload,
  CreateTeacherRequestPayload,
  CreateTeacherSuccessPayload,
  CreateTeacherFailurePayload,
  UpdateTeacherRequestPayload,
  UpdateTeacherSuccessPayload,
  UpdateTeacherFailurePayload,
  DeleteTeacherRequestPayload,
  DeleteTeacherSuccessPayload,
  DeleteTeacherFailurePayload,
} from "./types";

export const fetchTeachersRequest = (payload?: FetchTeacherRequestPayload) => ({
  type: types.FETCH_TEACHERS_REQUEST,
  payload,
});

export const fetchTeachersSuccess = (payload: FetchTeacherSuccessPayload) => ({
  type: types.FETCH_TEACHERS_SUCCESS,
  payload,
});

export const fetchTeachersFailure = (payload: FetchTeacherFailurePayload) => ({
  type: types.FETCH_TEACHERS_FAILURE,
  payload,
});

export const createTeacherRequest = (payload: CreateTeacherRequestPayload) => ({
  type: types.CREATE_TEACHER_REQUEST,
  payload,
});

export const createTeacherSuccess = (payload: CreateTeacherSuccessPayload) => ({
  type: types.CREATE_TEACHER_SUCCESS,
  payload,
});

export const createTeacherFailure = (payload: CreateTeacherFailurePayload) => ({
  type: types.CREATE_TEACHER_FAILURE,
  payload,
});

export const updateTeacherRequest = (payload: UpdateTeacherRequestPayload) => ({
  type: types.UPDATE_TEACHER_REQUEST,
  payload,
});

export const updateTeacherSuccess = (payload: UpdateTeacherSuccessPayload) => ({
  type: types.UPDATE_TEACHER_SUCCESS,
  payload,
});

export const updateTeacherFailure = (payload: UpdateTeacherFailurePayload) => ({
  type: types.UPDATE_TEACHER_FAILURE,
  payload,
});

export const deleteTeacherRequest = (payload: DeleteTeacherRequestPayload) => ({
  type: types.DELETE_TEACHER_REQUEST,
  payload,
});

export const deleteTeacherSuccess = (payload: DeleteTeacherSuccessPayload) => ({
  type: types.DELETE_TEACHER_SUCCESS,
  payload,
});

export const deleteTeacherFailure = (payload: DeleteTeacherFailurePayload) => ({
  type: types.DELETE_TEACHER_FAILURE,
  payload,
});

export const bulkCreateTeachersRequest = (payload: { teachers: any[] }) => ({
  type: types.BULK_CREATE_TEACHERS_REQUEST,
  payload,
});

export const bulkCreateTeachersSuccess = (payload: any) => ({
  type: types.BULK_CREATE_TEACHERS_SUCCESS,
  payload,
});

export const bulkCreateTeachersFailure = (payload: any) => ({
  type: types.BULK_CREATE_TEACHERS_FAILURE,
  payload,
});
