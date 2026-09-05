import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SchoolProvider, useSchool } from "./context/SchoolContext";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { LoginPage } from "./pages/Login/LoginPage";
import { DashboardPage } from "./pages/Dashboard/DashboardPage";
import { StudentsPage } from "./pages/Students/StudentsPage";
import { TeachersPage } from "./pages/Teachers/TeachersPage";
import { ClassesPage } from "./pages/Classes/ClassesPage";
import { AssignTeacherPage } from "./pages/Classes/AssignTeacherPage";
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
import "./index.css";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user } = useAuth();
  const { activeSchool } = useSchool();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    const redirectPath = activeSchool ? `/school/${activeSchool.id}/dashboard` : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { activeSchool } = useSchool();

  const defaultRedirect = activeSchool ? `/school/${activeSchool.id}/dashboard` : "/login";

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultRedirect} replace /> : <LoginPage />}
      />
      <Route
        path="/school/:schoolId/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/students"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/teachers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/classes"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <ClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/classes/assign"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AssignTeacherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/my-attendance"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/reports/fee-salary"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FeeSalaryReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/reports/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <AttendanceReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/timetable"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <TimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/homework"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <HomeworkPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/notices"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <NoticesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/marks"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <MarksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/my-fees"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyFeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/school/:schoolId/my-salary"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <MySalaryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={defaultRedirect} replace />} />
    </Routes>
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
