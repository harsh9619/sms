import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { MarkRecord } from "../../types";

interface MarksState {
  marks: MarkRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: MarksState = {
  marks: [],
  loading: false,
  error: null,
};

export const marksSlice = createSlice({
  name: "marks",
  initialState,
  reducers: {
    fetchMarksRequest: (state, _action: PayloadAction<{ studentId?: string; classId?: string; subjectId?: string } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchMarksSuccess: (state, action: PayloadAction<MarkRecord[]>) => {
      state.loading = false;
      state.marks = action.payload;
    },
    fetchMarksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createMarksRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createMarksSuccess: (state, action: PayloadAction<MarkRecord>) => {
      state.loading = false;
      state.marks.push(action.payload);
    },
    createMarksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateMarksRequest: (state, _action: PayloadAction<{ id: string; m: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateMarksSuccess: (state, action: PayloadAction<MarkRecord>) => {
      state.loading = false;
      const index = state.marks.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.marks[index] = action.payload;
      }
    },
    updateMarksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteMarksRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteMarksSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.marks = state.marks.filter((m) => m.id !== action.payload);
    },
    deleteMarksFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchMarksRequest,
  fetchMarksSuccess,
  fetchMarksFailure,
  createMarksRequest,
  createMarksSuccess,
  createMarksFailure,
  updateMarksRequest,
  updateMarksSuccess,
  updateMarksFailure,
  deleteMarksRequest,
  deleteMarksSuccess,
  deleteMarksFailure,
} = marksSlice.actions;

export default marksSlice.reducer;
