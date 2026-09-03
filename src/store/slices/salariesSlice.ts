import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SalaryRecord } from "../../types";

interface SalariesState {
  salaries: SalaryRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: SalariesState = {
  salaries: [],
  loading: false,
  error: null,
};

export const salariesSlice = createSlice({
  name: "salaries",
  initialState,
  reducers: {
    fetchSalariesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSalariesSuccess: (state, action: PayloadAction<SalaryRecord[]>) => {
      state.loading = false;
      state.salaries = action.payload;
    },
    fetchSalariesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createSalaryRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createSalarySuccess: (state, action: PayloadAction<SalaryRecord>) => {
      state.loading = false;
      state.salaries.push(action.payload);
    },
    createSalaryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSalaryRequest: (state, _action: PayloadAction<{ id: string; sal: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateSalarySuccess: (state, action: PayloadAction<SalaryRecord>) => {
      state.loading = false;
      const index = state.salaries.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.salaries[index] = action.payload;
      }
    },
    updateSalaryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSalaryRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSalarySuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.salaries = state.salaries.filter((s) => s.id !== action.payload);
    },
    deleteSalaryFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchSalariesRequest,
  fetchSalariesSuccess,
  fetchSalariesFailure,
  createSalaryRequest,
  createSalarySuccess,
  createSalaryFailure,
  updateSalaryRequest,
  updateSalarySuccess,
  updateSalaryFailure,
  deleteSalaryRequest,
  deleteSalarySuccess,
  deleteSalaryFailure,
} = salariesSlice.actions;

export default salariesSlice.reducer;
