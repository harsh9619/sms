import {
  FETCH_SALARIES_REQUEST,
  FETCH_SALARIES_SUCCESS,
  FETCH_SALARIES_FAILURE,
  CREATE_SALARY_REQUEST,
  CREATE_SALARY_SUCCESS,
  CREATE_SALARY_FAILURE,
  UPDATE_SALARY_REQUEST,
  UPDATE_SALARY_SUCCESS,
  UPDATE_SALARY_FAILURE,
  DELETE_SALARY_REQUEST,
  DELETE_SALARY_SUCCESS,
  DELETE_SALARY_FAILURE,
} from "./actionTypes";
import type { SalaryRecord } from "../../types";
import type { StaffSalaryStructureItem } from "../../Services/salary.service";
import type { SalaryUIProps } from "../../components/modules/salary/SalaryUI";

// ==================== Pagination & Payload Types ====================
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchSalaryRequestPayload {
  schoolId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  teacherId?: string;
  academicYear?: string;
}

export interface FetchSalarySuccessPayload {
  data: SalaryRecord[];
  meta: PaginationMeta;
}

export interface CreateSalaryRequestPayload {
  teacherId?: string;
  teacherName?: string;
  subject?: string;
  baseSalary: number;
  allowances?: number;
  deductions?: number;
  month: string | number;
  year: number;
  status: string;
}

export interface UpdateSalaryRequestPayload {
  id: string;
  salary?: Partial<SalaryRecord>;
  sal?: Partial<SalaryRecord>;
}

// ==================== Action Interfaces ====================
export interface FetchSalaryRequestAction {
  type: typeof FETCH_SALARIES_REQUEST;
  payload?: FetchSalaryRequestPayload;
}

export interface FetchSalarySuccessAction {
  type: typeof FETCH_SALARIES_SUCCESS;
  payload: FetchSalarySuccessPayload | SalaryRecord[];
}

export interface FetchSalaryFailureAction {
  type: typeof FETCH_SALARIES_FAILURE;
  payload: string;
}

export interface CreateSalaryRequestAction {
  type: typeof CREATE_SALARY_REQUEST;
  payload: CreateSalaryRequestPayload;
}

export interface CreateSalarySuccessAction {
  type: typeof CREATE_SALARY_SUCCESS;
  payload: SalaryRecord;
}

export interface CreateSalaryFailureAction {
  type: typeof CREATE_SALARY_FAILURE;
  payload: string;
}

export interface UpdateSalaryRequestAction {
  type: typeof UPDATE_SALARY_REQUEST;
  payload: UpdateSalaryRequestPayload;
}

export interface UpdateSalarySuccessAction {
  type: typeof UPDATE_SALARY_SUCCESS;
  payload: SalaryRecord;
}

export interface UpdateSalaryFailureAction {
  type: typeof UPDATE_SALARY_FAILURE;
  payload: string;
}

export interface DeleteSalaryRequestAction {
  type: typeof DELETE_SALARY_REQUEST;
  payload: string;
}

export interface DeleteSalarySuccessAction {
  type: typeof DELETE_SALARY_SUCCESS;
  payload: string;
}

export interface DeleteSalaryFailureAction {
  type: typeof DELETE_SALARY_FAILURE;
  payload: string;
}

export type SalaryActions =
  | FetchSalaryRequestAction
  | FetchSalarySuccessAction
  | FetchSalaryFailureAction
  | CreateSalaryRequestAction
  | CreateSalarySuccessAction
  | CreateSalaryFailureAction
  | UpdateSalaryRequestAction
  | UpdateSalarySuccessAction
  | UpdateSalaryFailureAction
  | DeleteSalaryRequestAction
  | DeleteSalarySuccessAction
  | DeleteSalaryFailureAction;

// ==================== Redux State & Container/UI Component Props ====================
export interface SalariesState {
  salaries: SalaryRecord[];
  meta?: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

export interface SalaryContainerProps {
  allSalaries: SalaryRecord[];
  meta?: PaginationMeta | null;
  teachers: any[];
  loading: boolean;
  error: string | null;
  fetchSalariesRequest: (payload?: FetchSalaryRequestPayload) => void;
  fetchTeachersRequest: () => void;
  createSalaryRequest: (salary: any) => void;
  updateSalaryRequest: (payload: UpdateSalaryRequestPayload) => void;
  deleteSalaryRequest: (id: string) => void;
  isMySalary?: boolean;
}

export type { SalaryUIProps, StaffSalaryStructureItem, SalaryRecord };
