import type { AttendanceRecord } from "../../types";

export interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}
