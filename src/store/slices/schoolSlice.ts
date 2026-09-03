import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { School } from "../../context/SchoolContext";

interface SchoolState {
  schools: School[];
  activeSchool: School | null;
  loading: boolean;
  error: string | null;
}

const initialState: SchoolState = {
  schools: [],
  activeSchool: null,
  loading: false,
  error: null,
};

export const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    fetchSchoolsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSchoolsSuccess: (state, action: PayloadAction<School[]>) => {
      state.loading = false;
      state.schools = action.payload;
    },
    fetchSchoolsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setActiveSchool: (state, action: PayloadAction<School | null>) => {
      state.activeSchool = action.payload;
      if (action.payload) {
        localStorage.setItem("sms_active_school_id", action.payload.id);
        window.dispatchEvent(new Event("sms_active_school_changed"));
      } else {
        localStorage.removeItem("sms_active_school_id");
        window.dispatchEvent(new Event("sms_active_school_changed"));
      }
    },
  },
});

export const {
  fetchSchoolsRequest,
  fetchSchoolsSuccess,
  fetchSchoolsFailure,
  setActiveSchool,
} = schoolSlice.actions;

export default schoolSlice.reducer;
