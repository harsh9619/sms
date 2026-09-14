import { TeachersState } from "./types";
import {
  FETCH_TEACHERS_REQUEST,
  FETCH_TEACHERS_SUCCESS,
  FETCH_TEACHERS_FAILURE,
  CREATE_TEACHER_REQUEST,
  CREATE_TEACHER_SUCCESS,
  CREATE_TEACHER_FAILURE,
  UPDATE_TEACHER_REQUEST,
  UPDATE_TEACHER_SUCCESS,
  UPDATE_TEACHER_FAILURE,
  DELETE_TEACHER_REQUEST,
  DELETE_TEACHER_SUCCESS,
  DELETE_TEACHER_FAILURE,
} from "./actionTypes";

const initialState: TeachersState = {
  teachers: [],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  fetchTeacherSuccess: null,
  fetchTeacherMsg: null,
  deleteTeacherSuccess: null,
  deleteTeacherMsg: null,
  addEditTeacherSuccess: null,
  addEditTeacherMsg: null,
};

export function teachersReducer(
  state: TeachersState = initialState,
  action: any
): TeachersState {
  switch (action.type) {
    case FETCH_TEACHERS_REQUEST:
      return { ...state, loading: true };

    case FETCH_TEACHERS_SUCCESS: {
      const data = Array.isArray(action.payload) ? action.payload : action.payload?.data || [];
      const meta = action.payload?.meta || {
        total: data.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      return {
        ...state,
        loading: false,
        teachers: data,
        meta,
        fetchTeacherSuccess: true,
        fetchTeacherMsg: null,
      };
    }

    case UPDATE_TEACHER_REQUEST:
    case DELETE_TEACHER_REQUEST:
    case CREATE_TEACHER_REQUEST: {
      return {
        ...state,
        loading: true,
        addEditTeacherSuccess: null,
        addEditTeacherMsg: null,
        deleteTeacherSuccess: null,
        deleteTeacherMsg: null,
      };
    }

    case CREATE_TEACHER_SUCCESS:
      return {
        ...state,
        loading: false,
        teachers: [action.payload.teacher, ...state.teachers],
        meta: { ...state.meta, total: state.meta.total + 1 },
        addEditTeacherSuccess: true,
        addEditTeacherMsg: null,
      };

    case UPDATE_TEACHER_SUCCESS:
      return {
        ...state,
        loading: false,
        teachers: state.teachers.map((t) =>
          t.id === action.payload.teacher.id ? action.payload.teacher : t
        ),
        addEditTeacherSuccess: true,
        addEditTeacherMsg: null,
      };

    case DELETE_TEACHER_SUCCESS:
      return {
        ...state,
        loading: false,
        teachers: state.teachers.filter((t) => t.id !== action.payload.id),
        meta: { ...state.meta, total: Math.max(0, state.meta.total - 1) },
        deleteTeacherSuccess: true,
        deleteTeacherMsg: null,
      };

    case FETCH_TEACHERS_FAILURE:
      return {
        ...state,
        loading: false,
        fetchTeacherMsg: action.payload.fetchTeacherMsg || null,
        fetchTeacherSuccess: action.payload.fetchTeacherSuccess || false,
      };

    case CREATE_TEACHER_FAILURE:
    case UPDATE_TEACHER_FAILURE:
      return {
        ...state,
        loading: false,
        addEditTeacherMsg: action.payload.addEditTeacherMsg || null,
        addEditTeacherSuccess: action.payload.addEditTeacherSuccess || false,
      };

    case DELETE_TEACHER_FAILURE:
      return {
        ...state,
        loading: false,
        deleteTeacherMsg: action.payload.deleteTeacherMsg || null,
        deleteTeacherSuccess: action.payload.deleteTeacherSuccess || false,
      };

    default:
      return state;
  }
}

export default teachersReducer;
