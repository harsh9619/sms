import type { TimetableSlot } from "../../types";

export interface TimetablesState {
  timetables: TimetableSlot[];
  loading: boolean;
  error: string | null;
}
