import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { MyAttendanceUIProps } from "../../../saga/attendance/types";

export const MyAttendanceUI: React.FC<MyAttendanceUIProps> = ({
  myAttendance,
  loading,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  presentCount,
  absentCount,
  lateCount,
  totalDays,
  attendancePercentage,
}) => {
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const statusBadge = (status: string) => {
    if (status === "present") {
      return <Badge variant="success" className="capitalize">Present</Badge>;
    }
    if (status === "absent") {
      return <Badge variant="destructive" className="capitalize">Absent</Badge>;
    }
    return <Badge variant="warning" className="capitalize">Late</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-7 w-7 text-primary" />
            My Attendance Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">View personal attendance record and performance analytics</p>
        </div>
        {/* Month & Year Selectors */}
        <div className="flex gap-3">
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {["2024", "2025", "2026"].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Attendance Score</p>
              <p className="text-3xl font-extrabold text-primary">{attendancePercentage}%</p>
            </div>
            <TrendingUp className="h-9 w-9 text-primary/20" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Days Present</p>
              <p className="text-3xl font-extrabold text-emerald-600">{presentCount}</p>
            </div>
            <CheckCircle2 className="h-9 w-9 text-emerald-500/20" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-sm">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Days Absent</p>
              <p className="text-3xl font-extrabold text-rose-600">{absentCount}</p>
            </div>
            <XCircle className="h-9 w-9 text-rose-500/20" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Days Late</p>
              <p className="text-3xl font-extrabold text-amber-600">{lateCount}</p>
            </div>
            <Clock className="h-9 w-9 text-amber-500/20" />
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              Monthly Attendance Overview
            </span>
            <span className="text-sm font-bold text-primary">{presentCount} / {totalDays} Working Days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 transition-all duration-500 ${
                attendancePercentage >= 85
                  ? "bg-emerald-500"
                  : attendancePercentage >= 75
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{ width: `${Math.min(100, attendancePercentage)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {attendancePercentage >= 75
              ? "Good attendance record! Keep it up to maintain eligibility for exams."
              : "Warning: Attendance is below 75%. Please speak with your class teacher."}
          </p>
        </CardContent>
      </Card>

      {/* Attendance History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daily Attendance Breakdown</CardTitle>
          <CardDescription>Detailed log of marked attendance records for selected period</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
              Loading my attendance records...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Day</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {myAttendance.map((record: any, idx: number) => {
                    const dateObj = new Date(record.date);
                    const dayName = isNaN(dateObj.getTime())
                      ? "N/A"
                      : dateObj.toLocaleDateString("en-US", { weekday: "long" });

                    return (
                      <tr key={record.id || idx} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold">{record.date}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{dayName}</td>
                        <td className="px-6 py-4">{statusBadge(record.status)}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{record.remarks || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {myAttendance.length === 0 && (
                <div className="text-center py-16">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-base font-semibold text-muted-foreground">No attendance records for selected month</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
