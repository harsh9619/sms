import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import {
  fetchTimetablesRequest,
  createTimetableRequest,
  updateTimetableRequest,
  deleteTimetableRequest,
  generateTimetableRequest,
  fetchClassesRequest,
  fetchStudentsRequest,
  fetchTeachersRequest,
} from "../../saga";
import classService from "../../Services/class.service";
import classSubjectService from "../../Services/classSubject.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit,
  X,
  MapPin,
  User,
  BookOpen,
  Wand2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RotateCcw,
  Users,
  GraduationCap,
  Layers,
  Coffee,
  Utensils,
  Search,
  Printer,
  Info,
  HelpCircle,
} from "lucide-react";
import type { TimetableSlot, ClassInfo, Teacher } from "../../types";
import { useSchool } from "../../context/SchoolContext";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const getCurrentDayOfWeek = (): string => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayIndex = new Date().getDay();
  const day = days[todayIndex];
  return day === "sunday" ? "monday" : day;
};

const getSubjectColorStyle = (subjectName: string = "") => {
  const s = subjectName.toLowerCase();
  if (s.includes("math") || s.includes("alg") || s.includes("geom")) {
    return {
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-blue-500/30",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-400/30",
    };
  }
  if (s.includes("sci") || s.includes("bio") || s.includes("env")) {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-400/30",
    };
  }
  if (s.includes("phy")) {
    return {
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      border: "border-indigo-500/30",
      text: "text-indigo-700 dark:text-indigo-300",
      badge: "bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-400/30",
    };
  }
  if (s.includes("chem")) {
    return {
      bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
      border: "border-cyan-500/30",
      text: "text-cyan-700 dark:text-cyan-300",
      badge: "bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-400/30",
    };
  }
  if (s.includes("eng") || s.includes("lit") || s.includes("lang")) {
    return {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-500/30",
      text: "text-amber-700 dark:text-amber-300",
      badge: "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-400/30",
    };
  }
  if (s.includes("hist") || s.includes("soc") || s.includes("geog") || s.includes("civic")) {
    return {
      bg: "bg-rose-500/10 dark:bg-rose-500/20",
      border: "border-rose-500/30",
      text: "text-rose-700 dark:text-rose-300",
      badge: "bg-rose-500/20 text-rose-800 dark:text-rose-200 border-rose-400/30",
    };
  }
  if (s.includes("comp") || s.includes("it") || s.includes("code") || s.includes("tech")) {
    return {
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      border: "border-purple-500/30",
      text: "text-purple-700 dark:text-purple-300",
      badge: "bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-400/30",
    };
  }
  if (s.includes("pe") || s.includes("sport") || s.includes("pt") || s.includes("phys")) {
    return {
      bg: "bg-lime-500/10 dark:bg-lime-500/20",
      border: "border-lime-500/30",
      text: "text-lime-700 dark:text-lime-300",
      badge: "bg-lime-500/20 text-lime-800 dark:text-lime-200 border-lime-400/30",
    };
  }
  if (s.includes("art") || s.includes("music") || s.includes("draw")) {
    return {
      bg: "bg-fuchsia-500/10 dark:bg-fuchsia-500/20",
      border: "border-fuchsia-500/30",
      text: "text-fuchsia-700 dark:text-fuchsia-300",
      badge: "bg-fuchsia-500/20 text-fuchsia-800 dark:text-fuchsia-200 border-fuchsia-400/30",
    };
  }
  return {
    bg: "bg-slate-500/10 dark:bg-slate-500/20",
    border: "border-slate-500/30",
    text: "text-slate-700 dark:text-slate-300",
    badge: "bg-slate-500/20 text-slate-800 dark:text-slate-200 border-slate-400/30",
  };
};

