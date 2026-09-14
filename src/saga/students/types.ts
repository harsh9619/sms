import {
  FETCH_STUDENTS_REQUEST,
  FETCH_STUDENTS_SUCCESS,
  FETCH_STUDENTS_FAILURE,
  CREATE_STUDENT_REQUEST,
  CREATE_STUDENT_SUCCESS,
  CREATE_STUDENT_FAILURE,
  UPDATE_STUDENT_REQUEST,
  UPDATE_STUDENT_SUCCESS,
  UPDATE_STUDENT_FAILURE,
  DELETE_STUDENT_REQUEST,
  DELETE_STUDENT_SUCCESS,
  DELETE_STUDENT_FAILURE,
} from "./actionTypes";


// ==================== Class Types ====================
export interface DivisionInfo {
  id: string;
  name: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
}

export interface ClassInfo {
  id: string;
  schoolClassId?: string;
  name: string;
  section?: string;
  division?: string;
  divisions: DivisionInfo[];
  teacherId?: string | null;
  teacherName?: string | null;
  studentCount?: number;
  subjects: SubjectInfo[];
  schoolId?: string;
  academicYearId?: string;
  academicYear?: string;
  classMasterId?: string;
}

export interface StudentsContainerProps {
  students: Student[];
  meta: PaginationMeta;
  loading: boolean;
  fetchStudentSuccess: boolean | null;
  fetchStudentMsg: string | null;
  deleteStudentSuccess: boolean | null;
  deleteStudentMsg: string | null;
  addEditStudentSuccess: boolean | null;
  addEditStudentMsg: string | null;
  page: number;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  selectedSection: string;
  setSelectedSection: (val: string) => void;
  setPage: (val: number) => void;
  limit: number;
  setLimit: (val: number) => void;
  classes: ClassInfo[];
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  showDetail: Student | null;
  setShowDetail: (val: Student | null) => void;
  editingStudent: Student | null;
  formData: Partial<Student>;
  setFormData: (val: Partial<Student>) => void;
  fetchStudentsRequest: (params?: FetchStudentRequestPayload) => void;
  createStudentRequest: (student: CreateStudentRequestPayload) => void;
  updateStudentRequest: (payload: UpdateStudentRequestPayload) => void;
  deleteStudentRequest: (payload: DeleteStudentRequestPayload) => void;
  fetchClassesRequest: () => void;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (student: Student) => void;
}

export interface StudentsUIProps {
  students: Student[];
  meta: PaginationMeta;
  loading: boolean;
  error?: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  selectedSection: string;
  setSelectedSection: (val: string) => void;
  page: number;
  setPage: (val: number) => void;
  limit: number;
  setLimit: (val: number) => void;
  classes: ClassInfo[];
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  showDetail: Student | null;
  setShowDetail: (val: Student | null) => void;
  editingStudent: Student | null;
  formData: Partial<Student>;
  setFormData: (val: Partial<Student>) => void;
  handleSave: () => void;
  handleDelete: (id: string) => void;
  handleOpenAddModal: () => void;
  handleOpenEditModal: (student: Student) => void;
}

export interface Student {
  id: string;
  school_id: string;
  user_id: number | null;
  name: string;
  email: string;
  phone: string;
  class_id: number | null;
  class_name: string;
  division_master_id: number | null;
  division_name: string;
  section: string;
  roll_no: string;
  dob: string,
  gender: string;
  blood_group: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  parent_name: string;
  parent_phone: string;
  admission_date: string;
  created_at: string;
}


export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


export interface FetchStudentRequestPayload {
  page: number;
  limit: number;
  search?: string;
  classId?: string;
  divisionId?: string;
}

export interface FetchStudentSuccessPayload {
  data: Student[];
  meta: PaginationMeta;
}

export interface FetchStudentFailurePayload {
  fetchStudentSuccess: boolean | null;
  fetchStudentMsg: string | null;
}

export interface FetchStudentRequest {
  type: typeof FETCH_STUDENTS_REQUEST;
  payload: FetchStudentRequestPayload;
}

export interface FetchStudentSuccess {
  type: typeof FETCH_STUDENTS_SUCCESS;
  payload: FetchStudentSuccessPayload;
}

export interface FetchStudentFailure {
  type: typeof FETCH_STUDENTS_FAILURE;
  payload: FetchStudentFailurePayload;
}

// Create Student Types
export interface CreateStudentRequestPayload {
  studentData: Partial<Student>;
}

export interface CreateStudentSuccessPayload {
  student: Student;
}

export interface CreateStudentFailurePayload {
  addEditStudentSuccess: boolean | null;
  addEditStudentMsg: string | null;
}

export interface CreateStudentRequest {
  type: typeof CREATE_STUDENT_REQUEST;
  payload: CreateStudentRequestPayload;
}

export interface CreateStudentSuccess {
  type: typeof CREATE_STUDENT_SUCCESS;
  payload: CreateStudentSuccessPayload;
}

export interface CreateStudentFailure {
  type: typeof CREATE_STUDENT_FAILURE;
  payload: CreateStudentFailurePayload;
}

// Update Student Types
export interface UpdateStudentRequestPayload {
  id: string;
  studentData: Partial<Student>;
}

export interface UpdateStudentSuccessPayload {
  student: Student;
}

export interface UpdateStudentFailurePayload {
  addEditStudentSuccess: boolean | null;
  addEditStudentMsg: string | null;
}

export interface UpdateStudentRequest {
  type: typeof UPDATE_STUDENT_REQUEST;
  payload: UpdateStudentRequestPayload;
}

export interface UpdateStudentSuccess {
  type: typeof UPDATE_STUDENT_SUCCESS;
  payload: UpdateStudentSuccessPayload;
}

export interface UpdateStudentFailure {
  type: typeof UPDATE_STUDENT_FAILURE;
  payload: UpdateStudentFailurePayload;
}

// Delete Student Types
export interface DeleteStudentRequestPayload {
  id: string;
}

export interface DeleteStudentSuccessPayload {
  id: string;
}

export interface DeleteStudentFailurePayload {
  deleteStudentSuccess: boolean | null;
  deleteStudentMsg: string | null;
}

export interface DeleteStudentRequest {
  type: typeof DELETE_STUDENT_REQUEST;
  payload: DeleteStudentRequestPayload;
}

export interface DeleteStudentSuccess {
  type: typeof DELETE_STUDENT_SUCCESS;
  payload: DeleteStudentSuccessPayload;
}

export interface DeleteStudentFailure {
  type: typeof DELETE_STUDENT_FAILURE;
  payload: DeleteStudentFailurePayload;
}

export interface StudentState {
  students: Student[];
  meta: PaginationMeta;
  loading: boolean;
  fetchStudentSuccess: boolean | null;
  fetchStudentMsg: string | null;
  deleteStudentSuccess: boolean | null;
  deleteStudentMsg: string | null;
  addEditStudentSuccess: boolean | null;
  addEditStudentMsg: string | null;
}

// Student Action Types Union
export type StudentActionTypes =
  | FetchStudentRequest
  | FetchStudentSuccess
  | FetchStudentFailure
  | CreateStudentRequest
  | CreateStudentSuccess
  | CreateStudentFailure
  | UpdateStudentRequest
  | UpdateStudentSuccess
  | UpdateStudentFailure
  | DeleteStudentRequest
  | DeleteStudentSuccess
  | DeleteStudentFailure;

