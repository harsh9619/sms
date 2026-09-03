import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, UserRole } from "../../types";

interface AuthState {
  user: User | null;
  token: string | null;
  simulatedRole: UserRole | null;
  allUsers: User[];
  loading: boolean;
  error: string | null;
}

const initialUserStr = localStorage.getItem("sms_user");
const initialToken = localStorage.getItem("sms_token");
const initialSimulatedRole = (localStorage.getItem("sms_simulated_role") as UserRole) || null;

const initialState: AuthState = {
  user: initialUserStr ? JSON.parse(initialUserStr) : null,
  token: initialToken,
  simulatedRole: initialSimulatedRole,
  allUsers: [],
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state, _action: PayloadAction<{ email: string; password: string }>) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      localStorage.setItem("sms_user", JSON.stringify(action.payload.user));
      localStorage.setItem("sms_token", action.payload.token);
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCurrentUserRequest: (state) => {
      state.loading = true;
    },
    fetchCurrentUserSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.user = action.payload;
      localStorage.setItem("sms_user", JSON.stringify(action.payload));
    },
    fetchCurrentUserFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
      localStorage.removeItem("sms_user");
      localStorage.removeItem("sms_token");
    },
    fetchAllUsersRequest: (state) => {
      state.loading = true;
    },
    fetchAllUsersSuccess: (state, action: PayloadAction<User[]>) => {
      state.loading = false;
      state.allUsers = action.payload;
    },
    fetchAllUsersFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSimulatedRole: (state, action: PayloadAction<UserRole | null>) => {
      state.simulatedRole = action.payload;
      if (action.payload) {
        localStorage.setItem("sms_simulated_role", action.payload);
      } else {
        localStorage.removeItem("sms_simulated_role");
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.simulatedRole = null;
      state.error = null;
      localStorage.removeItem("sms_user");
      localStorage.removeItem("sms_token");
      localStorage.removeItem("sms_simulated_role");
      localStorage.removeItem("sms_active_school_id");
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  fetchCurrentUserRequest,
  fetchCurrentUserSuccess,
  fetchCurrentUserFailure,
  fetchAllUsersRequest,
  fetchAllUsersSuccess,
  fetchAllUsersFailure,
  setSimulatedRole,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
