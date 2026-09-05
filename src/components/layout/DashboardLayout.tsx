import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useSchool } from "../../context/SchoolContext";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { THEMES } from "../../types";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Palette,
  ChevronDown,
  School,
  BarChart3,
  DollarSign,
  Calendar,
  ClipboardList,
  Award,
  Megaphone,
  CreditCard,
  Coins,
  Shield,
  PlusCircle,
} from "lucide-react";
import type { UserRole } from "../../types";

interface SidebarProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: SidebarProps) {
  const { user, originalUser, setSimulatedRole, logout } = useAuth();
  const { mode, toggleMode, theme, setTheme } = useTheme();
  const { schools, activeSchool, setActiveSchool, academicYears, activeAcademicYear, setActiveAcademicYear } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(() =>
  //   typeof window !== "undefined" ? window.innerWidth >= 1024 : false
  // );
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showAcademicYearDropdown, setShowAcademicYearDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const routeParams = useParams<{ schoolId?: string }>();

  const handleSelectSchool = (s: any) => {
    setActiveSchool(s);
    setShowSchoolDropdown(false);
    const subPath = location.pathname.replace(/^\/school\/[^/]+/, "") || "/dashboard";
    navigate(`/school/${s.id}${subPath}`);
  };

  React.useEffect(() => {
    const routeSchoolId = routeParams.schoolId;

    if (routeSchoolId && activeSchool && routeSchoolId !== activeSchool.id) {
      const found = schools.find((s) => s.id === routeSchoolId);
      if (found) {
        setActiveSchool(found);
      }
    }
  }, [routeParams.schoolId, activeSchool, schools, setActiveSchool]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRoleChange = (role: UserRole) => {
    setSimulatedRole(role);
    setShowRoleDropdown(false);
    const sId = activeSchool?.id || routeParams.schoolId;
    if (sId) {
      navigate(`/school/${sId}/dashboard`);
    } else {
      navigate("/login");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "teacher", "student"] },
    { path: "/students", icon: GraduationCap, label: "Students", roles: ["admin", "teacher"] },
    { path: "/teachers", icon: Users, label: "Teachers", roles: ["admin"] },
    { path: "/users", icon: Users, label: "Users", roles: ["admin"] },
    { path: "/classes", icon: BookOpen, label: "Classes", roles: ["admin", "teacher"] },
    { path: "/timetable", icon: Calendar, label: "Timetable", roles: ["admin", "teacher", "student"] },
    { path: "/attendance", icon: ClipboardCheck, label: "Attendance", roles: ["admin", "teacher"] },
    { path: "/my-attendance", icon: ClipboardCheck, label: "My Attendance", roles: ["student"] },
    { path: "/homework", icon: ClipboardList, label: "Homework", roles: ["admin", "teacher", "student"] },
    { path: "/marks", icon: Award, label: "Exams & Marks", roles: ["admin", "teacher", "student"] },
    { path: "/notices", icon: Megaphone, label: "Notices", roles: ["admin", "teacher", "student"] },
    { path: "/my-fees", icon: CreditCard, label: "Fees", roles: ["student"] },
    { path: "/my-salary", icon: Coins, label: "Salary", roles: ["teacher"] },
    { path: "/reports/attendance", icon: BarChart3, label: "Reports", roles: ["admin", "teacher"] },
    { path: "/reports/fee-salary", icon: DollarSign, label: "Finance", roles: ["admin"] },
    { path: "/schools/create", icon: PlusCircle, label: "New School", roles: ["admin"] },
    { path: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
  ];

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));

  const currentSchoolId = activeSchool?.id || routeParams.schoolId || "";

