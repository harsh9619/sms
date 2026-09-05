import { StudentsState } from "./types";
import * as types from "./actionTypes";

const initialState: StudentsState = {
  students: [],
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

    case types.FETCH_STUDENTS_SUCCESS:
      return { ...state, loading: false, students: action.payload };

    case types.CREATE_STUDENT_SUCCESS:
      return { ...state, loading: false, students: [...state.students, action.payload] };

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
