import type { Student } from "../../types";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentsState {
  students: Student[];
  meta: PaginationMeta;
  loading: boolean;
  error: string | null;
}

