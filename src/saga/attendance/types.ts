import type { AttendanceRecord, Student } from "../../types";
import { ClassInfo } from "../students/types";
import * as types from "./actionTypes";

export interface AttendanceState {
  records: AttendanceRecord[];
  myAttendance: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  saveSuccess: boolean | null;
  saveMsg: string | null;
}

export interface FetchAttendanceRequestPayload {
  schoolId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  classId?: string;
  divisionId?: string;
  status?: string;
  search?: string;
  academicYear?: string;
}

export interface SaveAttendanceRequestPayload {
  schoolId?: string;
  records: Array<{
    studentId: string;
    classId?: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    remarks?: string;
    markedBy?: string;
  }>;
}

export interface FetchMyAttendanceRequestPayload {
  schoolId?: string;
  studentId: string;
  month?: string;
  year?: string;
}

// Action Interfaces
export interface FetchAttendanceRequestAction {
  type: typeof types.FETCH_ATTENDANCE_REQUEST;
  payload?: FetchAttendanceRequestPayload;
}

export interface FetchAttendanceSuccessAction {
  type: typeof types.FETCH_ATTENDANCE_SUCCESS;
  payload: AttendanceRecord[];
}

export interface FetchAttendanceFailureAction {
  type: typeof types.FETCH_ATTENDANCE_FAILURE;
  payload: string;
}

export interface SaveAttendanceRequestAction {
  type: typeof types.SAVE_ATTENDANCE_REQUEST;
  payload: SaveAttendanceRequestPayload;
}

export interface SaveAttendanceSuccessAction {
  type: typeof types.SAVE_ATTENDANCE_SUCCESS;
  payload: AttendanceRecord[];
}

export interface SaveAttendanceFailureAction {
  type: typeof types.SAVE_ATTENDANCE_FAILURE;
  payload: string;
}

export interface FetchMyAttendanceRequestAction {
  type: typeof types.FETCH_MY_ATTENDANCE_REQUEST;
  payload: FetchMyAttendanceRequestPayload;
}

export interface FetchMyAttendanceSuccessAction {
  type: typeof types.FETCH_MY_ATTENDANCE_SUCCESS;
  payload: AttendanceRecord[];
}

export interface FetchMyAttendanceFailureAction {
  type: typeof types.FETCH_MY_ATTENDANCE_FAILURE;
  payload: string;
}

export type AttendanceActionTypes =
  | FetchAttendanceRequestAction
  | FetchAttendanceSuccessAction
  | FetchAttendanceFailureAction
  | SaveAttendanceRequestAction
  | SaveAttendanceSuccessAction
  | SaveAttendanceFailureAction
  | FetchMyAttendanceRequestAction
  | FetchMyAttendanceSuccessAction
  | FetchMyAttendanceFailureAction;

// Container & UI Props Interfaces
export interface AttendanceUIProps {
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  classes: ClassInfo[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "present" | "absent" | "late";
  setStatusFilter: (status: "all" | "present" | "absent" | "late") => void;
  filterDate: string;
  setFilterDate: (date: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  datePreset: string;
  setDatePreset: (preset: string) => void;
  filterClass: string;
  setFilterClass: (cls: string) => void;
  selectedDivision: string;
  setSelectedDivision: (div: string) => void;
  activeTab: "records" | "manual";
  setActiveTab: (tab: "records" | "manual") => void;
  manualAttendance: Record<string, "present" | "absent" | "late">;
  setManualAttendance: React.Dispatch<React.SetStateAction<Record<string, "present" | "absent" | "late">>>;
  handleManualSave: () => void;
  handleExportExcel: () => void;
  showBulkUpload: boolean;
  setShowBulkUpload: (show: boolean) => void;
  handleBulkImport: (records: AttendanceRecord[]) => void;
  importStatus: { visible: boolean; success: boolean; message: string };
  setImportStatus: React.Dispatch<React.SetStateAction<{ visible: boolean; success: boolean; message: string }>>;
}

export interface MyAttendanceUIProps {
  myAttendance: AttendanceRecord[];
  loading: boolean;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  totalDays: number;
  attendancePercentage: number;
}
