import * as types from "./actionTypes";
import type { School } from "../../context/SchoolContext";
import type { User } from "../../types";
import type { MasterTheme } from "../../Services/school.service";

export const fetchSettingsConfigRequest = () => ({
  type: types.FETCH_SETTINGS_CONFIG_REQUEST,
});

export const fetchSettingsConfigSuccess = (payload: {
  schools: School[];
  users: User[];
  masterThemes: MasterTheme[];
}) => ({
  type: types.FETCH_SETTINGS_CONFIG_SUCCESS,
  payload,
});

export const fetchSettingsConfigFailure = (error: string) => ({
  type: types.FETCH_SETTINGS_CONFIG_FAILURE,
  payload: error,
});

export const updateSchoolConfigRequest = (payload: any) => ({
  type: types.UPDATE_SCHOOL_CONFIG_REQUEST,
  payload,
});

export const updateSchoolConfigSuccess = (school: School) => ({
  type: types.UPDATE_SCHOOL_CONFIG_SUCCESS,
  payload: school,
});

export const updateSchoolConfigFailure = (error: string) => ({
  type: types.UPDATE_SCHOOL_CONFIG_FAILURE,
  payload: error,
});

export const createUserConfigRequest = (user: any) => ({
  type: types.CREATE_USER_CONFIG_REQUEST,
  payload: user,
});

export const createUserConfigSuccess = (user: User) => ({
  type: types.CREATE_USER_CONFIG_SUCCESS,
  payload: user,
});

export const createUserConfigFailure = (error: string) => ({
  type: types.CREATE_USER_CONFIG_FAILURE,
  payload: error,
});

export const updateUserConfigRequest = (payload: { id: string; user: any }) => ({
  type: types.UPDATE_USER_CONFIG_REQUEST,
  payload,
});

export const updateUserConfigSuccess = (user: User) => ({
  type: types.UPDATE_USER_CONFIG_SUCCESS,
  payload: user,
});

export const updateUserConfigFailure = (error: string) => ({
  type: types.UPDATE_USER_CONFIG_FAILURE,
  payload: error,
});

export const deleteUserConfigRequest = (id: string) => ({
  type: types.DELETE_USER_CONFIG_REQUEST,
  payload: id,
});

export const deleteUserConfigSuccess = (id: string) => ({
  type: types.DELETE_USER_CONFIG_SUCCESS,
  payload: id,
});

export const deleteUserConfigFailure = (error: string) => ({
  type: types.DELETE_USER_CONFIG_FAILURE,
  payload: error,
});

export const clearSettingsConfigMessages = () => ({
  type: types.CLEAR_SETTINGS_CONFIG_MESSAGES,
});
