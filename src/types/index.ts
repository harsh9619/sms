// ==================== User & Auth Types ====================
export type UserRole = "admin" | "teacher" | "student";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  joinDate: string;
  schoolId: string;
  // Teacher-specific
  subject?: string;
  department?: string;
  // Student-specific
  class?: string;
  section?: string;
  rollNumber?: string;
  parentName?: string;
  parentPhone?: string;
}

// ==================== Master Types ====================
export interface CasteMaster {
  id: number;
  name: string;
  code: string;
  description?: string;
}

// ==================== Student Types ====================
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
  caste_master_id?: number | null;
  caste_name?: string;
  caste_code?: string;
  caste_category?: string;
  registration_no?: string;
  academic_year?: string;
  aadhar_no?: string;
  medium?: string;
  father_name?: string;
  father_occupation?: string;
  father_qualification?: string;
  mother_name?: string;
  mother_occupation?: string;
  mother_qualification?: string;
  whatsapp_no?: string;
  scholar_no?: string;
  roll_no: string;
  dob: string;
  gender: string;
  blood_group: string;
  address: string;
  guardian_name: string;
  guardian_phone: string;
  parent_name: string;
  parent_phone: string;
  admission_date: string;
  created_at: string;
  updated_at?: string;
}

export interface RoleMaster {
  roleId: number;
  roleName: string;
  label: string;
  description?: string;
}

// ==================== Teacher Types ====================
export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  department: string;
  qualification: string;
  experience: string;
  address: string;
  avatar?: string;
  joinDate: string;
  salary?: number;
  status: boolean;
  roleId?: number;
  roleName?: string;
}

export interface BulkUploadError {
  email: string;
  reason: string;
}

export interface BulkUploadResult {
  addedCount: number;
  skippedCount: number;
  errors: BulkUploadError[];
}

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

// ==================== Attendance Types ====================
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  date: string;
  status: "present" | "absent" | "late";
  markedBy: string;
  markedAt: string;
}

export interface AttendanceSheet {
  id: string;
  class: string;
  section: string;
  date: string;
  records: AttendanceRecord[];
  uploadedImage?: string;
  processedAt?: string;
}

// ==================== Dashboard Stats ====================
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceRate: number;
  newAdmissions: number;
  upcomingEvents: number;
}

// ==================== Fee Types ====================
export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  feeType: string;
  amount: number;
  dueDate: string;
  month?: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  remarks?: string;
}

// ==================== Salary Types ====================
export interface SalaryRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherEmail?: string;
  teacherPhone?: string;
  subject: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  month: string;
  year: number;
  status: "pending" | "paid" | "processing";
  paidDate?: string;
  remarks?: string;
}

// ==================== Theme Types ====================
export type ThemeName = "default" | "emerald" | "purple" | "rose" | "amber";
export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  name: ThemeName;
  label: string;
  color: string;
}

export const THEMES: ThemeConfig[] = [
  { name: "default", label: "Ocean Blue", color: "#3b82f6" },
  { name: "emerald", label: "Emerald", color: "#10b981" },
  { name: "purple", label: "Royal Purple", color: "#8b5cf6" },
  { name: "rose", label: "Rose", color: "#f43f5e" },
  { name: "amber", label: "Sunset Amber", color: "#f97316" },
];

// ==================== New Modules Types ====================

export interface TimetableSlot {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  section: string;
  subjectId: string;
  subjectName: string;
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";
  startTime: string;
  endTime: string;
  classroom?: string;
  teacherId?: string;
  teacherName?: string;
}

export interface HomeworkRecord {
  id: string;
  schoolId: string;
  classId: string;
  className: string;
  section: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
}

export interface NoticeRecord {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  audience: "all" | "teacher" | "student";
  isPinned: boolean;
  createdBy?: string;
  creatorName?: string;
  createdAt: string;
}

export interface MarkRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  subjectName: string;
  examType: "unit_test" | "midterm" | "final" | "assignment" | "practical";
  score: number;
  maxScore: number;
  examDate?: string;
  enteredBy?: string;
  createdAt?: string;
}
export type { School, AcademicYearItem } from "../context/SchoolContext";
