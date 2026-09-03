import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TimetableSlot } from "../../types";

interface TimetablesState {
  timetables: TimetableSlot[];
  loading: boolean;
  error: string | null;
}

const initialState: TimetablesState = {
  timetables: [],
  loading: false,
  error: null,
};

export const timetablesSlice = createSlice({
  name: "timetables",
  initialState,
  reducers: {
    fetchTimetablesRequest: (state, _action: PayloadAction<{ classId?: string; teacherId?: string } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchTimetablesSuccess: (state, action: PayloadAction<TimetableSlot[]>) => {
      state.loading = false;
      state.timetables = action.payload;
    },
    fetchTimetablesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createTimetableRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createTimetableSuccess: (state, action: PayloadAction<TimetableSlot>) => {
      state.loading = false;
      state.timetables.push(action.payload);
    },
    createTimetableFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTimetableRequest: (state, _action: PayloadAction<{ id: string; t: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateTimetableSuccess: (state, action: PayloadAction<TimetableSlot>) => {
      state.loading = false;
      const index = state.timetables.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.timetables[index] = action.payload;
      }
    },
    updateTimetableFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTimetableRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteTimetableSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.timetables = state.timetables.filter((t) => t.id !== action.payload);
    },
    deleteTimetableFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTimetablesRequest,
  fetchTimetablesSuccess,
  fetchTimetablesFailure,
  createTimetableRequest,
  createTimetableSuccess,
  createTimetableFailure,
  updateTimetableRequest,
  updateTimetableSuccess,
  updateTimetableFailure,
  deleteTimetableRequest,
  deleteTimetableSuccess,
  deleteTimetableFailure,
} = timetablesSlice.actions;

export default timetablesSlice.reducer;
