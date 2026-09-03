import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { HomeworkRecord } from "../../types";

interface HomeworkState {
  homework: HomeworkRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: HomeworkState = {
  homework: [],
  loading: false,
  error: null,
};

export const homeworkSlice = createSlice({
  name: "homework",
  initialState,
  reducers: {
    fetchHomeworkRequest: (state, _action: PayloadAction<{ classId?: string; teacherId?: string } | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchHomeworkSuccess: (state, action: PayloadAction<HomeworkRecord[]>) => {
      state.loading = false;
      state.homework = action.payload;
    },
    fetchHomeworkFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createHomeworkRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createHomeworkSuccess: (state, action: PayloadAction<HomeworkRecord>) => {
      state.loading = false;
      state.homework.push(action.payload);
    },
    createHomeworkFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateHomeworkRequest: (state, _action: PayloadAction<{ id: string; hw: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateHomeworkSuccess: (state, action: PayloadAction<HomeworkRecord>) => {
      state.loading = false;
      const index = state.homework.findIndex((h) => h.id === action.payload.id);
      if (index !== -1) {
        state.homework[index] = action.payload;
      }
    },
    updateHomeworkFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteHomeworkRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteHomeworkSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.homework = state.homework.filter((h) => h.id !== action.payload);
    },
    deleteHomeworkFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchHomeworkRequest,
  fetchHomeworkSuccess,
  fetchHomeworkFailure,
  createHomeworkRequest,
  createHomeworkSuccess,
  createHomeworkFailure,
  updateHomeworkRequest,
  updateHomeworkSuccess,
  updateHomeworkFailure,
  deleteHomeworkRequest,
  deleteHomeworkSuccess,
  deleteHomeworkFailure,
} = homeworkSlice.actions;

export default homeworkSlice.reducer;
