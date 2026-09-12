import { StudentsState } from "./types";
import * as types from "./actionTypes";

const initialState: StudentsState = {
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

export function studentsReducer(state: StudentsState = initialState, action: any): StudentsState {
  switch (action.type) {
    case types.FETCH_STUDENTS_REQUEST:
    case types.CREATE_STUDENT_REQUEST:
    case types.UPDATE_STUDENT_REQUEST:
    case types.DELETE_STUDENT_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_STUDENTS_SUCCESS: {
      const isPaginated = action.payload && Array.isArray(action.payload.data);
      const studentsList = isPaginated ? action.payload.data : (Array.isArray(action.payload) ? action.payload : []);
      const metaInfo = isPaginated
        ? action.payload.meta
        : { total: studentsList.length, page: 1, limit: studentsList.length || 10, totalPages: 1 };

      return {
        ...state,
        loading: false,
        students: studentsList,
        meta: metaInfo,
      };
    }

    case types.CREATE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: [action.payload, ...state.students],
        meta: { ...state.meta, total: state.meta.total + 1 },
      };

    case types.UPDATE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.map((s) => (s.id === action.payload.id ? action.payload : s)),
      };

    case types.DELETE_STUDENT_SUCCESS:
      return {
        ...state,
        loading: false,
        students: state.students.filter((s) => s.id !== action.payload),
        meta: { ...state.meta, total: Math.max(0, state.meta.total - 1) },
      };

    case types.FETCH_STUDENTS_FAILURE:
    case types.CREATE_STUDENT_FAILURE:
    case types.UPDATE_STUDENT_FAILURE:
    case types.DELETE_STUDENT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

