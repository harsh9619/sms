import type { FeeRecord } from "../../types";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FeesState {
  fees: FeeRecord[];
  meta?: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}
