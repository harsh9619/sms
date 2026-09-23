import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardCheck,
  Zap,
  X,
  Loader2,
  Search,
  Users,
  CheckCheck,
  UserX,
  RotateCcw,
  Sparkles,
  Filter,
  RefreshCw,
  Calendar as CalendarIcon,
} from "lucide-react";
import { AttendanceUIProps } from "../../../saga/attendance/types";
import { BulkUploadModal } from "./BulkUploadModal";

export const AttendanceUI: React.FC<AttendanceUIProps> = ({
  attendanceRecords,
  students,
  classes,
  loading,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  filterDate,
  setFilterDate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  datePreset,
  setDatePreset,
  filterClass,
  setFilterClass,
  selectedDivision,
  setSelectedDivision,
  manualAttendance,
  setManualAttendance,
  handleManualSave,
  handleExportExcel,
  handleDownloadSampleTemplate,
  showBulkUpload,
  setShowBulkUpload,
  handleBulkImport,
  importStatus,
  setImportStatus,
}) => {
  // Toggle for excluding students whose attendance is already marked
  const [hideCompleted, setHideCompleted] = useState(false);

  // Handle Preset quick buttons for Date Range
  const handlePresetChange = (preset: string) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    if (preset === "today") {
      setFilterDate(todayStr);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === "yesterday") {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split("T")[0];
      setFilterDate(yStr);
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === "this_week") {
      const dayOfWeek = today.getDay();
      const diffToMon = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMon);
      setStartDate(monday.toISOString().split("T")[0]);
      setEndDate(todayStr);
    } else if (preset === "this_month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(todayStr);
    }
  };

  const formattedDate = useMemo(() => {
    if (datePreset === "today" || datePreset === "yesterday") {
      if (!filterDate) return "";
      const [y, m, d] = filterDate.split("-").map(Number);
      if (!y || !m || !d) return filterDate;
      return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    return `${startDate} to ${endDate}`;
  }, [filterDate, startDate, endDate, datePreset]);

  // Selected Class & Division Objects
  const selectedClassObj = useMemo(
    () => classes.find((c) => String(c.id) === String(filterClass) || String(c.classMasterId) === String(filterClass) || c.name === filterClass),
    [classes, filterClass]
  );

  const selectedDivObj = useMemo(
    () => selectedClassObj?.divisions?.find((d) => String(d.id) === String(selectedDivision) || d.name === selectedDivision),
    [selectedClassObj, selectedDivision]
  );

  // Counts of students whose attendance is Done vs Pending for filterDate
  const { manualDoneCount, manualPendingCount } = useMemo(() => {
    let done = 0;
    students.forEach((s: any) => {
      const sId = String(s.id || s.user_id || s.student_id);
      const isMarked = Boolean(
        s.attendanceId ||
        s.attendanceStatus ||
        s.status ||
        attendanceRecords.some((r: any) => {
          const rStudentId = String(r.studentId || r.student_id || r.id);
          const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
          return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
        })
      );
      if (isMarked) done++;
    });
    return { manualDoneCount: done, manualPendingCount: students.length - done };
  }, [students, attendanceRecords, filterDate]);

  // Analytics Metrics
  const totalCount = students.length;

  const presentCount = useMemo(() => {
    return students.filter((s: any) => {
      const sId = String(s.id || s.user_id || s.student_id);
      const manualStatus = manualAttendance[sId];
      if (manualStatus) return manualStatus === "present";
      const existingRecord = attendanceRecords.find((r: any) => {
        const rStudentId = String(r.studentId || r.student_id || r.id);
        const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
        return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
      });
      const status = existingRecord?.status || s.attendanceStatus || s.status;
      return status === "present";
    }).length;
  }, [students, manualAttendance, attendanceRecords, filterDate]);

  const absentCount = useMemo(() => {
    return students.filter((s: any) => {
      const sId = String(s.id || s.user_id || s.student_id);
      const manualStatus = manualAttendance[sId];
      if (manualStatus) return manualStatus === "absent";
      const existingRecord = attendanceRecords.find((r: any) => {
        const rStudentId = String(r.studentId || r.student_id || r.id);
        const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
        return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
      });
      const status = existingRecord?.status || s.attendanceStatus || s.status;
      return status === "absent";
    }).length;
  }, [students, manualAttendance, attendanceRecords, filterDate]);

  const lateCount = useMemo(() => {
    return students.filter((s: any) => {
      const sId = String(s.id || s.user_id || s.student_id);
      const manualStatus = manualAttendance[sId];
      if (manualStatus) return manualStatus === "late";
      const existingRecord = attendanceRecords.find((r: any) => {
        const rStudentId = String(r.studentId || r.student_id || r.id);
        const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
        return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
      });
      const status = existingRecord?.status || s.attendanceStatus || s.status;
      return status === "late";
    }).length;
  }, [students, manualAttendance, attendanceRecords, filterDate]);

  const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Unified Student Attendance Table Filter & Sort (Pending students on top)
  const displayedStudents = useMemo(() => {
    const filtered = students.filter((s: any) => {
      const sId = String(s.id || s.user_id || s.student_id);

      const existingRecord = attendanceRecords.find((r: any) => {
        const rStudentId = String(r.studentId || r.student_id || r.id);
        const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
        return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
      });

      const isDone = Boolean(s.attendanceId || s.attendanceStatus || s.status || existingRecord);

      if (hideCompleted && isDone) {
        return false;
      }

      const matchClass =
        filterClass === "all" ||
        !filterClass ||
        String(s.class_id) === String(filterClass) ||
        String(s.class_master_id) === String(filterClass) ||
        s.class_name === selectedClassObj?.name ||
        s.class === selectedClassObj?.name;

      const matchDivision =
        selectedDivision === "all" ||
        !selectedDivision ||
        String(s.division_master_id) === String(selectedDivision) ||
        s.division_name === selectedDivObj?.name ||
        s.section === selectedDivObj?.name;

      const currentStatus = manualAttendance[sId] || existingRecord?.status || s.attendanceStatus || s.status;
      const matchStatus = statusFilter === "all" || currentStatus === statusFilter;

      const matchSearch =
        !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registrationNo?.toString().toLowerCase().includes(searchQuery.toLowerCase());

      return matchClass && matchDivision && matchStatus && matchSearch;
    });

    return filtered.sort((a: any, b: any) => {
      const aId = String(a.id || a.user_id || a.student_id);
      const bId = String(b.id || b.user_id || b.student_id);

      const aDone = Boolean(
        a.attendanceId ||
        a.attendanceStatus ||
        a.status ||
        attendanceRecords.some((r: any) => {
          const rStudentId = String(r.studentId || r.student_id || r.id);
          const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
          return rStudentId === aId && (!rDate || rDate === filterDate) && r.status;
        })
      );

      const bDone = Boolean(
        b.attendanceId ||
        b.attendanceStatus ||
        b.status ||
        attendanceRecords.some((r: any) => {
          const rStudentId = String(r.studentId || r.student_id || r.id);
          const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
          return rStudentId === bId && (!rDate || rDate === filterDate) && r.status;
        })
      );

      // Pending (aDone === false) on top before Done (bDone === true)
      if (!aDone && bDone) return -1;
      if (aDone && !bDone) return 1;

      // Secondary sort: by Roll Number or Name
      const aRoll = Number(a.roll_no || a.rollNumber) || 0;
      const bRoll = Number(b.roll_no || b.rollNumber) || 0;
      if (aRoll !== bRoll) return aRoll - bRoll;

      return (a.name || "").localeCompare(b.name || "");
    });
  }, [students, attendanceRecords, filterDate, hideCompleted, filterClass, selectedDivision, selectedClassObj, selectedDivObj, statusFilter, searchQuery, manualAttendance]);

  // Batch Action Handlers
  const markAllPresent = () => {
    const updated: Record<string, "present" | "absent" | "late"> = { ...manualAttendance };
    displayedStudents.forEach((student: any) => {
      const sId = String(student.id || student.user_id || student.student_id);
      updated[sId] = "present";
    });
    setManualAttendance(updated);
  };

  const markAllAbsent = () => {
    const updated: Record<string, "present" | "absent" | "late"> = { ...manualAttendance };
    displayedStudents.forEach((student: any) => {
      const sId = String(student.id || student.user_id || student.student_id);
      updated[sId] = "absent";
    });
    setManualAttendance(updated);
  };

  const resetSelection = () => {
    setManualAttendance({});
  };

  const handleResetAllFilters = () => {
    setSearchQuery("");
    setFilterClass("all");
    setSelectedDivision("all");
    setStatusFilter("all");
    setDatePreset("today");
    const todayStr = new Date().toISOString().split("T")[0];
    setFilterDate(todayStr);
    setStartDate(todayStr);
    setEndDate(todayStr);
  };

  const isFilterActive =
    Boolean(searchQuery) ||
    filterClass !== "all" ||
    selectedDivision !== "all" ||
    statusFilter !== "all" ||
    datePreset !== "today";

  return (
    <div className="space-y-6">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            Student Attendance Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mark daily attendance, view records, and export student reports seamlessly
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-muted"
            title="Export filtered records to Excel"
          >
            <Download className="h-4 w-4 text-primary" /> Export Excel
          </Button>

          <Button
            size="sm"
            onClick={() => setShowBulkUpload(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold text-xs"
          >
            <Upload className="h-4 w-4 mr-1.5" /> Upload Excel / OCR
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Students Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Students</p>
              <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{totalCount}</p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Present Card */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Present</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                {totalCount > 0 && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ({presentPercentage}%)
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-full">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Absent Card */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Absent</p>
              <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{absentCount}</p>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950 rounded-full">
              <XCircle className="h-6 w-6 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-black text-orange-600 dark:text-orange-400 mt-1">{manualPendingCount}</p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-full">
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 space-y-3">
          {/* Quick Date Range Preset Pills */}
          {/* <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1 shrink-0">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" /> Date Filter:
            </span>
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "this_week", label: "This Week" },
              { id: "this_month", label: "This Month" },
              { id: "custom", label: "Custom Range" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handlePresetChange(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  datePreset === p.id
                    ? "bg-primary text-primary-foreground shadow-sm font-bold"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div> */}

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-1">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Input
                placeholder="Search student name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                className="w-full pl-9 pr-9 h-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Date Inputs */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setStartDate(e.target.value);
                  setEndDate(e.target.value);
                  setDatePreset("custom");
                }}
                className="h-10 rounded-xl border-border bg-background px-3 text-xs font-semibold"
              />

            </div>

            {/* Class Select */}
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setSelectedDivision("all");
              }}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.classMasterId || c.id} value={c.classMasterId || c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Section / Division Select */}
            <select
              value={selectedDivision}
              disabled={!filterClass || filterClass === "all"}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="all">All Sections</option>
              {classes
                .find((c) => String(c.classMasterId || c.id) === String(filterClass))
                ?.divisions?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>

            {/* Status Select Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            {/* Reset Filters Button */}
            {isFilterActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAllFilters}
                className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 shrink-0"
                title="Reset all filters"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Unified Student Attendance Table Card */}
      <Card className="shadow-sm border border-border overflow-hidden">
        <CardHeader className="bg-muted/20 pb-4 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                Student Attendance Register
              </CardTitle>
              <CardDescription className="text-xs mt-1 flex items-center gap-2 flex-wrap">
                <span>Date: <span className="font-semibold text-foreground">{filterDate}</span></span>
                <span className="text-muted-foreground/60">•</span>
                <Badge variant="outline" className="bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Done: {manualDoneCount}
                </Badge>
                <Badge variant="outline" className="bg-amber-50/70 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px] px-2 py-0.5 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3 text-amber-500" /> Pending: {manualPendingCount}
                </Badge>
              </CardDescription>
            </div>

            {/* Quick Batch Marking Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={markAllPresent}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1.5" /> Mark All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAbsent}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 font-semibold text-xs"
              >
                <UserX className="h-4 w-4 mr-1.5" /> Mark All Absent
              </Button>
              {Object.keys(manualAttendance).length > 0 && (
                <Button size="sm" variant="ghost" onClick={resetSelection} className="text-xs text-muted-foreground">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset Selection
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
              <span className="font-semibold">Loading student attendance...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                    <th className="px-6 py-4">Admission No.</th>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Class </th>
                    <th className="px-6 py-4">Div</th>

                    <th className="px-6 py-4 text-center">Manual Marking Action</th>
                    <th className="px-6 py-4">Status</th>

                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {displayedStudents.map((student: any, idx: number) => {
                    const sId = String(student.id || student.user_id || student.student_id);
                    const manualStatus = manualAttendance[sId];

                    // Check for existing saved record in database
                    const existingRecord = attendanceRecords.find((r: any) => {
                      const rStudentId = String(r.studentId || r.student_id || r.id);
                      const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
                      return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
                    });

                    const isDone = Boolean(student.attendanceId || student.attendanceStatus || student.status || existingRecord);
                    const activeStatus = manualStatus || existingRecord?.status || student.attendanceStatus || student.status;
                    const rollNo = student.roll_no || student.rollNumber || student.registrationNo || "N/A";
                    const regNo =
                      student.studentDetail?.registrationNo || "N/A";
                    const className = student.class_name || student.class || selectedClassObj?.name || "N/A";
                    const sectionName = student.division_name || student.section || selectedDivObj?.name || "N/A";

                    const markedBy = existingRecord?.markedByName || existingRecord?.markedBy || (isDone ? "System" : "-");
                    const timeStr = existingRecord?.markedAt || (existingRecord?.createdAt ? new Date(existingRecord.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) : "");

                    return (
                      <tr
                        key={sId || `stud-${idx}`}
                        className={`transition-colors hover:bg-muted/30 ${manualStatus === "present"
                          ? "bg-emerald-50/20 dark:bg-emerald-950/10"
                          : manualStatus === "absent"
                            ? "bg-rose-50/20 dark:bg-rose-950/10"
                            : manualStatus === "late"
                              ? "bg-amber-50/20 dark:bg-amber-950/10"
                              : ""
                          }`}
                      >
                        {/* Roll No */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-foreground">{regNo}</p>
                        </td>

                        {/* Student Name */}
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-foreground">{student.name || student.studentName || "Student"}</p>
                        </td>

                        {/* Class & Section */}
                        <td className="px-6 py-4 text-sm font-medium">
                          {className}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium">
                          {sectionName}
                        </td>



                        {/* Manual Marking Action Buttons */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {(["present", "absent"] as const).map((st) => (
                              <Button
                                key={st}
                                size="sm"
                                variant={activeStatus === st ? "default" : "outline"}
                                className={`font-bold transition-all text-xs px-3 h-8 ${activeStatus === st
                                  ? st === "present"
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                    : st === "absent"
                                      ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                                      : "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                                  : "hover:bg-muted"
                                  }`}
                                onClick={() => setManualAttendance((prev) => ({ ...prev, [sId]: st }))}
                              >
                                {st === "present" ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> P
                                  </>
                                ) : st === "absent" ? (
                                  <>
                                    <XCircle className="h-3.5 w-3.5 mr-1" /> A
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-3.5 w-3.5 mr-1" /> L
                                  </>
                                )}
                              </Button>
                            ))}
                          </div>
                        </td>

                        {/* Status Badge (Done vs Pending) */}
                        <td className="px-6 py-4">
                          {isDone ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-xs px-2.5 py-1 font-bold flex items-center gap-1.5 w-fit">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Done
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-xs px-2.5 py-1 font-bold flex items-center gap-1.5 w-fit">
                              <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending
                            </Badge>
                          )}
                        </td>


                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {displayedStudents.length === 0 && (
                <div className="text-center py-16 px-4">
                  <Users className="h-14 w-14 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-lg font-bold text-foreground">
                    {hideCompleted ? "All Attendance Marked for Selected Filter!" : "No Students Found"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    {hideCompleted
                      ? "Attendance data for students matching the filter has already been completed for this date."
                      : "Try clearing search query or adjusting class/section filters."}
                  </p>
                  {hideCompleted && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHideCompleted(false)}
                      className="mt-3 font-semibold text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                    >
                      Show All Students ({students.length})
                    </Button>
                  )}
                </div>
              )}

              {/* Floating Save Action Bar */}
              {Object.keys(manualAttendance).length > 0 && (
                <div className="sticky bottom-4 mx-4 mb-4 pt-4 bg-background/90 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-xl flex items-center justify-between z-20">
                  <div className="text-sm">
                    <span className="font-extrabold text-foreground">{Object.keys(manualAttendance).length}</span>{" "}
                    student selections pending save for <span className="font-semibold text-primary">{filterDate}</span>
                  </div>
                  <Button
                    onClick={() => handleManualSave(filterDate)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-md"
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Save Attendance Now
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload CSV / Excel & OCR Modal */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        onImport={handleBulkImport}
        handleBulkImport={handleBulkImport}
        students={students}
        classes={classes}
        importStatus={importStatus}
        setImportStatus={setImportStatus}
        defaultDate={filterDate}
        handleDownloadSampleTemplate={handleDownloadSampleTemplate}
      />
    </div>
  );
};
