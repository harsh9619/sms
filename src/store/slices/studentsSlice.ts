import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Student } from "../../types";

interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  loading: false,
  error: null,
};

export const studentsSlice = createSlice({
  name: "students",
  initialState,
  reducers: {
    fetchStudentsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchStudentsSuccess: (state, action: PayloadAction<Student[]>) => {
      state.loading = false;
      state.students = action.payload;
    },
    fetchStudentsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createStudentRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createStudentSuccess: (state, action: PayloadAction<Student>) => {
      state.loading = false;
      state.students.push(action.payload);
    },
    createStudentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateStudentRequest: (state, _action: PayloadAction<{ id: string; student: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateStudentSuccess: (state, action: PayloadAction<Student>) => {
      state.loading = false;
      const index = state.students.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.students[index] = action.payload;
      }
    },
    updateStudentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteStudentRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteStudentSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.students = state.students.filter((s) => s.id !== action.payload);
    },
    deleteStudentFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchStudentsRequest,
  fetchStudentsSuccess,
  fetchStudentsFailure,
  createStudentRequest,
  createStudentSuccess,
  createStudentFailure,
  updateStudentRequest,
  updateStudentSuccess,
  updateStudentFailure,
  deleteStudentRequest,
  deleteStudentSuccess,
  deleteStudentFailure,
} = studentsSlice.actions;

export default studentsSlice.reducer;
