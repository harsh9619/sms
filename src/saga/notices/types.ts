import type { NoticeRecord } from "../../types";

export interface NoticesState {
  notices: NoticeRecord[];
  loading: boolean;
  error: string | null;
}
