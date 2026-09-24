import type { SalaryRecord } from "../../types";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalariesState {
  salaries: SalaryRecord[];
  meta?: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}
