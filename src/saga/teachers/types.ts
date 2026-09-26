import type { Teacher } from "../../types";

export interface RoleMaster {
  roleId: number;
  roleName?: string;
  label?: string;
  description?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchTeacherRequestPayload {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FetchTeacherSuccessPayload {
  data: Teacher[];
  meta: PaginationMeta;
}

export interface FetchTeacherFailurePayload {
  fetchTeacherSuccess: boolean | null;
  fetchTeacherMsg: string | null;
}

export interface CreateTeacherRequestPayload {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  avatar_url?: string;
  subject?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  address?: string;
  salary?: number;
  status?: boolean;
  roleId?: number | string;
  role?: string;
}

export interface CreateTeacherSuccessPayload {
  teacher: Teacher;
}

export interface CreateTeacherFailurePayload {
  addEditTeacherSuccess: boolean | null;
  addEditTeacherMsg: string | null;
}

export interface UpdateTeacherRequestPayload extends Partial<CreateTeacherRequestPayload> {
  id: string;
}

export interface UpdateTeacherSuccessPayload {
  teacher: Teacher;
}

export interface UpdateTeacherFailurePayload {
  addEditTeacherSuccess: boolean | null;
  addEditTeacherMsg: string | null;
}

export interface DeleteTeacherRequestPayload {
  id: string;
}

export interface DeleteTeacherSuccessPayload {
  id: string;
}

export interface DeleteTeacherFailurePayload {
  deleteTeacherSuccess: boolean | null;
  deleteTeacherMsg: string | null;
}

export interface BulkCreateTeachersRequestPayload {
  teachers: Array<{
    name: string;
    email: string;
    phone?: string;
  }>;
}

export interface BulkCreateTeachersSuccessPayload {
  addedCount: number;
  skippedCount: number;
  errors: Array<{ email: string; reason: string }>;
}

export interface TeachersState {
  teachers: Teacher[];
  meta: PaginationMeta;
  loading: boolean;
  fetchTeacherSuccess: boolean | null;
  fetchTeacherMsg: string | null;
  deleteTeacherSuccess: boolean | null;
  deleteTeacherMsg: string | null;
  addEditTeacherSuccess: boolean | null;
  addEditTeacherMsg: string | null;
}

export interface TeachersContainerProps {
  teachers: Teacher[];
  meta: PaginationMeta;
  loading: boolean;
  fetchTeacherSuccess: boolean | null;
  fetchTeacherMsg: string | null;
  deleteTeacherSuccess: boolean | null;
  deleteTeacherMsg: string | null;
  addEditTeacherSuccess: boolean | null;
  addEditTeacherMsg: string | null;
  page: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  setPage: (val: number) => void;
  limit: number;
  setLimit: (val: number) => void;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  showDetail: Teacher | null;
  setShowDetail: (val: Teacher | null) => void;
  editingTeacher: Teacher | null;
  formData: Partial<Teacher>;
  setFormData: (val: Partial<Teacher>) => void;
  fetchTeachersRequest: (params?: FetchTeacherRequestPayload) => void;
  createTeacherRequest: (payload: CreateTeacherRequestPayload) => void;
  updateTeacherRequest: (payload: UpdateTeacherRequestPayload) => void;
  deleteTeacherRequest: (payload: DeleteTeacherRequestPayload) => void;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (teacher: Teacher) => void;
}

export interface TeachersUIProps {
  teachers: Teacher[];
  meta: PaginationMeta;
  loading: boolean;
  error?: any;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  page: number;
  setPage: (val: number) => void;
  limit: number;
  setLimit: (val: number) => void;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  showDetail: Teacher | null;
  setShowDetail: (val: Teacher | null) => void;
  editingTeacher: Teacher | null;
  formData: Partial<Teacher>;
  setFormData: (val: Partial<Teacher>) => void;
  getInitials: (name: string) => string;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (teacher: Teacher) => void;
  handleExportExcel: () => void;
  handleRefresh?: () => void;
}
