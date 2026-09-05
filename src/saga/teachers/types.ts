import type { Teacher } from "../../types";

export interface TeachersState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;
}
