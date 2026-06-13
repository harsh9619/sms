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
  schoolIds?: string[];
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

// ==================== Student Types ====================
export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  avatar?: string;
  admissionDate: string;
  bloodGroup?: string;
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
}

// ==================== Class Types ====================
export interface ClassInfo {
  id: string;
  name: string;
  section: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  subjects: string[];
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
  feeType: "tuition" | "transport" | "uniform" | "examination" | "other";
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  remarks?: string;
}

// ==================== Salary Types ====================
export interface SalaryRecord {
  id: string;
  teacherId: string;
  teacherName: string;
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

