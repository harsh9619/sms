import { AttendanceState } from "./types";
import * as types from "./actionTypes";

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
};

export function attendanceReducer(state: AttendanceState = initialState, action: any): AttendanceState {
  switch (action.type) {
    case types.FETCH_ATTENDANCE_REQUEST:
      return { ...state, loading: true, error: null };

    case types.FETCH_ATTENDANCE_SUCCESS:
      return { ...state, loading: false, records: action.payload };

    case types.FETCH_ATTENDANCE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}
