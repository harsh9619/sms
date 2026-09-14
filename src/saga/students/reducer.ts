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
} from "./actionTypes";
import { StudentState, StudentActionTypes } from "./types";

const initialState: StudentState = {
  students: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  fetchStudentSuccess: null,
  fetchStudentMsg: null,
  deleteStudentSuccess: null,
  deleteStudentMsg: null,
  addEditStudentSuccess: null,
  addEditStudentMsg: null
};

export function studentsReducer(
  state = initialState,
  action: StudentActionTypes
): StudentState {
  switch (action.type) {
    case FETCH_STUDENTS_REQUEST:

      return { ...state, loading: true };

    case FETCH_STUDENTS_SUCCESS: {
      return {
        ...state,
        loading: false,
        students: action.payload.data,
        meta: action.payload.meta,
        fetchStudentSuccess: true,
        fetchStudentMsg: null,
      };
    }

    case UPDATE_STUDENT_REQUEST:
    case DELETE_STUDENT_REQUEST:
    case CREATE_STUDENT_REQUEST: {
      return {
        ...state,
        loading: true,
        addEditStudentSuccess: null,
        addEditStudentMsg: null,
        deleteStudentSuccess: null,
        deleteStudentMsg: null,
      };
    }

    case CREATE_STUDENT_SUCCESS:
      debugger
      return {
        ...state,
        loading: false,
        students: [action.payload.student, ...state.students],
        meta: { ...state.meta, total: state.meta.total + 1 },
        addEditStudentSuccess: true,
        addEditStudentMsg: null,
      };

    case UPDATE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.map((s) =>
          s.id === action.payload.student.id ? action.payload.student : s
        ),
        addEditStudentSuccess: true,
        addEditStudentMsg: null,
      };

    case DELETE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.filter((s) => s.id !== action.payload.id),
        meta: { ...state.meta, total: Math.max(0, state.meta.total - 1) },
        deleteStudentSuccess: true,
        deleteStudentMsg: null,
      };

    case FETCH_STUDENTS_FAILURE:
      return {
        ...state,
        loading: false,
        fetchStudentMsg: action.payload.fetchStudentMsg || null,
        fetchStudentSuccess: action.payload.fetchStudentSuccess || false,
      };
    case CREATE_STUDENT_FAILURE:
    case UPDATE_STUDENT_FAILURE:
      return {
        ...state,
        loading: false,
        addEditStudentMsg: action.payload.addEditStudentMsg || null,
        addEditStudentSuccess: action.payload.addEditStudentSuccess || false,
      };

    case DELETE_STUDENT_FAILURE:
      return {
        ...state,
        loading: false,
        deleteStudentMsg: action.payload.deleteStudentMsg || null,
        deleteStudentSuccess: action.payload.deleteStudentSuccess || false,
      };

    default:
      return state;
  }
}

