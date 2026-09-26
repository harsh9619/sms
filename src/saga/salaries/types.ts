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
import type { SalaryUIProps } from "../../components/modules/salary/types";

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
  [key: string]: any;
}

export interface FetchSalarySuccessAction {
  type: typeof FETCH_SALARIES_SUCCESS;
  payload: FetchSalarySuccessPayload | SalaryRecord[];
  [key: string]: any;
}

export interface FetchSalaryFailureAction {
  type: typeof FETCH_SALARIES_FAILURE;
  payload: string;
  [key: string]: any;
}

export interface CreateSalaryRequestAction {
  type: typeof CREATE_SALARY_REQUEST;
  payload: CreateSalaryRequestPayload;
  [key: string]: any;
}

export interface CreateSalarySuccessAction {
  type: typeof CREATE_SALARY_SUCCESS;
  payload: SalaryRecord;
  [key: string]: any;
}

export interface CreateSalaryFailureAction {
  type: typeof CREATE_SALARY_FAILURE;
  payload: string;
  [key: string]: any;
}

export interface UpdateSalaryRequestAction {
  type: typeof UPDATE_SALARY_REQUEST;
  payload: UpdateSalaryRequestPayload;
  [key: string]: any;
}

export interface UpdateSalarySuccessAction {
  type: typeof UPDATE_SALARY_SUCCESS;
  payload: SalaryRecord;
  [key: string]: any;
}

export interface UpdateSalaryFailureAction {
  type: typeof UPDATE_SALARY_FAILURE;
  payload: string;
  [key: string]: any;
}

export interface DeleteSalaryRequestAction {
  type: typeof DELETE_SALARY_REQUEST;
  payload: string;
  [key: string]: any;
}

export interface DeleteSalarySuccessAction {
  type: typeof DELETE_SALARY_SUCCESS;
  payload: string;
  [key: string]: any;
}

export interface DeleteSalaryFailureAction {
  type: typeof DELETE_SALARY_FAILURE;
  payload: string;
  [key: string]: any;
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
