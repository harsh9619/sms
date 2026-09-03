import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ClassInfo } from "../../types";

interface ClassesState {
  classes: ClassInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: ClassesState = {
  classes: [],
  loading: false,
  error: null,
};

export const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {
    fetchClassesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchClassesSuccess: (state, action: PayloadAction<ClassInfo[]>) => {
      state.loading = false;
      state.classes = action.payload;
    },
    fetchClassesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createClassRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createClassSuccess: (state, action: PayloadAction<ClassInfo>) => {
      state.loading = false;
      state.classes.push(action.payload);
    },
    createClassFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateClassRequest: (state, _action: PayloadAction<{ id: string; cls: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateClassSuccess: (state, action: PayloadAction<ClassInfo>) => {
      state.loading = false;
      const index = state.classes.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.classes[index] = action.payload;
      }
    },
    updateClassFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteClassRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteClassSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.classes = state.classes.filter((c) => c.id !== action.payload);
    },
    deleteClassFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchClassesRequest,
  fetchClassesSuccess,
  fetchClassesFailure,
  createClassRequest,
  createClassSuccess,
  createClassFailure,
  updateClassRequest,
  updateClassSuccess,
  updateClassFailure,
  deleteClassRequest,
  deleteClassSuccess,
  deleteClassFailure,
} = classesSlice.actions;

export default classesSlice.reducer;
