import type { ClassInfo } from "../../types";
import type { SubjectItem } from "../../Services/classSubject.service";

export interface ConfigTeacher {
  id: string;
  name: string;
  email?: string;
  subject?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FetchSubjectTeacherConfigParams {
  page?: number;
  limit?: number;
  classId?: string;
  division?: string;
  teacherId?: string;
  status?: string;
  subjectName?: string;
  search?: string;
}

export interface SubjectTeacherConfigState {
  subjects: SubjectItem[];
  teachers: ConfigTeacher[];
  classesList: ClassInfo[];
  assignments: Record<string, string>;
  meta: PaginationMeta;
  loading: boolean;
  savingSubjectId: string | null;
  savingAll: boolean;
  successMsg: string | null;
  error: string | null;
}

export interface AssignSubjectTeacherPayload {
  classSubjectId: string;
  teacherId: string | null;
}

export interface AssignSubjectTeacherSuccessPayload {
  classSubjectId: string;
  teacherId: string | null;
  teacherName?: string;
}

export interface SubjectTeacherConfigUIProps {
  subjects: SubjectItem[];
  filteredSubjects: SubjectItem[];
  paginatedSubjects: SubjectItem[];
  teachers: ConfigTeacher[];
  classesList: ClassInfo[];
  assignments: Record<string, string>;
  loading: boolean;
  savingSubjectId: string | null;
  savingAll: boolean;
  successMsg: string | null;
  error: string | null;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  meta: PaginationMeta;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedClassId: string;
  setSelectedClassId: (val: string) => void;
  selectedDivision: string;
  setSelectedDivision: (val: string) => void;
  selectedSubjectFilter: string;
  setSelectedSubjectFilter: (val: string) => void;
  selectedTeacherFilter: string;
  setSelectedTeacherFilter: (val: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (val: string) => void;
  availableDivisions: string[];
  availableSubjects: string[];
  assignedCount: number;
  unassignedCount: number;
  handleTeacherChange: (classSubjectId: string, teacherId: string) => void;
  handleResetFilters: () => void;
  handleSaveAll?: () => void;
  handleRefresh: () => void;
}

export interface SubjectTeacherConfigContainerProps {
  subjects: SubjectItem[];
  teachers: ConfigTeacher[];
  classesList: ClassInfo[];
  assignments: Record<string, string>;
  meta: PaginationMeta;
  loading: boolean;
  savingSubjectId: string | null;
  savingAll: boolean;
  successMsg: string | null;
  error: string | null;
  fetchSubjectTeacherConfig: (params?: FetchSubjectTeacherConfigParams) => void;
  fetchConfigTeachers: () => void;
  fetchConfigClasses: () => void;
  assignSubjectTeacher: (payload: AssignSubjectTeacherPayload) => void;
}
