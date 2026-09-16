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
} from "lucide-react";

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  roles: string[];
}

export const navItems: NavItem[] = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/students", icon: GraduationCap, label: "Students Details", roles: ["admin", "teacher", "principal"] },
  { path: "/teachers", icon: Users, label: "Teachers Details", roles: ["admin", "principal"] },
  { path: "/users", icon: Users, label: "Users Details", roles: ["admin", "principal"] },
  { path: "/classes", icon: BookOpen, label: "Class Teacher Allocation", roles: ["admin", "teacher", "principal"] },
  { path: "/subject-teacher-config", icon: UserCheck, label: "Subject Teacher Allocation", roles: ["admin", "teacher", "principal"] },
  { path: "/attendance", icon: ClipboardCheck, label: "Attendance", roles: ["admin", "teacher", "principal"] },
  { path: "/my-attendance", icon: ClipboardCheck, label: "My Attendance", roles: ["student"] },
  { path: "/timetable", icon: Calendar, label: "Timetable", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/homework", icon: ClipboardList, label: "Homework", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/marks", icon: Award, label: "Exams & Marks", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/notices", icon: Megaphone, label: "Notices", roles: ["admin", "teacher", "student", "principal"] },
  { path: "/my-fees", icon: CreditCard, label: "Fees", roles: ["student"] },
  { path: "/my-salary", icon: Coins, label: "Salary", roles: ["teacher", "principal"] },
  { path: "/reports/attendance", icon: BarChart3, label: "Reports", roles: ["admin", "teacher", "principal"] },
  { path: "/reports/fee-salary", icon: DollarSign, label: "Finance", roles: ["admin"] },
  { path: "/schools/create", icon: PlusCircle, label: "New School", roles: ["admin"] },
  { path: "/class-subject-config", icon: Layers, label: "Class Subject Allocation", roles: ["admin"] },
  { path: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
];

export function getRolesForPath(path: string): string[] | undefined {
  const item = navItems.find((n) => n.path === path);
  return item?.roles;
}
