export interface ClassTeacherConfigItem {
  id: string | number;
  classTeacherId?: string | number;
  schoolId?: string | number;
  schoolAcademicYearId?: string | number;
  classId: string | number;
  className: string;
  divisionId?: string | number;
  divisionName?: string;
  classDivision?: string;
  classSection?: string;
  teacherId?: string | number | null;
  teacherName?: string | null;
  isPrimary?: boolean;
}

export interface ClassTeacherConfigState {
  classTeachers: ClassTeacherConfigItem[];
  classesList: any[];
  teachers: any[];
  loading: boolean;
  savingClassTeacherId: string | number | null;
  successMsg: string | null;
  error: string | null;
}

export interface ClassTeacherConfigUIProps {
  classTeachers: ClassTeacherConfigItem[];
  filteredClassTeachers: ClassTeacherConfigItem[];
  paginatedClassTeachers: ClassTeacherConfigItem[];
  teachers: any[];
  classesList: any[];
  assignments: Record<string, string>;
  loading: boolean;
  savingClassTeacherId: string | number | null;
  successMsg: string | null;
  error: string | null;

  page: number;
  setPage: (p: number) => void;
  limit: number;
  setLimit: (l: number) => void;
  totalItems: number;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedDivision: string;
  setSelectedDivision: (div: string) => void;
  selectedTeacherFilter: string;
  setSelectedTeacherFilter: (t: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (s: string) => void;

  availableDivisions: string[];
  assignedCount: number;
  unassignedCount: number;

  handleTeacherChange: (id: string | number, teacherId: string) => void;
  handleResetFilters: () => void;
  handleRefresh: () => void;
}
