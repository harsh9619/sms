import React from "react";
import { LoginContainer } from "./containers/login/LoginContainer";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SchoolProvider, useSchool } from "./context/SchoolContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { StudentsPage } from "./pages/Students/StudentsPage";
import { TeachersPage } from "./pages/Teachers/TeachersPage";
import { ClassesPage } from "./pages/Classes/ClassesPage";
import { AssignTeacherPage } from "./pages/Classes/AssignTeacherPage";
import { ClassSubjectConfigPage } from "./pages/Classes/ClassSubjectConfigPage";
import { SubjectTeacherConfigPage } from "./pages/Classes/SubjectTeacherConfigPage";
import { AttendancePage } from "./pages/Attendance/AttendancePage";
import { MyAttendancePage } from "./pages/Attendance/MyAttendancePage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { FeeReportPage } from "./pages/Reports/FeeReportPage";
import { SalaryReportPage } from "./pages/Reports/SalaryReportPage";
import { FeeSalaryReportPage } from "./pages/Reports/FeeSalaryReportPage";
import { AttendanceReportPage } from "./pages/Reports/AttendanceReportPage";
import { TimetablePage } from "./pages/Timetable/TimetablePage";
import { HomeworkPage } from "./pages/Homework/HomeworkPage";
import { NoticesPage } from "./pages/Notices/NoticesPage";
import { MarksPage } from "./pages/Marks/MarksPage";
import { MyFeesPage } from "./pages/Fees/MyFeesPage";
import { MySalaryPage } from "./pages/Salary/MySalaryPage";
import { UsersPage } from "./pages/Users/UsersPage";
import { CreateSchoolPage } from "./pages/Schools/CreateSchoolPage";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { getRolesForPath } from "./constants/navigation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function AccessDeniedView() {
  const { activeSchool } = useSchool();
  const schoolId = activeSchool?.id || "1";
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <div className="h-20 w-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-inner ring-1 ring-destructive/20">
        <ShieldAlert className="h-10 w-10 animate-pulse-glow" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">403 - Access Denied</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        You do not have permission to view or access this module. Please contact your system administrator if you require access.
      </p>
      <Link
        to={`/school/${schoolId}/dashboard`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md hover:bg-primary/90 transition-all"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles, moduleKey }: { children: React.ReactNode; allowedRoles?: string[]; moduleKey?: string }) {
  const { isAuthenticated, user, canAccessModule } = useAuth();
  const { activeSchool } = useSchool();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isRoleAllowed = !allowedRoles || (user && allowedRoles.includes(user.role));
  const isModuleAllowed = !moduleKey || canAccessModule(moduleKey);

  if (!isRoleAllowed || !isModuleAllowed) {
    return (
      <DashboardLayout>
        <AccessDeniedView />
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const { activeSchool } = useSchool();

  const defaultRedirect = activeSchool
    ? `/school/${activeSchool.id}/dashboard`
    : "/school/1/dashboard";

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to={defaultRedirect} replace /> : <LoginContainer />}
        />
        <Route
          path="/school/:schoolId/dashboard"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/dashboard")} moduleKey="dashboard">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/students"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/students")} moduleKey="students">
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/teachers"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/teachers")} moduleKey="teachers">
              <TeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/classes"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/classes")} moduleKey="classes">
              <ClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/classes/assign"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/classes/assign") || ["admin"]} moduleKey="classes">
              <AssignTeacherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/class-subject-config"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/class-subject-config")} moduleKey="class-subject-config">
              <ClassSubjectConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/subject-teacher-config"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/subject-teacher-config")} moduleKey="subject-teacher-config">
              <SubjectTeacherConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/attendance"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/attendance")} moduleKey="attendance">
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/my-attendance"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/my-attendance")} moduleKey="attendance">
              <MyAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/users"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/users")} moduleKey="users">
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/settings"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/settings")} moduleKey="settings">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/reports/fees"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/reports/fees")} moduleKey="reports/fees">
              <FeeReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/reports/salaries"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/reports/salaries")} moduleKey="reports/salaries">
              <SalaryReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/reports/fee-salary"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/reports/fees")} moduleKey="reports/fees">
              <FeeReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/reports/attendance"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/reports/attendance")} moduleKey="attendance">
              <AttendanceReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/timetable"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/timetable")} moduleKey="timetable">
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/homework"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/homework")} moduleKey="timetable">
              <HomeworkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/notices"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/notices")} moduleKey="dashboard">
              <NoticesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/marks"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/marks")} moduleKey="dashboard">
              <MarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/my-fees"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/my-fees")} moduleKey="my-fees">
              <MyFeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/my-salary"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/my-salary")} moduleKey="my-salary">
              <MySalaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/schools/create"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/schools/create")} moduleKey="schools/create">
              <CreateSchoolPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SchoolProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </SchoolProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
