import type { Student } from "../../types";

export interface StudentsState {
  students: Student[];
  loading: boolean;
  error: string | null;
}
