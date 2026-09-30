import { SubjectTeacherConfigState, ConfigTeacher, PaginationMeta } from "./types";
import {
  FETCH_SUBJECT_TEACHER_CONFIG_REQUEST,
  FETCH_SUBJECT_TEACHER_CONFIG_SUCCESS,
  FETCH_SUBJECT_TEACHER_CONFIG_FAILURE,
  FETCH_CONFIG_TEACHERS_REQUEST,
  FETCH_CONFIG_TEACHERS_SUCCESS,
  FETCH_CONFIG_TEACHERS_FAILURE,
  FETCH_CONFIG_CLASSES_REQUEST,
  FETCH_CONFIG_CLASSES_SUCCESS,
  FETCH_CONFIG_CLASSES_FAILURE,
  ASSIGN_SUBJECT_TEACHER_REQUEST,
  ASSIGN_SUBJECT_TEACHER_SUCCESS,
  ASSIGN_SUBJECT_TEACHER_FAILURE,
  CLEAR_CONFIG_MESSAGES,
} from "./actionTypes";

const FALLBACK_TEACHERS: ConfigTeacher[] = [
  { id: "1", name: "Priya Sharma", email: "priya.sharma@school.com", subject: "Mathematics" },
  { id: "2", name: "Amit Patel", email: "amit.patel@school.com", subject: "Physics" },
  { id: "3", name: "Vikram Malhotra", email: "vikram.m@school.com", subject: "Chemistry" },
  { id: "4", name: "Ananya Sen", email: "ananya.sen@school.com", subject: "English Literature" },
  { id: "5", name: "Rajesh Gupta", email: "rajesh.g@school.com", subject: "Computer Science" },
  { id: "6", name: "Sunita Rao", email: "sunita.r@school.com", subject: "Social Studies" },
  { id: "7", name: "Ramesh Kumar", email: "ramesh.k@school.com", subject: "Biology" },
];

const initialState: SubjectTeacherConfigState = {
  subjects: [],
  teachers: FALLBACK_TEACHERS,
  classesList: [],
  assignments: {},
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  savingSubjectId: null,
  savingAll: false,
  successMsg: null,
  error: null,
};

export function subjectTeacherConfigReducer(
  state: SubjectTeacherConfigState = initialState,
  action: any
): SubjectTeacherConfigState {
  switch (action.type) {
    case FETCH_SUBJECT_TEACHER_CONFIG_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_SUBJECT_TEACHER_CONFIG_SUCCESS: {
      const isObject = action.payload && !Array.isArray(action.payload) && typeof action.payload === "object";
      const listToUse = isObject ? action.payload.data || [] : Array.isArray(action.payload) ? action.payload : [];
      const meta: PaginationMeta = isObject && action.payload.meta
        ? action.payload.meta
        : {
            total: listToUse.length,
            page: 1,
            limit: Math.max(10, listToUse.length),
            totalPages: 1,
          };

      const map: Record<string, string> = { ...state.assignments };
      listToUse.forEach((s: any) => {
        const itemKey = s.classSubjectId || s.id;
        if (s.teacherId && itemKey) {
          map[itemKey] = s.teacherId;
        }
      });
      return {
        ...state,
        loading: false,
        subjects: listToUse,
        assignments: map,
        meta,
        error: null,
      };
    }

    case FETCH_SUBJECT_TEACHER_CONFIG_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case FETCH_CONFIG_TEACHERS_SUCCESS: {
      const teachers = Array.isArray(action.payload) && action.payload.length > 0
        ? action.payload
        : state.teachers.length > 0 ? state.teachers : FALLBACK_TEACHERS;
      return { ...state, teachers };
    }

    case FETCH_CONFIG_TEACHERS_FAILURE:
      return { ...state, teachers: state.teachers.length > 0 ? state.teachers : FALLBACK_TEACHERS };

    case FETCH_CONFIG_CLASSES_SUCCESS:
      return { ...state, classesList: Array.isArray(action.payload) ? action.payload : [] };

    case ASSIGN_SUBJECT_TEACHER_REQUEST:
      return {
        ...state,
        savingSubjectId: action.payload.classSubjectId,
        error: null,
        assignments: {
          ...state.assignments,
          [action.payload.classSubjectId]: action.payload.teacherId || "",
        },
      };

    case ASSIGN_SUBJECT_TEACHER_SUCCESS: {
      const { classSubjectId, teacherId, teacherName } = action.payload;
      const updatedSubjects = state.subjects.map((s: any) => {
        const itemKey = s.classSubjectId || s.id;
        if (itemKey === classSubjectId) {
          return { ...s, teacherId: teacherId || null, teacherName: teacherName || null };
        }
        return s;
      });
      return {
        ...state,
        savingSubjectId: null,
        subjects: updatedSubjects,
        successMsg: "Teacher assignment updated!",
        error: null,
      };
    }

    case ASSIGN_SUBJECT_TEACHER_FAILURE:
      return {
        ...state,
        savingSubjectId: null,
        error: action.payload || "Failed to update teacher assignment",
      };

    case CLEAR_CONFIG_MESSAGES:
      return {
        ...state,
        successMsg: null,
        error: null,
      };

    default:
      return state;
  }
}

export default subjectTeacherConfigReducer;
