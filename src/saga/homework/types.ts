import type { HomeworkRecord } from "../../types";

export interface HomeworkState {
  homework: HomeworkRecord[];
  loading: boolean;
  error: string | null;
}
