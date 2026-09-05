import type { SalaryRecord } from "../../types";

export interface SalariesState {
  salaries: SalaryRecord[];
  loading: boolean;
  error: string | null;
}
