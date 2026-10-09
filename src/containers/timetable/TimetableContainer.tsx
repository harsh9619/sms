import React, { useState, useEffect, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
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
import type { TimetableSlot, ClassInfo, Teacher } from "../../types";
import { TimetableUI } from "../../components/modules/timetable/TimetableUI";
import { Calendar, Clock, BookOpen, Layers, Coffee, GraduationCap, Users } from "lucide-react";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const getCurrentDayOfWeek = (): string => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const todayIndex = new Date().getDay();
  const day = days[todayIndex];
  return day === "sunday" ? "monday" : day;
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

function TimetableContainerContent({
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
  const [subjectTeacherConfigs, setSubjectTeacherConfigs] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: getCurrentDayOfWeek(),
    startTime: "08:30",
    endTime: "09:30",
    classroom: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch subject teacher configurations for pre-selecting teacher
  useEffect(() => {
    classSubjectService
      .getSubjectsWithTeachers({ limit: 1000 })
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.items || res?.data || [];
        setSubjectTeacherConfigs(list);
      })
      .catch((err) => console.error("Failed to fetch subject teacher configs:", err));
  }, [activeSchool]);

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

  // Fetch unassigned subject teacher configurations for Admin/School Admin/Principal
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

  // Resolve Student class or Teacher ID based on user role
  useEffect(() => {
    const role = (user?.role || "").toLowerCase();
    if (role === "student") {
      const profile = reduxStudents.find(
        (s: any) =>
          s.email === user?.email ||
          String(s.user_id) === String(user?.id) ||
          String(s.id) === String(user?.id) ||
          (user?.studentId && String(s.id) === String(user?.studentId))
      );

      const clsId =
        (profile as any)?.class_master_id ||
        (profile as any)?.class_id ||
        (profile as any)?.classId ||
        user?.class;

      if (clsId) {
        setStudentClassId(String(clsId));
      }
    } else if (role === "teacher") {
      const teacherProfile = reduxTeachers.find(
        (t: any) =>
          String(t.id) === String(user?.id) ||
          t.email === user?.email ||
          (user?.roleId && String(t.roleId) === String(user?.roleId))
      );
      const tid = teacherProfile ? String(teacherProfile.id) : String(user?.id || "");
      if (tid && !selectedTeacherId) {
        setSelectedTeacherId(tid);
      }
    }
  }, [user, reduxStudents, reduxTeachers, selectedTeacherId]);

  // Extract available unique divisions/sections
  const availableDivisions = useMemo(() => {
    const divs = reduxClasses.map((c) => c.section || c.division).filter(Boolean) as string[];
    return Array.from(new Set(divs)).sort();
  }, [reduxClasses]);

  // Fetch timetables based on active filters & user role
  useEffect(() => {
    let params: any = {};
    const role = (user?.role || "").toLowerCase();

    if (role === "student" && studentClassId) {
      params.classId = studentClassId;
    } else if (role === "teacher") {
      if (selectedTeacherId) params.teacherId = selectedTeacherId;
      else if (user?.id) params.teacherId = String(user.id);
      if (selectedClassId) params.classId = selectedClassId;
    } else {
      // admin, school_admin, principal, super_admin
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

  // Filter slots locally based on user role and selected criteria
  const timetable = useMemo(() => {
    let list = reduxTimetable;
    const role = (user?.role || "").toLowerCase();

    if (role === "student" && studentClassId) {
      list = list.filter(
        (t: any) =>
          String(t.classMasterId || t.classId) === String(studentClassId) ||
          String(t.classId) === String(studentClassId)
      );
    } else if (role === "teacher") {
      const activeTeacherId = selectedTeacherId || String(user?.id || "");
      if (activeTeacherId) {
        list = list.filter(
          (t: any) =>
            String(t.teacherId) === String(activeTeacherId) ||
            (t.teacherName && user?.name && t.teacherName.toLowerCase() === user.name.toLowerCase())
        );
      }
      if (selectedClassId) {
        list = list.filter(
          (t: any) =>
            String(t.classMasterId || t.classId) === String(selectedClassId) ||
            String(t.classId) === String(selectedClassId)
        );
      }
    } else {
      // admin, principal, school_admin
      if (selectedClassId) {
        list = list.filter(
          (t: any) =>
            String(t.classMasterId || t.classId) === String(selectedClassId) ||
            String(t.classId) === String(selectedClassId)
        );
      }
      if (selectedTeacherId) {
        list = list.filter((t: any) => String(t.teacherId) === String(selectedTeacherId));
      }
    }

    if (selectedDivision && role !== "student") {
      list = list.filter(
        (t: any) =>
          String(t.divisionMasterId || t.divisionId) === String(selectedDivision) ||
          String(t.section || "").toLowerCase() === String(selectedDivision).toLowerCase()
      );
    }

    if (selectedDay) {
      list = list.filter(
        (t: any) => (t.dayOfWeek || "").toLowerCase() === selectedDay.toLowerCase()
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
  }, [
    reduxTimetable,
    user,
    selectedClassId,
    selectedTeacherId,
    selectedDivision,
    selectedDay,
    studentClassId,
    searchQuery,
  ]);

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

  const masterClassOptions = useMemo(() => {
    const map = new Map<string, string>();
    classes.forEach((c) => {
      const key = String(c.classMasterId || c.id);
      if (!map.has(key)) {
        map.set(key, c.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [classes]);

  const expandedClasses = useMemo(() => {
    const result: Array<{
      id: string;
      name: string;
      section: string;
      classMasterId: string;
      divisionMasterId: string;
    }> = [];

    classes.forEach((c) => {
      const cMasterId = String(c.classMasterId || c.id);
      if (c.divisions && c.divisions.length > 0) {
        c.divisions.forEach((div) => {
          result.push({
            id: String(c.id),
            name: c.name,
            section: div.name,
            classMasterId: cMasterId,
            divisionMasterId: String(div.id || ""),
          });
        });
      } else {
        result.push({
          id: String(c.id),
          name: c.name,
          section: c.section || c.division || "",
          classMasterId: cMasterId,
          divisionMasterId: String(c.divisionMasterId || ""),
        });
      }
    });

    return result;
  }, [classes]);

  const gridTargetClasses = useMemo(() => {
    let list = expandedClasses;

    if (selectedClassId) {
      list = list.filter(
        (c) => String(c.classMasterId) === String(selectedClassId) || String(c.id) === String(selectedClassId)
      );
    }
    if (selectedDivision) {
      list = list.filter(
        (c) =>
          String(c.divisionMasterId) === String(selectedDivision) ||
          String(c.section).toLowerCase() === String(selectedDivision).toLowerCase()
      );
    }
    return list;
  }, [expandedClasses, selectedClassId, selectedDivision]);

  const uniqueSubjectsList = useMemo(() => {
    const map = new Map<string, any>();
    subjects.forEach((sub: any) => {
      const id = String(sub.subjectMasterId || sub.subjectId || sub.id);
      const name = sub.name || sub.subjectName || sub.masterSubjectName || "";
      if (id && name && !map.has(id)) {
        map.set(id, {
          id,
          name,
          code: sub.code || "",
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [subjects]);

  // Auto pre-select assigned teacher when class & subject are selected in Add/Edit Slot Modal
  useEffect(() => {
    if (showModal && !editingSlot && formData.classId && formData.subjectId) {
      const selectedClass = expandedClasses.find(
        (c) => String(c.id) === String(formData.classId)
      );
      const selectedSubjectObj = uniqueSubjectsList.find(
        (s) => String(s.id) === String(formData.subjectId)
      );

      const configMatch = subjectTeacherConfigs.find((st: any) => {
        const matchesClass =
          String(st.classId) === String(formData.classId) ||
          (selectedClass &&
            String(st.classMasterId || st.classId) === String(selectedClass.classMasterId) &&
            String(st.divisionMasterId || st.divisionId) === String(selectedClass.divisionMasterId));

        const matchesSubject =
          String(st.subjectId || st.subjectMasterId) === String(formData.subjectId) ||
          (selectedSubjectObj &&
            (st.subjectName || st.name || "").toLowerCase() === selectedSubjectObj.name.toLowerCase());

        return matchesClass && matchesSubject && st.teacherId;
      });

      if (configMatch && configMatch.teacherId) {
        setFormData((prev) => ({
          ...prev,
          teacherId: String(configMatch.teacherId),
        }));
      }
    }
  }, [formData.classId, formData.subjectId, showModal, editingSlot, expandedClasses, subjectTeacherConfigs, uniqueSubjectsList]);

  useEffect(() => {
    const targetCls = expandedClasses.find((c) => String(c.id) === String(formData.classId));
    const cid = formData.classId || selectedClassId || (classes[0]?.id || "");
    if (cid) {
      classService
        .getSubjects({ classId: cid })
        .then((subs: any) => setSubjects(subs))
        .catch((err: any) => console.error(err));
    }
  }, [formData.classId, selectedClassId, classes, expandedClasses]);

  const openAddModal = (defaultClassId?: string, timeSlot?: string) => {
    setEditingSlot(null);
    const targetClassId = defaultClassId || selectedClassId || (expandedClasses[0]?.id || classes[0]?.id || "");
    let sTime = "08:30";
    let eTime = "09:30";
    if (timeSlot && timeSlot.includes(" - ")) {
      const [st, et] = timeSlot.split(" - ");
      sTime = st.trim();
      eTime = et.trim();
    }
    setFormData({
      classId: targetClassId,
      subjectId: "",
      teacherId: "",
      dayOfWeek: selectedDay || getCurrentDayOfWeek(),
      startTime: sTime,
      endTime: eTime,
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
      teacherId: slot.teacherId || "",
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

  const displayDays = useMemo(() => {
    if (selectedDay) {
      return DAYS_OF_WEEK.filter((d) => d.toLowerCase() === selectedDay.toLowerCase());
    }
    return DAYS_OF_WEEK;
  }, [selectedDay]);

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

    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return groups;
  }, [timetable, displayDays]);

  const hasActiveFilters = Boolean(selectedClassId || selectedTeacherId || selectedDivision || selectedDay);

  const [viewMode, setViewMode] = useState<"weekly" | "dayGrid">("weekly");
  const [activeGridDay, setActiveGridDay] = useState<string>(getCurrentDayOfWeek());

  // Default to Weekly View on student login
  // useEffect(() => {
  //   if (user?.role === "student") {
  //     setViewMode("weekly");
  //     setSelectedDay("");
  //   } 
  // }, [user?.role]);

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

  const handleDayFilterChange = (dayVal: string) => {
    setSelectedDay(dayVal);
    if (dayVal) {
      setActiveGridDay(dayVal.toLowerCase());
      setViewMode("dayGrid");
    } else {
      setViewMode("weekly");
    }
  };

  const handleResetFilters = () => {
    setSelectedClassId("");
    setSelectedTeacherId("");
    setSelectedDivision("");
    setSelectedDay("");
    setSearchQuery("");
    setViewMode("weekly");
  };

  return (
    <TimetableUI
      user={user}
      activeSchool={activeSchool}
      loading={loading}
      classes={classes}
      teachers={teachers}
      subjects={subjects}
      unassignedSubjects={unassignedSubjects}
      selectedClassId={selectedClassId}
      setSelectedClassId={setSelectedClassId}
      selectedTeacherId={selectedTeacherId}
      setSelectedTeacherId={setSelectedTeacherId}
      selectedDivision={selectedDivision}
      setSelectedDivision={setSelectedDivision}
      selectedDay={selectedDay}
      setSelectedDay={setSelectedDay}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      viewMode={viewMode}
      setViewMode={setViewMode}
      activeGridDay={activeGridDay}
      setActiveGridDay={setActiveGridDay}
      DAYS_OF_WEEK={DAYS_OF_WEEK}
      breakConfig={breakConfig}
      setBreakConfig={setBreakConfig}
      showBreakControls={showBreakControls}
      setShowBreakControls={setShowBreakControls}
      roleStats={roleStats}
      hasActiveFilters={hasActiveFilters}
      handleResetFilters={handleResetFilters}
      handleDayFilterChange={handleDayFilterChange}
      masterClassOptions={masterClassOptions}
      expandedClasses={expandedClasses}
      gridTargetClasses={gridTargetClasses}
      uniqueTimeSlots={uniqueTimeSlots}
      uniqueSubjectsList={uniqueSubjectsList}
      timetable={timetable}
      reduxTimetable={reduxTimetable}
      displayDays={displayDays}
      groupedTimetable={groupedTimetable}
      showModal={showModal}
      setShowModal={setShowModal}
      editingSlot={editingSlot}
      formData={formData}
      setFormData={setFormData}
      error={error}
      openAddModal={openAddModal}
      openEditModal={openEditModal}
      handleDelete={handleDelete}
      handleSave={handleSave}
      showGenModal={showGenModal}
      setShowGenModal={setShowGenModal}
      genConfig={genConfig}
      setGenConfig={setGenConfig}
      handleRunGenerator={handleRunGenerator}
      toggleDaySelection={toggleDaySelection}
    />
  );
}

export const TimetableContainer = mapper(TimetableContainerContent);
