import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { DataTable, ColumnDef } from "../../ui/DataTable";
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

  // Column definitions for common DataTable
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        key: "regNo",
        header: "Admission No.",
        cell: (student) => {
          const regNo = student.studentDetail?.registrationNo || student.registrationNo || student.roll_no || "N/A";
          return <span className="font-bold text-foreground">{regNo}</span>;
        },
      },
      {
        key: "name",
        header: "Student Name",
        cell: (student) => (
          <span className="font-bold text-foreground">{student.name || student.studentName || "Student"}</span>
        ),
      },
      {
        key: "class",
        header: "Class",
        cell: (student) => {
          const className = student.class_name || student.class || selectedClassObj?.name || "N/A";
          return <span className="font-medium text-foreground">{className}</span>;
        },
      },
      {
        key: "division",
        header: "Div",
        cell: (student) => {
          const sectionName = student.division_name || student.section || selectedDivObj?.name || "N/A";
          return <span className="font-medium text-foreground">{sectionName}</span>;
        },
      },
      {
        key: "marking",
        header: "Manual Marking Action",
        align: "center",
        cell: (student) => {
          const sId = String(student.id || student.user_id || student.student_id);
          const manualStatus = manualAttendance[sId];
          const existingRecord = attendanceRecords.find((r: any) => {
            const rStudentId = String(r.studentId || r.student_id || r.id);
            const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
            return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
          });
          const activeStatus = manualStatus || existingRecord?.status || student.attendanceStatus || student.status;

          return (
            <div className="flex items-center justify-center gap-2">
              {(["present", "absent"] as const).map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={activeStatus === st ? "default" : "outline"}
                  className={`font-bold transition-all text-xs px-3 h-8 ${
                    activeStatus === st
                      ? st === "present"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                        : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setManualAttendance((prev) => ({ ...prev, [sId]: st }))}
                >
                  {st === "present" ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> P
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> A
                    </>
                  )}
                </Button>
              ))}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        cell: (student) => {
          const sId = String(student.id || student.user_id || student.student_id);
          const existingRecord = attendanceRecords.find((r: any) => {
            const rStudentId = String(r.studentId || r.student_id || r.id);
            const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
            return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
          });
          const isDone = Boolean(student.attendanceId || student.attendanceStatus || student.status || existingRecord);

          return isDone ? (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 text-xs px-2.5 py-1 font-bold flex items-center gap-1.5 w-fit">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Done
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-amber-50/70 text-amber-700 dark:bg-amber-950/40 text-xs px-2.5 py-1 font-bold flex items-center gap-1.5 w-fit">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> Pending
            </Badge>
          );
        },
      },
    ],
    [selectedClassObj, selectedDivObj, manualAttendance, attendanceRecords, filterDate, setManualAttendance]
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
    <div className="p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px]">
      {/* Top Title & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 sm:h-7 sm:w-7 text-primary flex-shrink-0" />
            Student Attendance Management
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Mark daily attendance, view records, and export student reports seamlessly
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="text-xs font-semibold gap-1.5 border-border hover:bg-muted h-9"
            title="Export filtered records to Excel"
          >
            <Download className="h-4 w-4 text-primary" /> Export Excel
          </Button>

          <Button
            size="sm"
            onClick={() => setShowBulkUpload(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold text-xs h-9"
          >
            <Upload className="h-4 w-4 mr-1.5" /> Upload Excel / OCR
          </Button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Students</p>
              <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{totalCount}</p>
            </div>
            <div className="p-2.5 sm:p-3 bg-blue-50 dark:bg-blue-950 rounded-full flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Present Card */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Present</p>
              <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</p>
                {totalCount > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ({presentPercentage}%)
                  </span>
                )}
              </div>
            </div>
            <div className="p-2.5 sm:p-3 bg-emerald-50 dark:bg-emerald-950 rounded-full flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Absent Card */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Absent</p>
              <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{absentCount}</p>
            </div>
            <div className="p-2.5 sm:p-3 bg-rose-50 dark:bg-rose-950 rounded-full flex-shrink-0">
              <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Card */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending</p>
              <p className="text-2xl sm:text-3xl font-black text-orange-600 dark:text-orange-400 mt-1">{manualPendingCount}</p>
            </div>
            <div className="p-2.5 sm:p-3 bg-orange-50 dark:bg-orange-950 rounded-full flex-shrink-0">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar Card */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 items-center">
            {/* Search Box */}
            <div className="relative col-span-1 sm:col-span-2 md:col-span-1 xl:col-span-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 h-10 rounded-xl border-border bg-background transition-all text-xs font-semibold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Date Input */}
            <div>
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
                className="h-10 rounded-xl border-border bg-background px-3 text-xs font-semibold w-full"
              />
            </div>

            {/* Class Select */}
            <select
              value={filterClass}
              onChange={(e) => {
                setFilterClass(e.target.value);
                setSelectedDivision("all");
              }}
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer w-full"
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
              className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full"
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

            {/* Status Select Dropdown & Reset */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer flex-1"
              >
                <option value="all">All Statuses</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>

              {isFilterActive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllFilters}
                  className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 shrink-0"
                  title="Reset all filters"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unified Student Attendance Table & Mobile Cards Card */}
      <Card className="shadow-sm border border-border overflow-hidden">
        <CardHeader className="bg-muted/20 p-4 sm:p-6 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20 flex-shrink-0" />
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
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold text-xs h-9"
              >
                <CheckCheck className="h-4 w-4 mr-1.5" /> Mark All Present
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAbsent}
                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 font-semibold text-xs h-9"
              >
                <UserX className="h-4 w-4 mr-1.5" /> Mark All Absent
              </Button>
              {Object.keys(manualAttendance).length > 0 && (
                <Button size="sm" variant="ghost" onClick={resetSelection} className="text-xs text-muted-foreground h-9">
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin mr-3 text-primary" />
              <span className="text-xs sm:text-sm font-semibold">Loading student attendance...</span>
            </div>
          ) : (
            <>
          <DataTable
            data={displayedStudents}
            columns={columns}
            rowKey={(student) => String(student.id || student.user_id || student.student_id)}
            loading={loading}
            bordered={true}
            emptyText={hideCompleted ? "All Attendance Marked for Selected Filter!" : "No Students Found"}
            renderMobileCard={(student) => {
              const sId = String(student.id || student.user_id || student.student_id);
              const manualStatus = manualAttendance[sId];
              const existingRecord = attendanceRecords.find((r: any) => {
                const rStudentId = String(r.studentId || r.student_id || r.id);
                const rDate = r.date ? (typeof r.date === "string" ? r.date.split("T")[0] : r.date) : "";
                return rStudentId === sId && (!rDate || rDate === filterDate) && r.status;
              });
              const isDone = Boolean(student.attendanceId || student.attendanceStatus || student.status || existingRecord);
              const activeStatus = manualStatus || existingRecord?.status || student.attendanceStatus || student.status;
              const regNo = student.studentDetail?.registrationNo || student.registrationNo || student.roll_no || "N/A";
              const className = student.class_name || student.class || selectedClassObj?.name || "N/A";
              const sectionName = student.division_name || student.section || selectedDivObj?.name || "A";

              return (
                <div
                  className={`p-3.5 space-y-3 transition-colors ${
                    manualStatus === "present"
                      ? "bg-emerald-50/30 dark:bg-emerald-950/20"
                      : manualStatus === "absent"
                      ? "bg-rose-50/30 dark:bg-rose-950/20"
                      : "bg-card/60"
                  }`}
                >
                  {/* Top Row: Admission No, Name & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          Adm #{regNo}
                        </span>
                        <span className="text-xs text-muted-foreground font-semibold">
                          Class {className} ({sectionName})
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground text-sm mt-1">
                        {student.name || student.studentName || "Student"}
                      </h4>
                    </div>
                    <div>
                      {isDone ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 text-[10px] px-2 py-0.5 font-bold flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Done
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50/70 text-amber-700 dark:bg-amber-950/40 border-amber-300 text-[10px] px-2 py-0.5 font-bold flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3 text-amber-500" /> Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Manual Action Buttons (Full width on mobile) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {(["present", "absent"] as const).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={activeStatus === st ? "default" : "outline"}
                        className={`font-bold transition-all text-xs h-10 w-full rounded-xl ${
                          activeStatus === st
                            ? st === "present"
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                              : "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setManualAttendance((prev) => ({ ...prev, [sId]: st }))}
                      >
                        {st === "present" ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Present
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-1.5" /> Absent
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            }}
          />
            </>
          )}

          {displayedStudents.length === 0 && !loading && (
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
            </div>
          )}

          {/* Floating Save Action Bar */}
          {Object.keys(manualAttendance).length > 0 && (
            <div className="sticky bottom-3 sm:bottom-4 mx-2 sm:mx-4 mb-2 sm:mb-4 pt-3 sm:pt-4 bg-background/95 backdrop-blur-md p-3 sm:p-4 rounded-2xl border border-primary/20 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-20">
              <div className="text-xs sm:text-sm">
                <span className="font-extrabold text-foreground">{Object.keys(manualAttendance).length}</span>{" "}
                student selections pending save for <span className="font-semibold text-primary">{filterDate}</span>
              </div>
              <Button
                onClick={() => handleManualSave(filterDate)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-10 rounded-xl shadow-md w-full sm:w-auto"
              >
                <Sparkles className="h-4 w-4 mr-2" /> Save Attendance Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload Modal */}
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

export default AttendanceUI;
