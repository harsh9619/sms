import * as types from "./actionTypes";
import { AttendanceState, AttendanceActionTypes } from "./types";

const initialState: AttendanceState = {
  records: [],
  myAttendance: [],
  loading: false,
  error: null,
  saveSuccess: null,
  saveMsg: null,
};

export function attendanceReducer(
  state: AttendanceState = initialState,
  action: AttendanceActionTypes
): AttendanceState {
  switch (action.type) {
    case types.FETCH_ATTENDANCE_REQUEST:
    case types.FETCH_MY_ATTENDANCE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case types.SAVE_ATTENDANCE_REQUEST:
      return {
        ...state,
        loading: true,
        saveSuccess: null,
        saveMsg: null,
      };

    case types.FETCH_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        records: action.payload,
      };

    case types.FETCH_MY_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        myAttendance: action.payload,
      };

    case types.SAVE_ATTENDANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        saveSuccess: true,
        saveMsg: "Attendance saved successfully",
        records: [...state.records, ...action.payload],
      };

    case types.FETCH_ATTENDANCE_FAILURE:
    case types.FETCH_MY_ATTENDANCE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case types.SAVE_ATTENDANCE_FAILURE:
      return {
        ...state,
        loading: false,
        saveSuccess: false,
        saveMsg: action.payload,
      };

    default:
      return state;
  }
}
