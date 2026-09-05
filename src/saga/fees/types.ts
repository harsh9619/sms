import type { FeeRecord } from "../../types";

export interface FeesState {
  fees: FeeRecord[];
  loading: boolean;
  error: string | null;
}
