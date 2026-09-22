import React, { useState, useEffect, useCallback, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import * as XLSX from "xlsx";
import { AppState } from "../../saga/rootReducer";
import { fetchAttendanceRequest, saveAttendanceRequest } from "../../saga/attendance/actions";
import { fetchStudentsRequest } from "../../saga/students/actions";
import { fetchClassesRequest } from "../../saga/classes/actions";
import type { AttendanceRecord } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import { useAuth } from "../../context/AuthContext";
import { AttendanceUI } from "../../components/modules/attendance/AttendanceUI";

const mapStateToProps = (state: AppState) => ({
  reduxAttendance: state.attendance.records,
  students: state.students.students,
  classes: state.classes.classes,
  loading: state.attendance.loading,
  saveSuccess: state.attendance.saveSuccess,
  saveMsg: state.attendance.saveMsg,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchAttendanceRequest: (payload?: any) => dispatch(fetchAttendanceRequest(payload)),
  fetchStudentsRequest: () => dispatch(fetchStudentsRequest()),
  fetchClassesRequest: () => dispatch(fetchClassesRequest()),
  saveAttendanceRequest: (payload: any) => dispatch(saveAttendanceRequest(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

function AttendanceContainerContent({
  reduxAttendance,
  students,
  classes,
  loading,
  saveSuccess,
  saveMsg,
  fetchAttendanceRequest,
  fetchStudentsRequest,
  fetchClassesRequest,
  saveAttendanceRequest,
}: PropsFromRedux) {
  const { activeSchool } = useSchool();
  const { user } = useAuth();
  const [extraRecords, setExtraRecords] = useState<AttendanceRecord[]>([]);
  const attendance = useMemo(() => {
    const recordMap = new Map<string, any>();
    extraRecords.forEach((r) => {
      const key = `${r.studentId}-${r.date}`;
      recordMap.set(key, r);
    });
    reduxAttendance.forEach((r) => {
      const key = `${r.studentId}-${r.date}`;
      const existing = recordMap.get(key);
      if (existing) {
        recordMap.set(key, {
          ...existing,
          ...r,
          studentName: r.studentName || existing.studentName,
          rollNumber: r.rollNumber || existing.rollNumber,
          class: r.class || existing.class,
          section: r.section || existing.section,
        });
      } else {
        recordMap.set(key, r);
      }
    });
    return Array.from(recordMap.values());
  }, [reduxAttendance, extraRecords]);

  const todayStr = new Date().toISOString().split("T")[0];
  const [filterDate, setFilterDate] = useState(todayStr);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [datePreset, setDatePreset] = useState("today");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent" | "late">("all");
  const [filterClass, setFilterClass] = useState("all");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [activeTab, setActiveTab] = useState<"records" | "manual">("records");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [manualAttendance, setManualAttendance] = useState<Record<string, "present" | "absent" | "late">>({});
  const [importStatus, setImportStatus] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });

  useEffect(() => {
    fetchAttendanceRequest({
      schoolId: activeSchool?.id,
      date: datePreset === "today" || datePreset === "yesterday" ? filterDate : undefined,
      startDate: datePreset !== "today" && datePreset !== "yesterday" ? startDate : undefined,
      endDate: datePreset !== "today" && datePreset !== "yesterday" ? endDate : undefined,
      classId: filterClass !== "all" ? filterClass : undefined,
      divisionId: selectedDivision !== "all" ? selectedDivision : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery.trim() || undefined,
    });
    fetchStudentsRequest();
    fetchClassesRequest();
  }, [
    fetchAttendanceRequest,
    fetchStudentsRequest,
    fetchClassesRequest,
    activeSchool,
    filterDate,
    startDate,
    endDate,
    datePreset,
    filterClass,
    selectedDivision,
    statusFilter,
    searchQuery,
  ]);

  // Export to Excel
  const handleExportExcel = useCallback(() => {
    const filteredAttendance = attendance.filter((a: any) => {
      const matchDate =
        datePreset === "today" || datePreset === "yesterday"
          ? a.date === filterDate
          : a.date >= startDate && a.date <= endDate;
      const matchClass = filterClass === "all" || a.class === filterClass || String(a.classId) === String(filterClass);
      return matchDate && matchClass;
    });

    const data = filteredAttendance.map((a: any) => ({
      "Roll Number": a.rollNumber || a.roll_no || "",
      "Student Name": a.studentName || a.name || "",
      "Class": a.class || "",
      "Status": a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : "",
      "Date": a.date || filterDate,
      "Marked By": user?.id || "Manual Entry",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Student Attendance");
    XLSX.writeFile(wb, `Student_Attendance_${filterDate}.xlsx`);
  }, [attendance, filterDate, startDate, endDate, datePreset, filterClass]);

  // Save manual attendance
  const handleManualSave = (manualDate?: string) => {
    const targetDate = manualDate || filterDate || new Date().toISOString().split("T")[0];
    const payloadRecords = Object.entries(manualAttendance).map(([studentId, status]) => {
      const student = students.find((s: any) => String(s.id) === String(studentId) || String(s.user_id) === String(studentId));
      return {
        studentId,
        classId: student?.class_id ? String(student.class_id) : undefined,
        date: targetDate,
        status,
        markedBy: user?.id,
      };
    });

    saveAttendanceRequest({
      schoolId: activeSchool?.id || "1",
      records: payloadRecords,
    });

    // Also add to local extraRecords for instant UI reflection
    const localNewRecords: AttendanceRecord[] = Object.entries(manualAttendance).map(([studentId, status]) => {
      const student = students.find((s: any) => String(s.id) === String(studentId) || String(s.user_id) === String(studentId));
      return {
        id: `manual-${Date.now()}-${studentId}`,
        studentId,
        studentName: student?.name || "Student",
        rollNumber: student?.roll_no || student?.rollNumber || "",
        class: student?.class_name || student?.class || "",
        section: student?.section || "",
        date: targetDate,
        status,
        markedBy: "Manual Entry",
        markedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    });

    setExtraRecords((prev) => [...prev, ...localNewRecords]);
    setManualAttendance({});
    setActiveTab("records");
    setImportStatus({
      visible: true,
      success: true,
      message: `Saved attendance for ${localNewRecords.length} students on ${targetDate}.`,
    });
    setTimeout(() => setImportStatus((s) => ({ ...s, visible: false })), 4000);
  };

  const handleBulkImport = (newRecords: AttendanceRecord[]) => {
    setExtraRecords((prev) => [...prev, ...newRecords]);
    setImportStatus({
      visible: true,
      success: true,
      message: `Successfully imported ${newRecords.length} attendance record(s)!`,
    });
    setTimeout(() => setImportStatus((s) => ({ ...s, visible: false })), 4000);
  };

  return (
    <>
      <AttendanceUI
        attendanceRecords={attendance}
        students={students}
        classes={classes}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        manualAttendance={manualAttendance}
        setManualAttendance={setManualAttendance}
        handleManualSave={handleManualSave}
        handleExportExcel={handleExportExcel}
        showBulkUpload={showBulkUpload}
        setShowBulkUpload={setShowBulkUpload}
        handleBulkImport={handleBulkImport}
        importStatus={importStatus}
        setImportStatus={setImportStatus}
      />
    </>
  );
}

export const AttendanceContainer = connector(AttendanceContainerContent);
