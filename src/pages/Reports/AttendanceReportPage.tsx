import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useSchool } from "../../context/SchoolContext";
import { fetchAttendance, fetchStudents } from "../../lib/api";
import type { AttendanceRecord } from "../../types";
import {
  Search,
  Download,
  Filter,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Calendar,
} from "lucide-react";
import {
  generateAttendanceReport,
  generateAttendanceSummaryReport,
} from "../../lib/reportUtils";

export function AttendanceReportPage() {
  const { activeSchool } = useSchool();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  React.useEffect(() => {
    let mounted = true;
    fetchAttendance().then((d) => { if (mounted) setAttendance(d); }).catch(() => {});
    fetchStudents().then((d) => { if (mounted) setStudents(d); }).catch(() => {});
    return () => { mounted = false; };
  }, [activeSchool]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterClass, setFilterClass] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "summary">("list");

  // Get unique classes from attendance records
  const uniqueClasses = useMemo(
    () => [...new Set(attendance.map((a) => a.class))].sort(),
    [attendance]
  );

  // Filter attendance
  const filteredAttendance = useMemo(() => {
    return attendance.filter((a) => {
      const matchesSearch =
        a.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.rollNumber.includes(searchQuery);
      const matchesDate = !filterDate || a.date === filterDate;
      const matchesClass = !filterClass || a.class === filterClass;
      return matchesSearch && matchesDate && matchesClass;
    });
  }, [attendance, searchQuery, filterDate, filterClass]);

  // Calculate statistics for the filtered date and class
  const dateClassAttendance = useMemo(() => {
    const filtered = attendance.filter((a) => {
      const matchDate = !filterDate || a.date === filterDate;
      const matchClass = !filterClass || a.class === filterClass;
      return matchDate && matchClass;
    });
    return {
      total: filtered.length,
      present: filtered.filter((a) => a.status === "present").length,
      absent: filtered.filter((a) => a.status === "absent").length,
      late: filtered.filter((a) => a.status === "late").length,
    };
  }, [attendance, filterDate, filterClass]);

  // Calculate per-student statistics
  const studentStats = useMemo(() => {
    const uniqueStudents = [...new Set(attendance.map((a) => a.studentId))];
    return uniqueStudents
      .map((studentId) => {
        const studentRecords = attendance.filter((a) => a.studentId === studentId);
        const present = studentRecords.filter((a) => a.status === "present").length;
        const absent = studentRecords.filter((a) => a.status === "absent").length;
        const late = studentRecords.filter((a) => a.status === "late").length;
        const total = studentRecords.length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : "0";

        return {
          studentId,
          studentName: studentRecords[0]?.studentName || "Unknown",
          rollNumber: studentRecords[0]?.rollNumber || "",
          class: studentRecords[0]?.class || "",
          section: studentRecords[0]?.section || "",
          present,
          absent,
          late,
          total,
          percentage: parseFloat(percentage),
        };
      })
      .sort((a, b) => parseFloat(b.percentage.toFixed(2)) - parseFloat(a.percentage.toFixed(2)));
  }, [attendance]);

  const getStatusIcon = (status: string) => {
    if (status === "present") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "absent") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  const getStatusBadgeVariant = (percentage: number): any => {
    if (percentage >= 90) return "success";
    if (percentage >= 75) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-primary" />
            Attendance Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track and analyze attendance data</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (viewMode === "list") {
                generateAttendanceReport(filteredAttendance, { title: "Attendance Report" });
              } else {
                generateAttendanceSummaryReport(attendance);
              }
            }}
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-success">{dateClassAttendance.present}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-success/30" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-destructive">{dateClassAttendance.absent}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive/30" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Late</p>
              <p className="text-2xl font-bold text-warning">{dateClassAttendance.late}</p>
            </div>
            <Clock className="h-8 w-8 text-warning/30" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Records</p>
            <p className="text-2xl font-bold">{dateClassAttendance.total}</p>
            {dateClassAttendance.total > 0 && (
              <p className="text-xs text-success mt-1">
                {(
                  ((dateClassAttendance.present / dateClassAttendance.total) * 100).toFixed(1)
                )}
                % Present
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selection */}
      <div className="flex gap-2 border-b">
        {["list", "summary"].map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode as any)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              viewMode === mode
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {mode === "list" ? "Daily Records" : "Student Summary"}
          </button>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by student name or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              />
              <select
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
              {(filterDate || filterClass || searchQuery) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setFilterDate(new Date().toISOString().split("T")[0]);
                    setFilterClass("");
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Attendance Records */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-semibold">Student</th>
                    <th className="px-6 py-3 text-left font-semibold">Roll No</th>
                    <th className="px-6 py-3 text-left font-semibold">Class</th>
                    <th className="px-6 py-3 text-left font-semibold">Date</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Marked By</th>
                    <th className="px-6 py-3 text-left font-semibold">Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4">{record.studentName}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{record.rollNumber}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {record.class}-{record.section}
                      </td>
                      <td className="px-6 py-4">{record.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <Badge
                            variant={
                              record.status === "present"
                                ? "success"
                                : record.status === "absent"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{record.markedBy}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{record.markedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAttendance.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No attendance records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Attendance Summary */}
      {viewMode === "summary" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-6 py-3 text-left font-semibold">Student</th>
                    <th className="px-6 py-3 text-left font-semibold">Roll No</th>
                    <th className="px-6 py-3 text-left font-semibold">Class</th>
                    <th className="px-6 py-3 text-center font-semibold">Present</th>
                    <th className="px-6 py-3 text-center font-semibold">Absent</th>
                    <th className="px-6 py-3 text-center font-semibold">Late</th>
                    <th className="px-6 py-3 text-center font-semibold">Total</th>
                    <th className="px-6 py-3 text-center font-semibold">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((stat) => (
                    <tr key={stat.studentId} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{stat.studentName}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline">{stat.rollNumber}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {stat.class}-{stat.section}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/20 text-success font-semibold text-xs">
                          {stat.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-destructive/20 text-destructive font-semibold text-xs">
                          {stat.absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-warning/20 text-warning font-semibold text-xs">
                          {stat.late}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold">{stat.total}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getStatusBadgeVariant(stat.percentage)}>
                          {stat.percentage.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {studentStats.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No attendance data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