  return (
    <div className="flex h-screen overflow-hidden animate-fade-in">
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 ${sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-20"
          } lg:relative`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-white/10 flex-shrink-0 ${sidebarOpen ? "px-4 gap-3" : "justify-center px-0"}`}>
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-sidebar-accent flex items-center justify-center shadow-lg shadow-sidebar-accent/30">
            <School className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in text-left">
              <h1 className="text-sm font-bold text-sidebar-foreground">EduManage</h1>
              <p className="text-[10px] text-sidebar-foreground/50">School Management</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {filteredNav.map((item) => {
            const linkPath = currentSchoolId ? `/school/${currentSchoolId}${item.path}` : item.path;
            const isActive = location.pathname === linkPath || location.pathname.endsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={linkPath}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`sidebar-link ${isActive ? "active" : ""} ${!sidebarOpen ? "justify-center px-0" : ""}`}
                title={item.label}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${!sidebarOpen ? "justify-center px-0" : ""}`}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <Avatar size="sm">
              <AvatarFallback>{user ? getInitials(user.name) : "?"}</AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
                  <p className="text-[10px] text-sidebar-foreground/50 capitalize">{user?.role}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-6 flex-shrink-0 gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-accent flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="text-left min-w-0 flex-1">
              <h2 className="text-sm sm:text-base md:text-lg font-semibold truncate">
                {filteredNav.find((n) => location.pathname.startsWith(n.path))?.label || "Dashboard"}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate hidden sm:block">
                Welcome back, {user?.name?.split(" ")[0]}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* School Switcher in Header */}
            {activeSchool && (
              <div className="relative">
                <button
                  onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border bg-gradient-to-b from-background to-muted/20 hover:from-accent/50 hover:to-accent transition-all duration-200 cursor-pointer max-w-[150px] sm:max-w-[220px] md:max-w-[320px] lg:max-w-none"
                >
                  <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shadow-inner flex-shrink-0">
                    {activeSchool.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block min-w-0 flex-1">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate">
                      {activeSchool.name} <span className="text-xs font-semibold text-foreground leading-tight truncate">({activeSchool.id})</span>
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-tight truncate">
                      {activeSchool.type || "School"}
                    </p>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${showSchoolDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {showSchoolDropdown && (
                  <div className="absolute right-0 top-12 w-64 max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50 animate-scale-in">
                    <div className="max-h-[220px] overflow-y-auto space-y-0.5 scrollbar-thin">
                      {schools.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => handleSelectSchool(s)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-3.5 ${activeSchool.id === s.id
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                            }`}
                        >
                          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold border border-border flex-shrink-0">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-semibold truncate text-[11px]">{s.name} <span className="text-[10px] text-muted-foreground font-normal">({s.id})</span></p>
                            <p className="text-[9px] text-muted-foreground truncate">{s.type || "School"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Academic Year Switcher in Header */}
            {activeSchool && academicYears.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowAcademicYearDropdown(!showAcademicYearDropdown)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-border bg-gradient-to-b from-background to-muted/20 hover:from-accent/50 hover:to-accent transition-all duration-200 cursor-pointer shadow-sm"
                >
                  <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-inner flex-shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-left hidden sm:block">
                    {/* <p className="text-[9px] text-muted-foreground leading-tight hidden md:block">Academic Year</p> */}
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground leading-tight">
                        {activeAcademicYear?.academicYear || activeSchool.academicYear || "Select Year"}
                      </span>
                      {/* {activeAcademicYear?.isCurrent && (
                        <Badge variant="success" className="text-[8px] py-0 px-1 font-bold uppercase tracking-wider h-3.5 hidden lg:inline-flex">
                          Current
                        </Badge>
                      )} */}
                    </div>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${showAcademicYearDropdown ? "rotate-180" : ""}`} />
                </button>

                {/* Academic Year Dropdown Menu */}
                {showAcademicYearDropdown && (
                  <div className="absolute right-0 top-12 w-52 max-w-[90vw] bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50 animate-scale-in">
                    {/* <p className="text-[9px] font-bold text-muted-foreground px-2.5 py-1 uppercase tracking-wider text-left">
                      Select Academic Year
                    </p> */}
                    <div className="max-h-[200px] overflow-y-auto space-y-0.5 scrollbar-thin">
                      {academicYears.map((ay) => (
                        <button
                          key={ay.schoolAcademicYearId || ay.academicYearId || ay.academicYear}
                          onClick={() => {
                            setActiveAcademicYear(ay);
                            setShowAcademicYearDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${activeAcademicYear?.academicYear === ay.academicYear
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-foreground/80 hover:bg-muted hover:text-foreground"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {/* <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> */}
                            <span className="font-semibold text-[11px]">{ay.academicYear}</span>
                          </div>
                          {/* {ay.isCurrent && (
                            <Badge variant="success" className="text-[8px] py-0 px-1 font-bold uppercase">
                              Current
                            </Badge>
                          )} */}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Picker */}
            {/* <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="hover:bg-accent"
              >
                <Palette className="h-5 w-5" />
              </Button>
              {showThemePicker && (
                <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-xl p-3 z-50 animate-scale-in">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 px-1">Theme Color</p>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {THEMES.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t.name);
                          setShowThemePicker(false);
                        }}
                        className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${theme === t.name ? "border-foreground scale-110 ring-2 ring-offset-2 ring-offset-card ring-foreground/20" : "border-transparent"
                          }`}
                        style={{ backgroundColor: t.color }}
                        title={t.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div> */}

            {/* Dark Mode Toggle */}
            {/* <Button variant="ghost" size="icon" onClick={toggleMode} className="hover:bg-accent">
              {mode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button> */}

            {/* Logout */}
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main key={activeSchool?.id} className="flex-1 overflow-y-auto p-6 bg-background">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>

      {/* Click outside to close theme picker */}
      {showThemePicker && (
        <div className="fixed inset-0 z-40" onClick={() => setShowThemePicker(false)} />
      )}

      {/* Click outside to close school dropdown */}
      {showSchoolDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSchoolDropdown(false)} />
      )}

      {/* Click outside to close academic year dropdown */}
      {showAcademicYearDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAcademicYearDropdown(false)} />
      )}

      {/* Click outside to close role dropdown */}
      {showRoleDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
      )}

    </div>
  );
}
