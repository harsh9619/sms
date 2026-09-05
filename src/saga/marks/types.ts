import type { MarkRecord } from "../../types";

export interface MarksState {
  marks: MarkRecord[];
  loading: boolean;
  error: string | null;
}
