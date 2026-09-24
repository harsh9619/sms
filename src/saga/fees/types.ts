import {
  FETCH_FEES_REQUEST,
  FETCH_FEES_SUCCESS,
  FETCH_FEES_FAILURE,
  CREATE_FEE_REQUEST,
  CREATE_FEE_SUCCESS,
  CREATE_FEE_FAILURE,
  UPDATE_FEE_REQUEST,
  UPDATE_FEE_SUCCESS,
  UPDATE_FEE_FAILURE,
  DELETE_FEE_REQUEST,
  DELETE_FEE_SUCCESS,
  DELETE_FEE_FAILURE,
} from "./actionTypes";
import type { FeeRecord } from "../../types";
import type { ClassFeeStructureItem } from "../../Services/fee.service";
import type { FeesUIProps } from "../../components/modules/fees/FeesUI";

// ==================== Pagination & Payload Types ====================
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchFeeRequestPayload {
  schoolId?: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  feeType?: string;
  studentId?: string;
}

export interface FetchFeeSuccessPayload {
  data: FeeRecord[];
  meta: PaginationMeta;
}

export interface CreateFeeRequestPayload {
  studentId?: string;
  studentName?: string;
  rollNumber?: string;
  class?: string;
  section?: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string | null;
  status: string;
  remarks?: string;
  isMultiFee?: boolean;
  selectedFeeItems?: Array<{
    feeType: string;
    label: string;
    amount: string | number;
    selected: boolean;
  }>;
}

export interface UpdateFeeRequestPayload {
  id: string;
  fee: Partial<FeeRecord>;
}

// ==================== Action Interfaces ====================
export interface FetchFeeRequestAction {
  type: typeof FETCH_FEES_REQUEST;
  payload?: FetchFeeRequestPayload;
}

export interface FetchFeeSuccessAction {
  type: typeof FETCH_FEES_SUCCESS;
  payload: FetchFeeSuccessPayload | FeeRecord[];
}

export interface FetchFeeFailureAction {
  type: typeof FETCH_FEES_FAILURE;
  payload: string;
}

export interface CreateFeeRequestAction {
  type: typeof CREATE_FEE_REQUEST;
  payload: CreateFeeRequestPayload;
}

export interface CreateFeeSuccessAction {
  type: typeof CREATE_FEE_SUCCESS;
  payload: FeeRecord;
}

export interface CreateFeeFailureAction {
  type: typeof CREATE_FEE_FAILURE;
  payload: string;
}

export interface UpdateFeeRequestAction {
  type: typeof UPDATE_FEE_REQUEST;
  payload: UpdateFeeRequestPayload;
}

export interface UpdateFeeSuccessAction {
  type: typeof UPDATE_FEE_SUCCESS;
  payload: FeeRecord;
}

export interface UpdateFeeFailureAction {
  type: typeof UPDATE_FEE_FAILURE;
  payload: string;
}

export interface DeleteFeeRequestAction {
  type: typeof DELETE_FEE_REQUEST;
  payload: string;
}

export interface DeleteFeeSuccessAction {
  type: typeof DELETE_FEE_SUCCESS;
  payload: string;
}

export interface DeleteFeeFailureAction {
  type: typeof DELETE_FEE_FAILURE;
  payload: string;
}

export type FeeActions =
  | FetchFeeRequestAction
  | FetchFeeSuccessAction
  | FetchFeeFailureAction
  | CreateFeeRequestAction
  | CreateFeeSuccessAction
  | CreateFeeFailureAction
  | UpdateFeeRequestAction
  | UpdateFeeSuccessAction
  | UpdateFeeFailureAction
  | DeleteFeeRequestAction
  | DeleteFeeSuccessAction
  | DeleteFeeFailureAction;

// ==================== Redux State & Container/UI Component Props ====================
export interface FeesState {
  fees: FeeRecord[];
  meta?: PaginationMeta | null;
  loading: boolean;
  error: string | null;
}

export interface FeesContainerProps {
  allFees: FeeRecord[];
  meta?: PaginationMeta | null;
  students: any[];
  classes: any[];
  loading: boolean;
  error: string | null;
  fetchFeesRequest: (payload?: FetchFeeRequestPayload) => void;
  fetchStudentsRequest: (payload?: any) => void;
  fetchClassesRequest: () => void;
  createFeeRequest: (fee: any) => void;
  updateFeeRequest: (payload: { id: string; fee: any }) => void;
  deleteFeeRequest: (id: string) => void;
  isMyFees?: boolean;
}

export type { FeesUIProps, ClassFeeStructureItem, FeeRecord };