const isCurrentPeriodNow = (dayOfWeek: string, startTimeStr: string, endTimeStr: string) => {
  const now = new Date();
  const currentDay = getCurrentDayOfWeek();
  if (dayOfWeek.toLowerCase() !== currentDay.toLowerCase()) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = startTimeStr.substring(0, 5).split(":").map(Number);
  const [endH, endM] = endTimeStr.substring(0, 5).split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

const mapStateToProps = (state: AppState) => ({
  reduxClasses: state.classes.classes,
  reduxStudents: state.students.students,
  reduxTeachers: state.teachers.teachers,
  reduxTimetable: state.timetables.timetables,
  loading: state.timetables.loading,
  lastGenResult: state.timetables.lastGenResult,
  reduxError: state.timetables.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchClassesRequest: () => dispatch(fetchClassesRequest()),
  fetchStudentsRequest: () => dispatch(fetchStudentsRequest()),
  fetchTeachersRequest: () => dispatch(fetchTeachersRequest()),
  fetchTimetablesRequest: (params?: any) => dispatch(fetchTimetablesRequest(params)),
  createTimetableRequest: (t: any) => dispatch(createTimetableRequest(t)),
  updateTimetableRequest: (payload: { id: string; t: any }) => dispatch(updateTimetableRequest(payload)),
  deleteTimetableRequest: (id: string) => dispatch(deleteTimetableRequest(id)),
  generateTimetableRequest: (config: any) => dispatch(generateTimetableRequest(config)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

function TimetablePageContent({
  reduxClasses,
  reduxStudents,
  reduxTeachers,
  reduxTimetable,
  loading,
  lastGenResult,
  reduxError,
  fetchClassesRequest,
  fetchStudentsRequest,
  fetchTeachersRequest,
  fetchTimetablesRequest,
  createTimetableRequest,
  updateTimetableRequest,
  deleteTimetableRequest,
  generateTimetableRequest,
}: PropsFromRedux) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [studentClassId, setStudentClassId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [unassignedSubjects, setUnassignedSubjects] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    dayOfWeek: getCurrentDayOfWeek(),
    startTime: "08:30",
    endTime: "09:30",
    classroom: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Auto-Generator Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genConfig, setGenConfig] = useState({
    scope: "selected", // "selected" or "all"
    daysOfWeek: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    startTime: "08:30",
    endTime: "14:30",
    periodDuration: 45,
    breakStartTime: "11:30",
    breakEndTime: "12:00",
    clearExisting: true,
  });

  useEffect(() => {
    fetchClassesRequest();
    fetchStudentsRequest();
    fetchTeachersRequest();
  }, [fetchClassesRequest, fetchStudentsRequest, fetchTeachersRequest, activeSchool]);

  useEffect(() => {
    setClasses(reduxClasses);
  }, [reduxClasses]);

  useEffect(() => {
    setTeachers(reduxTeachers);
  }, [reduxTeachers]);

  // If Admin, School Admin, or Principal, fetch unassigned subject teacher configurations
  useEffect(() => {
    const role = (user?.role || "").toLowerCase();
    if (role === "admin" || role === "school_admin" || role === "principal") {
      classSubjectService
        .getSubjectsWithTeachers({ status: "UNASSIGNED", limit: 100 })
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.items || res?.data || [];
          const unassigned = list.filter((item: any) => item.teacherId === null);
          setUnassignedSubjects(unassigned);
        })
        .catch((err) => console.error("Failed to fetch unassigned subject teacher configurations:", err));
    }
  }, [user, activeSchool]);

  useEffect(() => {
    if (user?.role === "student") {
      const profile = reduxStudents.find((s: any) => s.email === user.email);
      if (profile && (profile as any).classId) {
        setStudentClassId((profile as any).classId);
      }
    } else if (user?.role === "teacher") {
      if (!selectedTeacherId) {
        setSelectedTeacherId(String(user.id));
      }
    }
  }, [user, reduxStudents, selectedTeacherId]);

  // Extract available unique divisions/sections
  const availableDivisions = useMemo(() => {
    const divs = reduxClasses.map((c) => c.section || c.division).filter(Boolean) as string[];
    return Array.from(new Set(divs)).sort();
  }, [reduxClasses]);

  // Fetch timetables based on active filters
  useEffect(() => {
    let params: any = {};

    if (user?.role === "student" && studentClassId) {
      params.classId = studentClassId;
    } else {
      if (selectedClassId) params.classId = selectedClassId;
      if (selectedTeacherId) params.teacherId = selectedTeacherId;
    }

    if (selectedDivision) params.division = selectedDivision;
    if (selectedDay) params.dayOfWeek = selectedDay;

    fetchTimetablesRequest(params);
  }, [
    user,
    selectedClassId,
    selectedTeacherId,
    selectedDivision,
    selectedDay,
    studentClassId,
    activeSchool,
    fetchTimetablesRequest,
  ]);

  // Filter slots locally if needed
  const timetable = useMemo(() => {
    let list = reduxTimetable;

    if (user?.role === "student" && studentClassId) {
      list = list.filter((t: any) => String(t.classId) === String(studentClassId));
    }
    if (selectedClassId) {
      list = list.filter((t: any) => String(t.classId) === String(selectedClassId));
    }
    if (selectedTeacherId) {
      list = list.filter((t: any) => String(t.teacherId) === String(selectedTeacherId));
    }
    if (selectedDivision) {
      list = list.filter(
        (t: any) =>
          (t.section || "").toLowerCase() === selectedDivision.toLowerCase()
      );
    }
    if (selectedDay) {
      list = list.filter(
        (t: any) => t.dayOfWeek.toLowerCase() === selectedDay.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t: any) =>
          (t.subjectName || "").toLowerCase().includes(q) ||
          (t.teacherName || "").toLowerCase().includes(q) ||
          (t.classroom || "").toLowerCase().includes(q) ||
          (t.className || "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [reduxTimetable, user, selectedClassId, selectedTeacherId, selectedDivision, selectedDay, studentClassId, searchQuery]);

  // Break / Recess Time Config state
  const [breakConfig, setBreakConfig] = useState<{
    enabled: boolean;
    startTime: string;
    endTime: string;
    title: string;
  }>({
    enabled: true,
    startTime: "11:30",
    endTime: "12:00",
    title: "Lunch & Recess Break",
  });
  const [showBreakControls, setShowBreakControls] = useState(false);

  // Role-specific Insight KPI Statistics
  const roleStats = useMemo(() => {
    const totalSlots = timetable.length;
    const uniqueSubjects = new Set(timetable.map((t) => t.subjectName)).size;
    const todayDay = getCurrentDayOfWeek();
    const todaySlots = timetable.filter((t) => t.dayOfWeek.toLowerCase() === todayDay.toLowerCase());

    if (user?.role === "teacher") {
      const teacherSlots = timetable.filter((t) => String(t.teacherId) === String(user.id));
      const teacherTodaySlots = teacherSlots.filter((t) => t.dayOfWeek.toLowerCase() === todayDay.toLowerCase());
      return [
        { label: "My Weekly Periods", val: teacherSlots.length, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Classes Today", val: teacherTodaySlots.length, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Unique Subjects", val: uniqueSubjects, icon: Layers, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Lunch Break Window", val: breakConfig.enabled ? `${breakConfig.startTime} - ${breakConfig.endTime}` : "None", icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    } else if (user?.role === "student") {
      return [
        { label: "Class Weekly Slots", val: totalSlots, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Classes Today", val: todaySlots.length, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Total Subjects", val: uniqueSubjects, icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Lunch Break Window", val: breakConfig.enabled ? `${breakConfig.startTime} - ${breakConfig.endTime}` : "None", icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    } else {
      const uniqueClasses = new Set(timetable.map((t) => t.classId)).size;
      const uniqueTeachers = new Set(timetable.map((t) => t.teacherId)).size;
      return [
        { label: "Total Period Slots", val: totalSlots, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Active Classes", val: uniqueClasses || classes.length, icon: GraduationCap, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { label: "Teaching Staff", val: uniqueTeachers || teachers.length, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Recess Break Window", val: breakConfig.enabled ? `${breakConfig.startTime} - ${breakConfig.endTime}` : "Disabled", icon: Coffee, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    }
  }, [timetable, user, classes, teachers, breakConfig]);

  useEffect(() => {
    const cid = formData.classId || selectedClassId || (classes[0]?.id || "");
    if (cid) {
      classService
        .getSubjects({ classId: cid })
        .then((subs: any) => setSubjects(subs))
        .catch((err: any) => console.error(err));
    }
  }, [formData.classId, selectedClassId, classes]);

  const handleResetFilters = () => {
    setSelectedClassId("");
    setSelectedTeacherId(user?.role === "teacher" ? String(user.id) : "");
    setSelectedDivision("");
    setSelectedDay("");
    setSearchQuery("");
  };

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      classId: selectedClassId || (classes[0]?.id || ""),
      subjectId: "",
      dayOfWeek: selectedDay || getCurrentDayOfWeek(),
      startTime: "08:30",
      endTime: "09:30",
      classroom: "",
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      classId: slot.classId,
      subjectId: slot.subjectId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.substring(0, 5),
      endTime: slot.endTime.substring(0, 5),
      classroom: slot.classroom || "",
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable slot?")) return;
    deleteTimetableRequest(id);
  };

  const handleSave = () => {
    setError(null);
    if (!formData.classId || !formData.subjectId || !formData.startTime || !formData.endTime) {
      setError("Please fill out all required fields.");
      return;
    }

    const payload = {
      ...formData,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };

    if (editingSlot) {
      updateTimetableRequest({ id: editingSlot.id, t: payload });
      setShowModal(false);
    } else {
      createTimetableRequest(payload);
      setShowModal(false);
    }
  };

  const handleRunGenerator = () => {
    const payload = {
      classId: genConfig.scope === "selected" && selectedClassId ? selectedClassId : null,
      daysOfWeek: genConfig.daysOfWeek,
      startTime: genConfig.startTime,
      endTime: genConfig.endTime,
      periodDuration: Number(genConfig.periodDuration),
      breakStartTime: genConfig.breakStartTime || undefined,
      breakEndTime: genConfig.breakEndTime || undefined,
      clearExisting: genConfig.clearExisting,
    };
    generateTimetableRequest(payload);
    setShowGenModal(false);
  };

  const toggleDaySelection = (day: string) => {
    setGenConfig((prev) => {
      const exists = prev.daysOfWeek.includes(day);
      if (exists) {
        return { ...prev, daysOfWeek: prev.daysOfWeek.filter((d) => d !== day) };
      } else {
        return { ...prev, daysOfWeek: [...prev.daysOfWeek, day] };
      }
    });
  };

  // Days to display (all days or specific filtered day)
  const displayDays = useMemo(() => {
    if (selectedDay) {
      return DAYS_OF_WEEK.filter((d) => d.toLowerCase() === selectedDay.toLowerCase());
    }
    return DAYS_OF_WEEK;
  }, [selectedDay]);

  // Group slots by day
  const groupedTimetable = useMemo(() => {
    const groups: Record<string, TimetableSlot[]> = {};
    displayDays.forEach((day) => {
      groups[day] = [];
    });

    timetable.forEach((slot) => {
      const day = slot.dayOfWeek.toLowerCase();
      if (groups[day]) {
        groups[day].push(slot);
      }
    });

    // Sort chronologically
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return groups;
  }, [timetable, displayDays]);

  const hasActiveFilters = Boolean(selectedClassId || selectedTeacherId || selectedDivision || selectedDay);

  // View Mode: "weekly" (columns per day) or "dayGrid" (matrix of periods x classes for chosen day)
  const [viewMode, setViewMode] = useState<"weekly" | "dayGrid">("weekly");
  const [activeGridDay, setActiveGridDay] = useState<string>(getCurrentDayOfWeek());

  // Extract unique sorted period time ranges for Day Grid Matrix + break time slot
  const uniqueTimeSlots = useMemo(() => {
    const set = new Set<string>();
    reduxTimetable.forEach((slot) => {
      const timeStr = `${slot.startTime.substring(0, 5)} - ${slot.endTime.substring(0, 5)}`;
      set.add(timeStr);
    });

    if (breakConfig.enabled && breakConfig.startTime && breakConfig.endTime) {
      const breakStr = `${breakConfig.startTime} - ${breakConfig.endTime}`;
      set.add(breakStr);
    }

    return Array.from(set).sort();
  }, [reduxTimetable, breakConfig]);

  // Handle Day Filter change to automatically switch to dayGrid if a single day is picked
  const handleDayFilterChange = (dayVal: string) => {
    setSelectedDay(dayVal);
    if (dayVal) {
      setActiveGridDay(dayVal.toLowerCase());
      setViewMode("dayGrid");
    } else {
      setViewMode("weekly");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Note Bar for Unassigned Subject Teachers */}
      {(user?.role === "admin" || user?.role === "school_admin" || user?.role === "principal") &&
        unassignedSubjects.length > 0 && (
          <div className="bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <span>Unassigned Subject Teachers Note</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-extrabold shadow-xs">
                    {unassignedSubjects.length} Unassigned
                  </span>
                </h4>
                <p className="text-xs mt-0.5 font-medium leading-relaxed opacity-90">
                  There are <strong>{unassignedSubjects.length} class subject(s)</strong> currently without an assigned teacher. Assign teachers now to generate timetables.
                </p>
              </div>
            </div>
            <Link
              to={`/school/${activeSchool?.id || "1"}/subject-teacher-config?status=UNASSIGNED`}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all hover:scale-102"
            >
              <Users className="h-3.5 w-3.5" />
              Assign Teachers
            </Link>
          </div>
        )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/60 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
            <Calendar className="h-7 w-7 text-primary animate-pulse-glow" />
            School Timetable Portal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "student"
              ? "View your daily & weekly class schedule"
              : user?.role === "teacher"
                ? "View and manage your assigned teaching schedule"
                : "Master School Timetable Overview & Management"}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Print Schedule Button */}
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="gap-1.5 border-border hover:bg-muted text-xs font-semibold"
          >
            <Printer className="h-4 w-4" /> Print / Export PDF
          </Button>

          {/* View Mode Toggle Switcher */}
          <div className="bg-muted/50 p-1 rounded-xl border border-border/60 flex items-center gap-1">
            <button
              onClick={() => {
                setViewMode("weekly");
                setSelectedDay("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "weekly"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Calendar className="h-3.5 w-3.5" /> Weekly View
            </button>
            <button
              onClick={() => {
                setViewMode("dayGrid");
                if (!activeGridDay) setActiveGridDay(getCurrentDayOfWeek());
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === "dayGrid"
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Layers className="h-3.5 w-3.5" /> Day Grid Matrix
            </button>
          </div>

          {user?.role === "admin" && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowGenModal(true)}
                className="border-primary/40 text-primary hover:bg-primary/10 gap-2 font-semibold"
              >
                <Wand2 className="h-4 w-4" /> Auto Generate
              </Button>
              <Button onClick={openAddModal} className="gap-2">
                <Plus className="h-4 w-4" /> Add Slot
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Role-tailored Overview KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {roleStats.map((stat, idx) => {
          const IconComp = stat.icon;
          return (
            <div
              key={idx}
              className="bg-card/70 border border-border/60 p-4 rounded-2xl flex items-center gap-3.5 shadow-xs hover:border-primary/30 transition-all"
            >
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <IconComp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                <h4 className="text-lg font-bold text-foreground mt-0.5">{stat.val}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject Color Legend Pill Strip */}
      {/* <div className="bg-card/40 border border-border/50 rounded-2xl p-3.5 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="font-semibold text-muted-foreground text-[11px] uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Subject Legend:
        </span>
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 font-semibold">
            Mathematics
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold">
            Science / Bio
          </span>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-semibold">
            Physics
          </span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 font-semibold">
            Chemistry
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-semibold">
            English / Lang
          </span>
          <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold">
            History / Social
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 font-semibold">
            Computer / IT
          </span>
          <span className="px-2.5 py-1 rounded-full bg-lime-500/15 border border-lime-500/30 text-lime-700 dark:text-lime-300 font-semibold">
            Sports / P.E.
          </span>
          <span className="px-2.5 py-1 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 font-semibold">
            Arts / Music
          </span>
        </div>
      </div> */}

      {/* Dynamic Filter Controls Panel */}
      <div className="bg-card/70 border border-border/70 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filter Timetable View</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBreakControls(!showBreakControls)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${breakConfig.enabled
                ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-muted/40 border-border text-muted-foreground"
                }`}
            >
              <Coffee className="h-3.5 w-3.5" />
              <span>
                Break Time: {breakConfig.enabled ? `${breakConfig.startTime} - ${breakConfig.endTime}` : "Disabled"}
              </span>
            </button>
            {(hasActiveFilters || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Break Time Controls Drawer */}
        {showBreakControls && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 animate-fade-in grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-amber-700 dark:text-amber-300">Break Title</label>
              <Input
                value={breakConfig.title}
                onChange={(e) => setBreakConfig({ ...breakConfig, title: e.target.value })}
                placeholder="e.g. Lunch Break"
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-amber-700 dark:text-amber-300">Break Start Time</label>
              <Input
                type="time"
                value={breakConfig.startTime}
                onChange={(e) => setBreakConfig({ ...breakConfig, startTime: e.target.value })}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-amber-700 dark:text-amber-300">Break End Time</label>
              <Input
                type="time"
                value={breakConfig.endTime}
                onChange={(e) => setBreakConfig({ ...breakConfig, endTime: e.target.value })}
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-700 dark:text-amber-300">
                <input
                  type="checkbox"
                  checked={breakConfig.enabled}
                  onChange={(e) => setBreakConfig({ ...breakConfig, enabled: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                Show Break in Timetable
              </label>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Quick Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5 text-primary/70" /> Quick Search
            </label>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, teacher..."
                className="h-10 text-xs pl-8 bg-background rounded-xl border border-input focus:ring-2 focus:ring-primary"
              />
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Class-wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary/70" /> Class Wise
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={user?.role === "student"}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium text-foreground transition-all"
            >
              <option value="">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.name}-{c.section}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher-wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary/70" /> Teacher Wise
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium text-foreground transition-all"
            >
              <option value="">All Teachers</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Division-wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-primary/70" /> Division Wise
            </label>
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium text-foreground transition-all"
            >
              <option value="">All Divisions</option>
              {availableDivisions.map((div) => (
                <option key={div} value={div}>
                  Division {div}
                </option>
              ))}
            </select>
          </div>

          {/* Day-wise Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary/70" /> Day Wise
            </label>
            <select
              value={selectedDay}
              onChange={(e) => handleDayFilterChange(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium text-foreground transition-all"
            >
              <option value="">All Operating Days</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium">Active Filters:</span>
            {selectedClassId && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium flex items-center gap-1">
                Class: {classes.find((c) => c.id === selectedClassId)?.name}
                <X
                  className="h-3 w-3 cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedClassId("")}
                />
              </span>
            )}
            {selectedTeacherId && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium flex items-center gap-1">
                Teacher:{" "}
                {teachers.find((t) => String(t.id) === String(selectedTeacherId))?.name ||
                  selectedTeacherId}
                <X
                  className="h-3 w-3 cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedTeacherId("")}
                />
              </span>
            )}
            {selectedDivision && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium flex items-center gap-1">
                Division: {selectedDivision}
                <X
                  className="h-3 w-3 cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedDivision("")}
                />
              </span>
            )}
            {selectedDay && (
              <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium flex items-center gap-1">
                Day: {selectedDay.toUpperCase()}
                <X
                  className="h-3 w-3 cursor-pointer hover:opacity-80"
                  onClick={() => setSelectedDay("")}
                />
              </span>
            )}
          </div>
        )}
      </div>


      {/* Redux Error Banner */}
      {reduxError && (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive dark:text-red-300 flex items-start justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider">Timetable Action Failed</h5>
              <p className="text-xs font-medium mt-1 leading-relaxed">{reduxError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generation Result Banner */}
      {lastGenResult && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span>{lastGenResult.message}</span>
          </div>
          {lastGenResult.warnings && lastGenResult.warnings.length > 0 && (
            <div className="mt-1 pt-2 border-t border-emerald-500/20 text-xs space-y-1">
              <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Generation Warnings:
              </span>
              {lastGenResult.warnings.map((w, idx) => (
                <p key={idx} className="text-muted-foreground pl-4">
                  • {w}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 bg-card/30 rounded-2xl border border-border/40">
          <Clock className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Processing timetable schedule...</p>
        </div>
      ) : viewMode === "dayGrid" ? (
        <div className="space-y-4 animate-fade-in">
          {/* Day Selector Pills Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none bg-card/40 p-2 rounded-2xl border border-border/50">
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setActiveGridDay(d);
                  setSelectedDay(d);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${activeGridDay.toLowerCase() === d
                  ? "bg-primary text-primary-foreground border-primary shadow-md scale-102"
                  : "bg-card hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Day Grid Matrix Table */}
          <div className="bg-card/80 border border-border/70 rounded-2xl overflow-x-auto shadow-md backdrop-blur-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider text-[11px]">
                  <th className="p-4 border-r border-border min-w-[150px] font-bold text-primary">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" /> Time Period
                    </div>
                  </th>
                  {(selectedClassId
                    ? classes.filter((c) => c.id === selectedClassId)
                    : classes
                  ).map((c) => (
                    <th
                      key={c.id}
                      className="p-4 border-r border-border min-w-[170px] text-center font-bold text-foreground bg-primary/5"
                    >
                      Class {c.name}-{c.section}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {(uniqueTimeSlots.length > 0
                  ? uniqueTimeSlots
                  : [
                    "08:30 - 09:15",
                    "09:15 - 10:00",
                    "10:00 - 10:45",
                    "11:30 - 12:00",
                    "12:00 - 12:45",
                    "12:45 - 13:30",
                  ]
                ).map((timeSlot) => {
                  const targetClasses = selectedClassId
                    ? classes.filter((c) => c.id === selectedClassId)
                    : classes;

                  const isBreakRow =
                    breakConfig.enabled &&
                    timeSlot === `${breakConfig.startTime} - ${breakConfig.endTime}`;

                  if (isBreakRow) {
                    return (
                      <tr
                        key={timeSlot}
                        className="bg-amber-500/15 border-y-2 border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                      >
                        <td className="p-3.5 border-r border-amber-500/30 whitespace-nowrap text-xs bg-amber-500/10">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Coffee className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span>{timeSlot}</span>
                          </div>
                        </td>
                        <td
                          colSpan={targetClasses.length}
                          className="p-3.5 text-center text-xs tracking-wider uppercase bg-amber-500/10 font-bold text-amber-700 dark:text-amber-300"
                        >
                          🍽️ {breakConfig.title} (Recess Break All Classes)
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={timeSlot} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-bold text-muted-foreground bg-muted/15 border-r border-border whitespace-nowrap text-xs">
                        {timeSlot}
                      </td>
                      {targetClasses.map((c) => {
                        const slot = timetable.find((t) => {
                          const startStr = t.startTime ? t.startTime.substring(0, 5) : "";
                          const [slotStart] = timeSlot.split(" - ");
                          return (
                            String(t.classId) === String(c.id) &&
                            t.dayOfWeek.toLowerCase() === activeGridDay.toLowerCase() &&
                            startStr === slotStart
                          );
                        });

                        return (
                          <td
                            key={c.id}
                            className="p-2 border-r border-border/60 align-top min-w-[170px]"
                          >
                            {(() => {
                              if (!slot) {
                                return (
                                  <div className="flex flex-col items-center justify-center min-h-[72px] text-muted-foreground/40 text-[10px] font-medium bg-muted/10 rounded-xl border border-dashed border-border/40 p-2">
                                    <span className="text-[10px] font-semibold opacity-70">Free Period</span>
                                    <span className="text-[9px] text-muted-foreground/50">Unassigned</span>
                                  </div>
                                );
                              }

                              const colorStyle = getSubjectColorStyle(slot.subjectName);
                              const isActiveNow = isCurrentPeriodNow(slot.dayOfWeek, slot.startTime, slot.endTime);

                              return (
                                <div
                                  className={`group relative ${colorStyle.bg} border ${isActiveNow ? "border-emerald-500 ring-2 ring-emerald-500/30" : colorStyle.border
                                    } hover:border-primary rounded-xl p-3 shadow-xs hover-lift transition-all`}
                                >
                                  {isActiveNow && (
                                    <div className="mb-1.5 flex items-center">
                                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold tracking-wider uppercase animate-pulse flex items-center gap-1 shadow-xs">
                                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                        NOW ACTIVE
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-start justify-between gap-1">
                                    <h5 className={`font-bold text-xs ${colorStyle.text} group-hover:text-primary transition-colors truncate`}>
                                      {slot.subjectName}
                                    </h5>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${colorStyle.badge} shrink-0`}>
                                      {slot.subjectName.substring(0, 3).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-border/40 text-[10px] space-y-1 text-muted-foreground">
                                    {slot.teacherName && (
                                      <div className="flex items-center gap-1.5 truncate font-medium">
                                        <User className="h-3 w-3 text-primary/70 shrink-0" />
                                        <span className="truncate">{slot.teacherName}</span>
                                      </div>
                                    )}
                                    {slot.classroom && (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                        <span className="truncate">{slot.classroom}</span>
                                      </div>
                                    )}
                                  </div>
                                  {user?.role === "admin" && (
                                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => openEditModal(slot)}
                                        className="p-1 rounded bg-background border border-border hover:text-primary shadow-xs"
                                        title="Edit"
                                      >
                                        <Edit className="h-3 w-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(slot.id)}
                                        className="p-1 rounded bg-background border border-border hover:text-destructive shadow-xs"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className={`grid grid-cols-1 ${displayDays.length === 1
            ? "max-w-2xl mx-auto"
            : displayDays.length <= 3
              ? "md:grid-cols-3"
              : "md:grid-cols-3 xl:grid-cols-6"
            } gap-5`}
        >
          {displayDays.map((day) => {
            const slots = groupedTimetable[day] || [];
            return (
              <div key={day} className="space-y-3.5">
                <div className="p-3 bg-primary/10 rounded-xl text-center border border-primary/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                    {day}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{slots.length} Classes</p>
                </div>

                <div className="space-y-3 min-h-[300px] bg-muted/20 p-2.5 rounded-xl border border-border/50">
                  {(() => {
                    const elements: React.ReactNode[] = [];
                    let breakInserted = false;
                    const breakTimeRange = `${breakConfig.startTime} - ${breakConfig.endTime}`;

                    slots.forEach((slot) => {
                      const slotStart = slot.startTime.substring(0, 5);

                      if (
                        breakConfig.enabled &&
                        !breakInserted &&
                        slotStart >= breakConfig.startTime
                      ) {
                        breakInserted = true;
                        elements.push(
                          <div
                            key="recess-break-card"
                            className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-center shadow-xs my-2 animate-fade-in"
                          >
                            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <Coffee className="h-4 w-4" />
                              <span>{breakConfig.title}</span>
                            </div>
                            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-semibold">
                              {breakTimeRange}
                            </p>
                          </div>
                        );
                      }

                      const colorStyle = getSubjectColorStyle(slot.subjectName);
                      const isActiveNow = isCurrentPeriodNow(slot.dayOfWeek, slot.startTime, slot.endTime);

                      elements.push(
                        <div
                          key={slot.id}
                          className={`group relative ${colorStyle.bg} border ${isActiveNow ? "border-emerald-500 ring-2 ring-emerald-500/30" : colorStyle.border
                            } rounded-xl p-3.5 shadow-xs transition-all duration-300 hover-lift text-left`}
                        >
                          {isActiveNow && (
                            <div className="mb-2 flex items-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold tracking-wider uppercase animate-pulse flex items-center gap-1 shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                NOW ACTIVE
                              </span>
                            </div>
                          )}

                          {/* Top Time Badge & Subject Tag */}
                          <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-muted-foreground mb-2">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 text-primary/70" />
                              <span>
                                {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                              </span>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${colorStyle.badge}`}>
                              {slot.subjectName.substring(0, 3).toUpperCase()}
                            </span>
                          </div>

                          {/* Subject Name */}
                          <h4 className={`font-bold text-sm tracking-tight ${colorStyle.text} group-hover:text-primary transition-colors`}>
                            {slot.subjectName}
                          </h4>

                          {/* Classroom, Teacher & Class details */}
                          <div className="space-y-1.5 mt-3 pt-2.5 border-t border-border/40 text-[10px] text-muted-foreground">
                            {slot.className && (
                              <div className="flex items-center gap-1.5 font-medium text-primary/90">
                                <BookOpen className="h-3 w-3" />
                                <span>Class {slot.className}</span>
                              </div>
                            )}
                            {slot.teacherName && (
                              <div className="flex items-center gap-1.5">
                                <User className="h-3 w-3 text-muted-foreground/75" />
                                <span className="truncate">{slot.teacherName}</span>
                              </div>
                            )}
                            {slot.classroom && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-3 w-3 text-muted-foreground/75" />
                                <span className="truncate">{slot.classroom}</span>
                              </div>
                            )}
                          </div>

                          {/* Admin Operations overlay */}
                          {user?.role === "admin" && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditModal(slot)}
                                className="p-1 rounded-md bg-background border border-border text-muted-foreground hover:text-primary shadow-sm hover:scale-105 transition-transform"
                                title="Edit"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(slot.id)}
                                className="p-1 rounded-md bg-background border border-border text-muted-foreground hover:text-destructive shadow-sm hover:scale-105 transition-transform"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    });

                    if (breakConfig.enabled && !breakInserted) {
                      elements.push(
                        <div
                          key="recess-break-card-end"
                          className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-center shadow-xs my-2 animate-fade-in"
                        >
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                            <Coffee className="h-4 w-4" />
                            <span>{breakConfig.title}</span>
                          </div>
                          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-semibold">
                            {breakTimeRange}
                          </p>
                        </div>
                      );
                    }

                    return elements;
                  })()}

                  {slots.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                      <Calendar className="h-8 w-8 stroke-[1.5] mb-1.5" />
                      <span className="text-[10px] font-medium">Free Day</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto Timetable Generator Modal */}
      {showGenModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowGenModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between bg-primary/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Automatic Timetable Generator</h3>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-left max-h-[80vh] overflow-y-auto">
              <p className="text-xs text-muted-foreground">
                Configure constraints for automatic timetable generation. The algorithm will assign
                subjects & available teachers without time conflicts.
              </p>

              {/* Target Scope */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Target Scope</label>
                <select
                  value={genConfig.scope}
                  onChange={(e) => setGenConfig({ ...genConfig, scope: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="selected">
                    Selected Class Only (
                    {classes.find((c) => c.id === selectedClassId)
                      ? `${classes.find((c) => c.id === selectedClassId)?.name}-${classes.find((c) => c.id === selectedClassId)?.section
                      }`
                      : "Current"}
                    )
                  </option>
                  <option value="all">All Classes in School</option>
                </select>
              </div>

              {/* Days of Week */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Operating Days</label>
                <div className="grid grid-cols-3 gap-2">
                  {DAYS_OF_WEEK.map((d) => {
                    const isChecked = genConfig.daysOfWeek.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDaySelection(d)}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${isChecked
                          ? "bg-primary/15 border-primary text-primary"
                          : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                          }`}
                      >
                        {d.substring(0, 3).toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start & End Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={genConfig.startTime}
                    onChange={(e) => setGenConfig({ ...genConfig, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">End Time</label>
                  <Input
                    type="time"
                    value={genConfig.endTime}
                    onChange={(e) => setGenConfig({ ...genConfig, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Period Duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Period Duration (Minutes)
                </label>
                <Input
                  type="number"
                  value={genConfig.periodDuration}
                  onChange={(e) =>
                    setGenConfig({ ...genConfig, periodDuration: Number(e.target.value) })
                  }
                  min={15}
                  max={120}
                />
              </div>

              {/* Break / Recess Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Break Start</label>
                  <Input
                    type="time"
                    value={genConfig.breakStartTime}
                    onChange={(e) => setGenConfig({ ...genConfig, breakStartTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Break End</label>
                  <Input
                    type="time"
                    value={genConfig.breakEndTime}
                    onChange={(e) => setGenConfig({ ...genConfig, breakEndTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Clear Existing Checkbox */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genConfig.clearExisting}
                  onChange={(e) => setGenConfig({ ...genConfig, clearExisting: e.target.checked })}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <span className="text-xs font-medium text-foreground">
                  Clear existing timetable slots for target class(es)
                </span>
              </label>

              {/* Subject Teacher Requirement Note Box */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5 mt-2">
                <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 w-full">
                  <span className="font-bold text-xs">Subject Teacher Requirement Note:</span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    All class subjects must have an assigned <strong>Subject Teacher</strong> prior to generation. If any subject lacks an assigned teacher, generation will be blocked.
                  </p>
                  {unassignedSubjects.length > 0 && (
                    <div className="pt-2 border-t border-amber-500/20 mt-2">
                      <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> {unassignedSubjects.length} unassigned class subject(s) detected:
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {unassignedSubjects.slice(0, 5).map((sub: any, idx: number) => {
                          const clsLabel = sub.className ? `${sub.className}${sub.classSection ? `-${sub.classSection}` : ""}` : "";
                          const subLabel = sub.name || sub.masterSubjectName || sub.subjectName || "Subject";
                          return (
                            <span key={idx} className="px-2 py-0.5 rounded bg-background/80 border border-amber-500/40 text-[10px] font-semibold">
                              {clsLabel ? `${clsLabel}: ${subLabel}` : subLabel}
                            </span>
                          );
                        })}
                      </div>
                      <div className="mt-2">
                        <Link
                          to={`/school/${activeSchool?.id || "1"}/subject-teacher-config?status=UNASSIGNED`}
                          onClick={() => setShowGenModal(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-200 underline hover:opacity-80"
                        >
                          Go to Subject Teacher Configuration &rarr;
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5 bg-muted/20">
              <Button variant="outline" onClick={() => setShowGenModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleRunGenerator} className="gap-2">
                <Wand2 className="h-4 w-4" /> Generate Timetable
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Slot Modal Dialog */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSlot ? "Edit Slot" : "Add Timetable Slot"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              {/* Class Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData({ ...formData, classId: e.target.value, subjectId: "" })
                  }
                  disabled={!!editingSlot}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>
                    Select a class
                  </option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      Class {c.name}-{c.section}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>
                    Select a subject
                  </option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of Week Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">End Time</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Classroom */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Classroom (Optional)
                </label>
                <Input
                  placeholder="e.g. Room 102"
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const TimetablePage = mapper(TimetablePageContent);
