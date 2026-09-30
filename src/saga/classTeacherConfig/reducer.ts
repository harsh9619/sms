import * as types from "./actionTypes";
import { ClassTeacherConfigState } from "./types";

const initialState: ClassTeacherConfigState = {
  classTeachers: [],
  classesList: [],
  teachers: [],
  loading: false,
  savingClassTeacherId: null,
  successMsg: null,
  error: null,
};

export function classTeacherConfigReducer(
  state = initialState,
  action: any
): ClassTeacherConfigState {
  switch (action.type) {
    case types.FETCH_CLASS_TEACHER_CONFIG_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.FETCH_CLASS_TEACHER_CONFIG_SUCCESS:
      return {
        ...state,
        loading: false,
        classTeachers: action.payload.classTeachers || [],
        classesList: action.payload.classesList || [],
        teachers: action.payload.teachers || [],
        error: null,
      };

    case types.FETCH_CLASS_TEACHER_CONFIG_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.ASSIGN_CLASS_TEACHER_REQUEST: {
      const { id, teacherId } = action.payload;
      return {
        ...state,
        savingClassTeacherId: id,
        error: null,
        // Optimistic UI update
        classTeachers: state.classTeachers.map((item) => {
          if (String(item.id) === String(id) || String(item.classId) === String(id)) {
            const assignedTeacher = state.teachers.find(
              (t) => String(t.id) === String(teacherId)
            );
            return {
              ...item,
              teacherId: teacherId ? String(teacherId) : null,
              teacherName: assignedTeacher?.name || null,
            };
          }
          return item;
        }),
      };
    }

    case types.ASSIGN_CLASS_TEACHER_SUCCESS:
      return {
        ...state,
        savingClassTeacherId: null,
        successMsg: "Class teacher assigned successfully!",
        error: null,
      };

    case types.ASSIGN_CLASS_TEACHER_FAILURE:
      return {
        ...state,
        savingClassTeacherId: null,
        error: action.payload,
      };

    case types.CLEAR_CLASS_TEACHER_CONFIG_MESSAGES:
      return {
        ...state,
        successMsg: null,
        error: null,
      };

    default:
      return state;
  }
}
