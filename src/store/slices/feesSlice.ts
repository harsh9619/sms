import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FeeRecord } from "../../types";

interface FeesState {
  fees: FeeRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: FeesState = {
  fees: [],
  loading: false,
  error: null,
};

export const feesSlice = createSlice({
  name: "fees",
  initialState,
  reducers: {
    fetchFeesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFeesSuccess: (state, action: PayloadAction<FeeRecord[]>) => {
      state.loading = false;
      state.fees = action.payload;
    },
    fetchFeesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createFeeRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createFeeSuccess: (state, action: PayloadAction<FeeRecord>) => {
      state.loading = false;
      state.fees.push(action.payload);
    },
    createFeeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateFeeRequest: (state, _action: PayloadAction<{ id: string; fee: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateFeeSuccess: (state, action: PayloadAction<FeeRecord>) => {
      state.loading = false;
      const index = state.fees.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.fees[index] = action.payload;
      }
    },
    updateFeeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteFeeRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteFeeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.fees = state.fees.filter((f) => f.id !== action.payload);
    },
    deleteFeeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchFeesRequest,
  fetchFeesSuccess,
  fetchFeesFailure,
  createFeeRequest,
  createFeeSuccess,
  createFeeFailure,
  updateFeeRequest,
  updateFeeSuccess,
  updateFeeFailure,
  deleteFeeRequest,
  deleteFeeSuccess,
  deleteFeeFailure,
} = feesSlice.actions;

export default feesSlice.reducer;
