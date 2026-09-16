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
import { ToastContainer } from "react-toastify";
import { getRolesForPath } from "./constants/navigation";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  const { activeSchool } = useSchool();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const schoolId = activeSchool?.id || "1";
    return <Navigate to={`/school/${schoolId}/dashboard`} replace />;
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
            <ProtectedRoute allowedRoles={getRolesForPath("/dashboard")}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/students"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/students")}>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/teachers"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/teachers")}>
              <TeachersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/classes"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/classes")}>
              <ClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/classes/assign"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/classes/assign") || ["admin"]}>
              <AssignTeacherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/class-subject-config"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/class-subject-config")}>
              <ClassSubjectConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/subject-teacher-config"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/subject-teacher-config")}>
              <SubjectTeacherConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/attendance"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/attendance")}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/my-attendance"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/my-attendance")}>
              <MyAttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/users"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/users")}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/settings"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/settings")}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/reports/fee-salary"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/reports/fee-salary")}>
              <FeeSalaryReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/reports/attendance"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/reports/attendance")}>
              <AttendanceReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/timetable"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/timetable")}>
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/homework"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/homework")}>
              <HomeworkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/notices"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/notices")}>
              <NoticesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/marks"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/marks")}>
              <MarksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/my-fees"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/my-fees")}>
              <MyFeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/my-salary"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/my-salary")}>
              <MySalaryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/school/:schoolId/schools/create"
          element={
            <ProtectedRoute allowedRoles={getRolesForPath("/schools/create")}>
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
