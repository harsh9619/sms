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
  CheckCircle,
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
  CalendarDays,
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
  activeTab,
  setActiveTab,
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
  // Independent Filter State for Manual Entry Tab
  const [manualSearchQuery, setManualSearchQuery] = useState("");
  const [manualFilterClass, setManualFilterClass] = useState("all");
  const [manualSelectedDivision, setManualSelectedDivision] = useState("all");
  const [manualFilterDate, setManualFilterDate] = useState(new Date().toISOString().split("T")[0]);

  // Handle Preset quick buttons for Records view
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

  // Selected Class & Division Objects for Records Tab
  const selectedClassObj = useMemo(
    () => classes.find((c) => String(c.id) === String(filterClass) || String(c.classMasterId) === String(filterClass) || c.name === filterClass),
    [classes, filterClass]
  );

  const selectedDivObj = useMemo(
    () => selectedClassObj?.divisions?.find((d) => String(d.id) === String(selectedDivision) || d.name === selectedDivision),
    [selectedClassObj, selectedDivision]
  );

  // Selected Class & Division Objects for Manual Tab
  const manualClassObj = useMemo(
    () => classes.find((c) => String(c.id) === String(manualFilterClass) || String(c.classMasterId) === String(manualFilterClass) || c.name === manualFilterClass),
    [classes, manualFilterClass]
  );

  const manualDivObj = useMemo(
    () => manualClassObj?.divisions?.find((d) => String(d.id) === String(manualSelectedDivision) || d.name === manualSelectedDivision),
    [manualClassObj, manualSelectedDivision]
  );

  // Filtered Attendance Records (for Records Tab ONLY)
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((a: any) => {
      const matchDate =
        datePreset === "today" || datePreset === "yesterday"
          ? !filterDate || a.date === filterDate
          : !startDate || !endDate || (a.date >= startDate && a.date <= endDate);

      const matchClass =
        filterClass === "all" ||
        !filterClass ||
        String(a.classId) === String(filterClass) ||
        a.class === selectedClassObj?.name ||
        a.class?.startsWith(selectedClassObj?.name || "");

      const matchDivision =
        selectedDivision === "all" ||
        !selectedDivision ||
        String(a.divisionId) === String(selectedDivision) ||
        a.section === selectedDivObj?.name ||
        a.division === selectedDivObj?.name ||
        a.class?.includes(selectedDivObj?.name || "");

      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        a.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.rollNumber?.toString().toLowerCase().includes(searchQuery.toLowerCase());
      return matchDate && matchClass && matchDivision && matchStatus && matchSearch;
    });
  }, [attendanceRecords, filterDate, startDate, endDate, datePreset, filterClass, selectedDivision, selectedClassObj, selectedDivObj, statusFilter, searchQuery]);

  // Attendance metrics
  const totalCount = filteredAttendance.length;
  const presentCount = filteredAttendance.filter((a: any) => a.status === "present").length;
  const absentCount = filteredAttendance.filter((a: any) => a.status === "absent").length;
  const lateCount = filteredAttendance.filter((a: any) => a.status === "late").length;
  const presentPercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  // Filtered Students for Manual Entry Tab (INDEPENDENT FILTERING)
  const filteredStudentsForManual = useMemo(() => {
    return students.filter((s: any) => {
      const matchClass =
        manualFilterClass === "all" ||
        !manualFilterClass ||
        String(s.class_id) === String(manualFilterClass) ||
        String(s.class_master_id) === String(manualFilterClass) ||
        s.class_name === manualClassObj?.name ||
        s.class === manualClassObj?.name;

      const matchDivision =
        manualSelectedDivision === "all" ||
        !manualSelectedDivision ||
        String(s.division_master_id) === String(manualSelectedDivision) ||
        s.division_name === manualDivObj?.name ||
        s.section === manualDivObj?.name;

      const matchSearch =
        !manualSearchQuery ||
        s.name?.toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
        s.roll_no?.toString().toLowerCase().includes(manualSearchQuery.toLowerCase()) ||
        s.rollNumber?.toString().toLowerCase().includes(manualSearchQuery.toLowerCase());

      return matchClass && matchDivision && matchSearch;
    });
  }, [students, manualFilterClass, manualSelectedDivision, manualClassObj, manualDivObj, manualSearchQuery]);

  // Batch Marking Handlers for Manual Mode
  const markAllPresent = () => {
    const updated: Record<string, "present" | "absent" | "late"> = { ...manualAttendance };
    filteredStudentsForManual.forEach((student: any) => {
      const sId = student.id || student.user_id;
      updated[sId] = "present";
    });
    setManualAttendance(updated);
  };

  const markAllAbsent = () => {
    const updated: Record<string, "present" | "absent" | "late"> = { ...manualAttendance };
    filteredStudentsForManual.forEach((student: any) => {
      const sId = student.id || student.user_id;
      updated[sId] = "absent";
    });
    setManualAttendance(updated);
  };

  const resetSelection = () => {
    setManualAttendance({});
  };

  const handleResetRecordsFilters = () => {
    setSearchQuery("");
    setFilterClass("all");
    setSelectedDivision("all");
    setStatusFilter("all");
    handlePresetChange("today");
  };

  const isRecordsFilterActive = Boolean(
    searchQuery ||
    (filterClass && filterClass !== "all") ||
    (selectedDivision && selectedDivision !== "all") ||
    statusFilter !== "all" ||
    datePreset !== "today"
  );

  const statusIcon = (status: string) => {
    if (status === "present") return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
    if (status === "absent") return <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
    return <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/15 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-primary/10 text-primary rounded-xl">
                <ClipboardCheck className="h-6 w-6" />
              </span>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                Student Attendance Hub
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
              <span>Mark, review, and export attendance records seamlessly</span>
              {formattedDate && (
                <Badge variant="secondary" className="font-semibold text-xs gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formattedDate}
                </Badge>
              )}
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportExcel} className="shadow-sm">
              <Download className="h-4 w-4 mr-2 text-primary" /> Export Excel
            </Button>
            <Button
              onClick={() => setShowBulkUpload(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-semibold"
            >
              <Upload className="h-4 w-4 mr-2" /> Upload from Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students Marked Card */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Marked</p>
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

        {/* Late Card */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Late</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{lateCount}</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-full">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2 p-1.5 bg-muted/60 rounded-xl">
          {[
            { id: "records" as const, label: "Attendance Records", icon: ClipboardCheck },
            { id: "manual" as const, label: "Mark Attendance", icon: Zap },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${activeTab === tab.id
                ? "bg-background shadow-md text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= Records Tab ================= */}
      {activeTab === "records" && (
        <div className="space-y-4">
          {/* Records Specific Filter Toolbar */}
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4 space-y-3">
              {/* Quick Date Range Preset Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
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
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${datePreset === p.id
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 pt-1">
                {/* Search Box */}
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search by student name or roll no..."
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

                {/* Date Inputs (Single Date vs Date Range) */}
                <div className="flex items-center gap-2">
                  {datePreset === "today" || datePreset === "yesterday" ? (
                    <Input
                      type="date"
                      value={filterDate}
                      onChange={(e) => {
                        setFilterDate(e.target.value);
                        setStartDate(e.target.value);
                        setEndDate(e.target.value);
                        setDatePreset("custom");
                      }}
                      className="h-10 rounded-xl border-border bg-background px-3 text-xs font-semibold"
                    />
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setDatePreset("custom");
                        }}
                        className="h-10 rounded-xl border-border bg-background px-3 text-xs font-semibold w-36"
                        title="Start Date"
                      />
                      <span className="text-xs text-muted-foreground font-semibold">to</span>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setDatePreset("custom");
                        }}
                        className="h-10 rounded-xl border-border bg-background px-3 text-xs font-semibold w-36"
                        title="End Date"
                      />
                    </div>
                  )}
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
                  <option value="late">Late</option>
                </select>

                {/* Clear / Reset Filters Button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isRecordsFilterActive}
                  onClick={handleResetRecordsFilters}
                  className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
                  title="Reset all filters"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Log Table */}
          <Card className="overflow-hidden shadow-sm border border-border">
            <CardHeader className="bg-muted/30 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  Attendance Log
                </CardTitle>
                {/* <CardDescription className="text-xs">
                  Showing {filteredAttendance.length} attendance entry ({formattedDate})
                </CardDescription> */}
              </div>

              {/* Status Pill Filters */}
              {/* <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
                {(["all", "present", "absent", "late"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${statusFilter === st
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {st}
                  </button>
                ))}
              </div> */}
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center items-center py-20 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
                  <span className="font-semibold">Loading attendance records...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                        <th className="px-6 py-4">Admission No.</th>
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Class</th>
                        <th className="px-6 py-4">Div</th>
                        <th className="px-6 py-4">Marked By</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Status</th>


                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {filteredAttendance.map((record: any, idx: number) => {
                        const regNo =
                          record.studentDetail?.registrationNo || "N/A";
                        const timeStr =
                          record.markedAt ||
                          (record.createdAt
                            ? new Date(record.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                            : "");

                        return (
                          <tr key={record.id || `att-${idx}`} className="hover:bg-muted/30 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-foreground">{regNo}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-foreground">{record.studentName || record.name || "Student"}</p>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{record.class || "N/A"}</td>
                            <td className="px-6 py-4 text-sm font-medium">{record.section || record.division || "N/A"}</td>

                            <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                              {record.markedByName || record.markedBy || "System"}
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                              {record.date} {timeStr ? `(${timeStr})` : ""}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {record.status === "present" ? (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : record.status === "absent" ? (
                                  <XCircle className="h-4 w-4 text-rose-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-amber-500" />
                                )}
                                <Badge
                                  variant={
                                    record.status === "present"
                                      ? "success"
                                      : record.status === "absent"
                                        ? "destructive"
                                        : "warning"
                                  }
                                  className="capitalize font-bold px-2.5 py-0.5"
                                >
                                  {record.status}
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredAttendance.length === 0 && (
                    <div className="text-center py-20 px-4">
                      <ClipboardCheck className="h-14 w-14 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-lg font-bold text-foreground">No Attendance Records Found</p>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                        No records match the current filters. Switch to "Mark Attendance" tab to quickly take attendance for this date.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4 font-semibold"
                        onClick={() => setActiveTab("manual")}
                      >
                        <Zap className="h-4 w-4 mr-2 text-primary" /> Mark Attendance Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= Manual Entry Tab ================= */}
      {activeTab === "manual" && (
        <Card className="shadow-sm border border-border">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20" />
                  Mark Daily Student Attendance
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Select student attendance for <span className="font-semibold text-foreground">{manualFilterDate}</span>
                </CardDescription>
              </div>

              {/* Batch Action Quick Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllPresent}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                >
                  <CheckCheck className="h-4 w-4 mr-1.5" /> Mark All Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={markAllAbsent}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800 font-semibold"
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

            {/* Manual Entry Specific Filters Toolbar */}
            <div className="pt-4 mt-2 border-t border-border/60">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                {/* Search Box */}
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search student name or roll no to mark..."
                    value={manualSearchQuery}
                    onChange={(e) => setManualSearchQuery(e.target.value)}
                    icon={<Search className="h-4 w-4 text-muted-foreground" />}
                    className="w-full pl-9 pr-9 h-10 rounded-xl border-border bg-background/50 focus:bg-background transition-all text-sm"
                  />
                  {manualSearchQuery && (
                    <button
                      onClick={() => setManualSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Attendance Date Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-muted-foreground shrink-0">Date:</label>
                  <Input
                    type="date"
                    value={manualFilterDate}
                    onChange={(e) => setManualFilterDate(e.target.value)}
                    className="h-10 rounded-xl border-border bg-background px-3 text-xs font-semibold"
                  />
                </div>

                {/* Class Select */}
                <select
                  value={manualFilterClass}
                  onChange={(e) => {
                    setManualFilterClass(e.target.value);
                    setManualSelectedDivision("all");
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
                  value={manualSelectedDivision}
                  disabled={!manualFilterClass || manualFilterClass === "all"}
                  onChange={(e) => setManualSelectedDivision(e.target.value)}
                  className="h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <option value="all">All Sections</option>
                  {classes
                    .find((c) => String(c.classMasterId || c.id) === String(manualFilterClass))
                    ?.divisions?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                {/* Reset Manual Filters */}
                {(manualSearchQuery || manualFilterClass !== "all" || manualSelectedDivision !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setManualSearchQuery("");
                      setManualFilterClass("all");
                      setManualSelectedDivision("all");
                    }}
                    className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 shrink-0"
                    title="Reset manual filters"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-3">
              {filteredStudentsForManual.map((student: any) => {
                const sId = student.id || student.user_id;
                const status = manualAttendance[sId];

                return (
                  <div
                    key={sId}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-150 ${status === "present"
                      ? "border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20"
                      : status === "absent"
                        ? "border-rose-500/40 bg-rose-50/30 dark:bg-rose-950/20"
                        : status === "late"
                          ? "border-amber-500/40 bg-amber-50/30 dark:bg-amber-950/20"
                          : "border-border hover:bg-muted/30"
                      }`}
                  >
                    {/* Student Info */}
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                      <Badge variant="outline" className="font-mono text-xs font-semibold px-2 py-1">
                        Roll #{student.roll_no || student.rollNumber || "N/A"}
                      </Badge>
                      <div>
                        <p className="text-sm font-bold text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Class {student.class_name || student.class || "N/A"}{" "}
                          {student.division_name || student.section ? `(${student.division_name || student.section})` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Status Buttons */}
                    <div className="flex items-center gap-2">
                      {(["present", "absent", "late"] as const).map((st) => (
                        <Button
                          key={st}
                          size="sm"
                          variant={status === st ? "default" : "outline"}
                          className={`font-bold transition-all px-4 ${status === st
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
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Present (P)
                            </>
                          ) : st === "absent" ? (
                            <>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Absent (A)
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5 mr-1" /> Late (L)
                            </>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}

              {filteredStudentsForManual.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-base font-bold text-foreground">No Students Found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try clearing search query or changing class/section filters.
                  </p>
                </div>
              )}

              {/* Save Attendance Floating Action Bar */}
              {Object.keys(manualAttendance).length > 0 && (
                <div className="sticky bottom-4 pt-4 mt-6 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-primary/20 shadow-xl flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-extrabold text-foreground">{Object.keys(manualAttendance).length}</span>{" "}
                    students marked for <span className="font-semibold text-primary">{manualFilterDate}</span>
                  </div>
                  <Button
                    onClick={() => handleManualSave(manualFilterDate)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 shadow-md"
                  >
                    <Sparkles className="h-4 w-4 mr-2" /> Save Attendance Now
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload CSV / Excel & OCR Modal */}
      <BulkUploadModal
        isOpen={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        students={students}
        handleBulkImport={handleBulkImport}
        handleDownloadSampleTemplate={handleDownloadSampleTemplate}
        defaultDate={filterDate}
      />

      {/* Toast Notification */}
      {importStatus.visible && (
        <div className="fixed bottom-6 right-6 max-w-md p-4 rounded-xl shadow-2xl flex gap-3 items-start bg-emerald-50 border border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800 animate-slide-up z-50">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            {importStatus.message}
          </div>
          <button
            onClick={() => setImportStatus({ ...importStatus, visible: false })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
