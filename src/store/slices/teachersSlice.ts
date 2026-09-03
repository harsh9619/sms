import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Teacher } from "../../types";

interface TeachersState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
}

const initialState: TeachersState = {
  teachers: [],
  loading: false,
  error: null,
};

export const teachersSlice = createSlice({
  name: "teachers",
  initialState,
  reducers: {
    fetchTeachersRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTeachersSuccess: (state, action: PayloadAction<Teacher[]>) => {
      state.loading = false;
      state.teachers = action.payload;
    },
    fetchTeachersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchTeachersRequest,
  fetchTeachersSuccess,
  fetchTeachersFailure,
} = teachersSlice.actions;

export default teachersSlice.reducer;
