import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import type { UserRole } from "../../types";

interface SidebarProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: SidebarProps) {
  const { user, originalUser, setSimulatedRole, logout } = useAuth();
  const { mode, toggleMode, theme, setTheme } = useTheme();
  const { schools, activeSchool, setActiveSchool } = useSchool();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRoleChange = (role: UserRole) => {
    setSimulatedRole(role);
    setShowRoleDropdown(false);
    navigate("/dashboard");
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
    { path: "/settings", icon: Settings, label: "Settings", roles: ["admin"] },
  ];

  const filteredNav = navItems.filter((item) => user && item.roles.includes(user.role));
  const canSwitchSchools = schools.length > 1;

  return (
    <div className="flex h-screen overflow-hidden animate-fade-in">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } lg:relative`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10 flex-shrink-0">
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
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""} ${!sidebarOpen ? "justify-center px-0" : ""}`
              }
              title={item.label}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors ${
              !sidebarOpen ? "justify-center" : ""
            }`}
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
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hover:bg-accent"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="text-left">
              <h2 className="text-lg font-semibold">
                {filteredNav.find((n) => location.pathname.startsWith(n.path))?.label || "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Welcome back, {user?.name?.split(" ")[0]}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* School Switcher in Header */}
            {activeSchool && (
              <div className="relative mr-2">
                <button
                  onClick={() => canSwitchSchools && setShowSchoolDropdown(!showSchoolDropdown)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-gradient-to-b from-background to-muted/20 hover:from-accent/50 hover:to-accent transition-all duration-200 ${
                    canSwitchSchools ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shadow-inner">
                    {activeSchool.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-foreground leading-tight truncate max-w-[150px]">
                      {activeSchool.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground leading-tight truncate">
                      {activeSchool.type || "School"}
                    </p>
                  </div>
                  {canSwitchSchools ? (
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${showSchoolDropdown ? "rotate-180" : ""}`} />
                  ) : (
                    <Badge variant="info" className="text-[9px] py-0.5 px-2 font-bold uppercase tracking-wider rounded-md">
                      Assigned
                    </Badge>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showSchoolDropdown && canSwitchSchools && (
                  <div className="absolute right-0 top-12 w-64 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50 animate-scale-in">
                    <p className="text-[9px] font-bold text-muted-foreground px-2.5 py-1.5 uppercase tracking-wider text-left">
                      Switch School
                    </p>
                    <div className="max-h-[220px] overflow-y-auto space-y-0.5 scrollbar-thin">
                      {schools.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveSchool(s);
                            setShowSchoolDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-3.5 ${
                            activeSchool.id === s.id
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground/80 hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-[10px] font-bold border border-border flex-shrink-0">
                            {s.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-semibold truncate text-[11px]">{s.name}</p>
                            <p className="text-[9px] text-muted-foreground truncate">{s.type || "School"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Role Switcher for Admin Users */}
            {originalUser?.role === "admin" && (
              <div className="relative mr-2">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-border bg-gradient-to-b from-background to-muted/20 hover:from-accent/50 hover:to-accent transition-all duration-200 cursor-pointer"
                >
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center shadow-inner ${
                    user?.role === "admin" ? "bg-red-500/10 border border-red-500/20 text-red-500" :
                    user?.role === "teacher" ? "bg-blue-500/10 border border-blue-500/20 text-blue-500" :
                    "bg-green-500/10 border border-green-500/20 text-green-500"
                  }`}>
                    {user?.role === "admin" ? <Shield className="h-3.5 w-3.5" /> :
                     user?.role === "teacher" ? <BookOpen className="h-3.5 w-3.5" /> :
                     <GraduationCap className="h-3.5 w-3.5" />}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-[9px] text-muted-foreground leading-tight">View Mode</p>
                    <p className="text-xs font-semibold text-foreground leading-tight truncate capitalize">
                      {user?.role} Portal
                    </p>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${showRoleDropdown ? "rotate-180" : ""}`} />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 top-12 w-48 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50 animate-scale-in">
                    <p className="text-[9px] font-bold text-muted-foreground px-2.5 py-1.5 uppercase tracking-wider text-left">
                      Switch Role View
                    </p>
                    <div className="space-y-0.5">
                      {[
                        { role: "admin", label: "Admin Portal", icon: Shield },
                        { role: "teacher", label: "Teacher Portal", icon: BookOpen },
                        { role: "student", label: "Student Portal", icon: GraduationCap }
                      ].map((item) => (
                        <button
                          key={item.role}
                          onClick={() => handleRoleChange(item.role as UserRole)}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center gap-2.5 ${
                            user?.role === item.role
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-foreground/80 hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Theme Picker */}
            <div className="relative">
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
                        className={`h-8 w-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                          theme === t.name ? "border-foreground scale-110 ring-2 ring-offset-2 ring-offset-card ring-foreground/20" : "border-transparent"
                        }`}
                        style={{ backgroundColor: t.color }}
                        title={t.label}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleMode} className="hover:bg-accent">
              {mode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>

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

      {/* Click outside to close role dropdown */}
      {showRoleDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
      )}
    </div>
  );
}
