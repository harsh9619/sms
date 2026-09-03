import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { NoticeRecord } from "../../types";

interface NoticesState {
  notices: NoticeRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: NoticesState = {
  notices: [],
  loading: false,
  error: null,
};

export const noticesSlice = createSlice({
  name: "notices",
  initialState,
  reducers: {
    fetchNoticesRequest: (state, _action: PayloadAction<string | undefined>) => {
      state.loading = true;
      state.error = null;
    },
    fetchNoticesSuccess: (state, action: PayloadAction<NoticeRecord[]>) => {
      state.loading = false;
      state.notices = action.payload;
    },
    fetchNoticesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createNoticeRequest: (state, _action: PayloadAction<any>) => {
      state.loading = true;
      state.error = null;
    },
    createNoticeSuccess: (state, action: PayloadAction<NoticeRecord>) => {
      state.loading = false;
      state.notices.push(action.payload);
    },
    createNoticeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateNoticeRequest: (state, _action: PayloadAction<{ id: string; n: any }>) => {
      state.loading = true;
      state.error = null;
    },
    updateNoticeSuccess: (state, action: PayloadAction<NoticeRecord>) => {
      state.loading = false;
      const index = state.notices.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.notices[index] = action.payload;
      }
    },
    updateNoticeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteNoticeRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteNoticeSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.notices = state.notices.filter((n) => n.id !== action.payload);
    },
    deleteNoticeFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchNoticesRequest,
  fetchNoticesSuccess,
  fetchNoticesFailure,
  createNoticeRequest,
  createNoticeSuccess,
  createNoticeFailure,
  updateNoticeRequest,
  updateNoticeSuccess,
  updateNoticeFailure,
  deleteNoticeRequest,
  deleteNoticeSuccess,
  deleteNoticeFailure,
} = noticesSlice.actions;

export default noticesSlice.reducer;
