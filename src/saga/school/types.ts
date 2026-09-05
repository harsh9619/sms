import type { School } from "../../context/SchoolContext";

export interface SchoolState {
  schools: School[];
  activeSchool: School | null;
  loading: boolean;
  error: string | null;
}
