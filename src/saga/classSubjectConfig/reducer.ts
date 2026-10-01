import * as types from "./actionTypes";
import { ClassSubjectConfigState } from "./types";

const initialState: ClassSubjectConfigState = {
  classesList: [],
  classMasters: [],
  masterSubjects: [],
  allAssignedSubjects: [],
  divMasters: [],
  loading: false,
  saving: false,
  saveSuccess: false,
  creatingClass: false,
  deleting: false,
  successMsg: null,
  error: null,
};

export const classSubjectConfigReducer = (
  state = initialState,
  action: any
): ClassSubjectConfigState => {
  switch (action.type) {
    case types.FETCH_CLASS_SUBJECT_CONFIG_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case types.FETCH_CLASS_SUBJECT_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        classesList: action.payload.classesList,
        classMasters: action.payload.classMasters,
        divMasters: action.payload.divMasters,
        masterSubjects: action.payload.masterSubjects,
        allAssignedSubjects: action.payload.allAssignedSubjects,
        error: null,
      };
    case types.FETCH_CLASS_SUBJECT_CONFIG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.SYNC_CLASS_SUBJECTS_REQUEST:
      return {
        ...state,
        saving: true,
        saveSuccess: false,
        error: null,
      };
    case types.SYNC_CLASS_SUBJECTS_SUCCESS:
      return {
        ...state,
        saving: false,
        saveSuccess: true,
        successMsg: "Subjects updated successfully!",
        error: null,
      };
    case types.SYNC_CLASS_SUBJECTS_FAILURE:
      return {
        ...state,
        saving: false,
        saveSuccess: false,
        error: action.payload,
      };

    case types.BATCH_CREATE_CLASSES_REQUEST:
      return {
        ...state,
        creatingClass: true,
        error: null,
      };
    case types.BATCH_CREATE_CLASSES_SUCCESS:
      return {
        ...state,
        creatingClass: false,
        successMsg: "Classes created successfully!",
        error: null,
      };
    case types.BATCH_CREATE_CLASSES_FAILURE:
      return {
        ...state,
        creatingClass: false,
        error: action.payload,
      };

    case types.DELETE_CLASS_GROUP_REQUEST:
      return {
        ...state,
        deleting: true,
        error: null,
      };
    case types.DELETE_CLASS_GROUP_SUCCESS:
      return {
        ...state,
        deleting: false,
        successMsg: "Class removed successfully!",
        error: null,
      };
    case types.DELETE_CLASS_GROUP_FAILURE:
      return {
        ...state,
        deleting: false,
        error: action.payload,
      };

    case types.CLEAR_CLASS_SUBJECT_CONFIG_MESSAGES:
      return {
        ...state,
        successMsg: null,
        error: null,
        saveSuccess: false,
      };

    default:
      return state;
  }
};
