import React, { useState, useEffect, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { fetchMyAttendanceRequest } from "../../saga/attendance/actions";
import { useSchool } from "../../context/SchoolContext";
import { useAuth } from "../../context/AuthContext";
import { MyAttendanceUI } from "../../components/modules/attendance/MyAttendanceUI";

const mapStateToProps = (state: AppState) => ({
  myAttendance: state.attendance.myAttendance,
  loading: state.attendance.loading,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchMyAttendanceRequest: (payload: any) => dispatch(fetchMyAttendanceRequest(payload)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

function MyAttendanceContainerContent({
  myAttendance,
  loading,
  fetchMyAttendanceRequest,
}: PropsFromRedux) {
  const { activeSchool } = useSchool();
  const { user } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    const studentId = user?.studentId || user?.id || "1";
    fetchMyAttendanceRequest({
      schoolId: activeSchool?.id || "1",
      studentId: String(studentId),
      month: selectedMonth,
      year: selectedYear,
    });
  }, [fetchMyAttendanceRequest, activeSchool, user, selectedMonth, selectedYear]);

  // Derived attendance stats
  const filteredRecords = useMemo(() => {
    return myAttendance.filter((rec: any) => {
      if (!rec.date) return true;
      const [y, m] = rec.date.split("-");
      const matchMonth = !selectedMonth || m === selectedMonth;
      const matchYear = !selectedYear || y === selectedYear;
      return matchMonth && matchYear;
    });
  }, [myAttendance, selectedMonth, selectedYear]);

  const presentCount = useMemo(
    () => filteredRecords.filter((a: any) => a.status === "present").length,
    [filteredRecords]
  );
  const absentCount = useMemo(
    () => filteredRecords.filter((a: any) => a.status === "absent").length,
    [filteredRecords]
  );
  const lateCount = useMemo(
    () => filteredRecords.filter((a: any) => a.status === "late").length,
    [filteredRecords]
  );
  const totalDays = filteredRecords.length || 1;
  const attendancePercentage = useMemo(
    () => Math.round((presentCount / totalDays) * 100),
    [presentCount, totalDays]
  );

  return (
    <MyAttendanceUI
      myAttendance={filteredRecords}
      loading={loading}
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
      selectedYear={selectedYear}
      setSelectedYear={setSelectedYear}
      presentCount={presentCount}
      absentCount={absentCount}
      lateCount={lateCount}
      totalDays={filteredRecords.length}
      attendancePercentage={attendancePercentage}
    />
  );
}

export const MyAttendanceContainer = connector(MyAttendanceContainerContent);
