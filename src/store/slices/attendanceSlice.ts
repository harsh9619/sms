import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AttendanceRecord } from "../../types";

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
};

export const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    fetchAttendanceRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAttendanceSuccess: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.loading = false;
      state.records = action.payload;
    },
    fetchAttendanceFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchAttendanceRequest,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
