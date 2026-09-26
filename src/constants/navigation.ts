import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  UserCheck,
  ClipboardCheck,
  Calendar,
  ClipboardList,
  Award,
  Megaphone,
  CreditCard,
  Coins,
  BarChart3,
  DollarSign,
  PlusCircle,
  Layers,
  Settings,
  LucideIcon,
  IndianRupee,
} from "lucide-react";

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  roles: string[];
  moduleKey: string;
}

export type ACFAction = "read" | "create" | "update" | "delete" | "export";

export interface ACFModuleConfig {
  roles: string[];
  permissions: Record<string, ACFAction[]>; // e.g. { admin: ['read', 'create', 'update', 'delete', 'export'], teacher: ['read', 'export'] }
}

export const ROLE_ACF_MATRIX: Record<string, Record<string, ACFAction[]>> = {
  admin: {
    dashboard: ["read", "create", "update", "delete", "export"],
    students: ["read", "create", "update", "delete", "export"],
    teachers: ["read", "create", "update", "delete", "export"],
    users: ["read", "create", "update", "delete", "export"],
    classes: ["read", "create", "update", "delete", "export"],
    "subject-teacher-config": ["read", "create", "update", "delete", "export"],
    attendance: ["read", "create", "update", "delete", "export"],
    timetable: ["read", "create", "update", "delete", "export"],
    "reports/fees": ["read", "create", "update", "delete", "export"],
    "reports/salaries": ["read", "create", "update", "delete", "export"],
    "schools/create": ["read", "create", "update", "delete", "export"],
    "class-subject-config": ["read", "create", "update", "delete", "export"],
    settings: ["read", "create", "update", "delete", "export"],
  },
  principal: {
    dashboard: ["read", "export"],
    students: ["read", "create", "update", "export"],
    teachers: ["read", "export"],
    users: ["read", "export"],
    classes: ["read", "create", "update", "export"],
    "subject-teacher-config": ["read", "create", "update", "export"],
    attendance: ["read", "create", "update", "export"],
    timetable: ["read", "create", "update", "export"],
    "my-salary": ["read", "export"],
    "reports/fees": ["read", "export"],
    "reports/salaries": ["read", "export"],
  },
  teacher: {
    dashboard: ["read"],
    students: ["read", "export"],
    classes: ["read"],
    "subject-teacher-config": ["read"],
    attendance: ["read", "create", "update", "export"],
    timetable: ["read"],
    "my-salary": ["read", "export"],
  },
  student: {
    dashboard: ["read"],
    timetable: ["read"],
    "my-fees": ["read", "export"],
  },
  parent: {
    dashboard: ["read"],
    timetable: ["read"],
    "my-fees": ["read", "export"],
  },
};

export const navItems: NavItem[] = [
  { path: "/dashboard", moduleKey: "dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/students", moduleKey: "students", icon: GraduationCap, label: "Students Details", roles: ["admin", "teacher", "principal"] },
  { path: "/teachers", moduleKey: "teachers", icon: Users, label: "Teachers Details", roles: ["admin", "principal"] },
  { path: "/users", moduleKey: "users", icon: Users, label: "Users Details", roles: ["admin", "principal"] },
  { path: "/classes", moduleKey: "classes", icon: BookOpen, label: "Class Teacher Allocation", roles: ["admin", "teacher", "principal"] },
  { path: "/subject-teacher-config", moduleKey: "subject-teacher-config", icon: UserCheck, label: "Subject Teacher Allocation", roles: ["admin", "principal"] },
  { path: "/attendance", moduleKey: "attendance", icon: ClipboardCheck, label: "Attendance", roles: ["admin", "teacher", "principal"] },
  { path: "/timetable", moduleKey: "timetable", icon: Calendar, label: "Timetable", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/my-fees", moduleKey: "my-fees", icon: IndianRupee, label: "Fees", roles: ["student", "parent"] },
  { path: "/my-salary", moduleKey: "my-salary", icon: Coins, label: "Salary", roles: ["teacher", "principal"] },
  { path: "/reports/fees", moduleKey: "reports/fees", icon: IndianRupee, label: "Fee Management", roles: ["admin", "principal"] },
  { path: "/reports/salaries", moduleKey: "reports/salaries", icon: Coins, label: "Salary Management", roles: ["admin", "principal"] },
  { path: "/schools/create", moduleKey: "schools/create", icon: PlusCircle, label: "New School", roles: ["admin"] },
  { path: "/class-subject-config", moduleKey: "class-subject-config", icon: Layers, label: "Class Subject Allocation", roles: ["admin"] },
  { path: "/settings", moduleKey: "settings", icon: Settings, label: "Settings", roles: ["admin"] },
];

export function normalizeRole(role?: string): string {
  const r = (role || "").toLowerCase();
  return r === "super_admin" || r === "school_admin" ? "admin" : r;
}

export function getRolesForPath(path: string): string[] | undefined {
  const item = navItems.find((n) => n.path === path);
  return item?.roles;
}

export function hasModuleAccess(role: string | undefined, moduleKey: string): boolean {
  if (!role) return false;
  const normRole = normalizeRole(role);
  const userPerms = ROLE_ACF_MATRIX[normRole];
  if (!userPerms) return false;
  return Boolean(userPerms[moduleKey] && userPerms[moduleKey].includes("read"));
}

export function hasPermission(role: string | undefined, moduleKey: string, action: ACFAction): boolean {
  if (!role) return false;
  const normRole = normalizeRole(role);
  const userPerms = ROLE_ACF_MATRIX[normRole];
  if (!userPerms || !userPerms[moduleKey]) return false;
  return userPerms[moduleKey].includes(action);
}
