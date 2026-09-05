import type { ClassInfo } from "../../types";

export interface ClassesState {
  classes: ClassInfo[];
  loading: boolean;
  error: string | null;
}
