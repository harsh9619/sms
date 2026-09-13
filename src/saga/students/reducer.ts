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
  error: null,
};

export function studentsReducer(
  state = initialState,
  action: StudentActionTypes
): StudentState {
  switch (action.type) {
    case FETCH_STUDENTS_REQUEST:
    case CREATE_STUDENT_REQUEST:
    case UPDATE_STUDENT_REQUEST:
    case DELETE_STUDENT_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_STUDENTS_SUCCESS: {
      return {
        ...state,
        loading: false,
        students: action.payload.data,
        meta: action.payload.meta,
      };
    }

    case CREATE_STUDENT_SUCCESS:
      debugger
      return {
        ...state,
        loading: false,
        students: [action.payload.student, ...state.students],
        meta: { ...state.meta, total: state.meta.total + 1 },
      };

    case UPDATE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.map((s) =>
          s.id === action.payload.student.id ? action.payload.student : s
        ),
      };

    case DELETE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.filter((s) => s.id !== action.payload.id),
        meta: { ...state.meta, total: Math.max(0, state.meta.total - 1) },
      };

    case FETCH_STUDENTS_FAILURE:
    case CREATE_STUDENT_FAILURE:
    case UPDATE_STUDENT_FAILURE:
    case DELETE_STUDENT_FAILURE:
      return { ...state, loading: false, error: action.payload.error };

    default:
      return state;
  }
}

