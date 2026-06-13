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
  const { schools } = useSchool();

  // Redirect to login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const { schools } = useSchool();

  // Decide if we should redirect to dashboard
  const shouldRedirectToDashboard = isAuthenticated;

  return (
    <Routes>
      <Route
        path="/login"
        element={shouldRedirectToDashboard ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <StudentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TeachersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <ClassesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/classes/assign"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AssignTeacherPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <AttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyAttendancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/fee-salary"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <FeeSalaryReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/attendance"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher"]}>
            <AttendanceReportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timetable"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <TimetablePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/homework"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <HomeworkPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notices"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <NoticesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/marks"
        element={
          <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
            <MarksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-fees"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyFeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-salary"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <MySalaryPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
