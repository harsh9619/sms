import React, { useState, useEffect, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import {
  fetchCalendarEventsRequest,
  fetchWorkingConfigRequest,
  createCalendarEventRequest,
  updateCalendarEventRequest,
  deleteCalendarEventRequest,
  updateWorkingConfigRequest,
} from "../../saga";
import type { CalendarEvent } from "../../Services/academicCalendar.service";
import { AcademicCalendarUI } from "../../components/modules/academicCalendar/AcademicCalendarUI";

const mapStateToProps = (state: AppState) => ({
  reduxEvents: state.academicCalendar.events,
  reduxSessionConfig: state.academicCalendar.sessionConfig,
  reduxSummary: state.academicCalendar.summary,
  loading: state.academicCalendar.loading,
  reduxError: state.academicCalendar.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchCalendarEventsRequest: (params?: any) => dispatch(fetchCalendarEventsRequest(params)),
  fetchWorkingConfigRequest: (params?: any) => dispatch(fetchWorkingConfigRequest(params)),
  createCalendarEventRequest: (payload: { schoolId: string; data: Partial<CalendarEvent> }) =>
    dispatch(createCalendarEventRequest(payload)),
  updateCalendarEventRequest: (payload: { schoolId: string; id: string; data: Partial<CalendarEvent> }) =>
    dispatch(updateCalendarEventRequest(payload)),
  deleteCalendarEventRequest: (payload: { schoolId: string; id: string }) =>
    dispatch(deleteCalendarEventRequest(payload)),
  updateWorkingConfigRequest: (payload: { schoolId: string; data: any }) =>
    dispatch(updateWorkingConfigRequest(payload)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

function AcademicCalendarContainerContent({
  reduxEvents,
  reduxSessionConfig,
  reduxSummary,
  loading,
  reduxError,
  fetchCalendarEventsRequest,
  fetchWorkingConfigRequest,
  createCalendarEventRequest,
  updateCalendarEventRequest,
  deleteCalendarEventRequest,
  updateWorkingConfigRequest,
}: PropsFromRedux) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const schoolId = activeSchool?.id ? String(activeSchool.id) : "1";

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState<string>(""); // YYYY-MM
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // Default to list view on mobile screens (< 640px) since calendar view is hidden on mobile
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "workingDays">(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return "list";
    }
    return "calendar";
  });

  // Current calendar navigation month/year
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Modal States
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventFormData, setEventFormData] = useState({
    title: "",
    type: "EVENT",
    category: "Academic",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    description: "",
    location: "",
    targetRoles: ["all"],
    isHoliday: false,
    affectsAttendance: true,
    color: "indigo",
  });

  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [configFormData, setConfigFormData] = useState({
    sessionStartDate: "",
    sessionEndDate: "",
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    periodsPerDay: 8,
    schoolStartTime: "08:30",
    schoolEndTime: "14:30",
  });

  // Check user management permissions (only admin, schooladmin, and principal)
  const normalizedRole = (user?.role || "").toLowerCase().replace(/[-_]/g, "").trim();
  const canManage =
    normalizedRole === "admin" ||
    normalizedRole === "schooladmin" ||
    normalizedRole === "principal" ||
    normalizedRole === "superadmin";

  // Prevent non-authorized roles from accessing school settings view
  useEffect(() => {
    if (!canManage && viewMode === "workingDays") {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
      setViewMode(isMobile ? "list" : "calendar");
    }
  }, [canManage, viewMode]);

  // Ensure viewMode shifts from calendar to list if screen is resized to mobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined" && window.innerWidth < 640 && viewMode === "calendar") {
        setViewMode("list");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  // 1. Fetch School Configuration when schoolId changes
  useEffect(() => {
    fetchWorkingConfigRequest({ schoolId });
  }, [schoolId, fetchWorkingConfigRequest]);

  // 2. Fetch Events when schoolId, selectedMonth, or filterType changes
  useEffect(() => {
    fetchCalendarEventsRequest({
      schoolId,
      month: selectedMonth || undefined,
      type: filterType !== "ALL" ? filterType : undefined,
      role: user?.role,
    });
  }, [schoolId, selectedMonth, filterType, fetchCalendarEventsRequest]);

  useEffect(() => {
    if (reduxSessionConfig) {
      setConfigFormData({
        sessionStartDate: reduxSessionConfig.sessionStartDate || "",
        sessionEndDate: reduxSessionConfig.sessionEndDate || "",
        workingDays: reduxSessionConfig.workingDays || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        periodsPerDay: reduxSessionConfig.periodsPerDay || 8,
        schoolStartTime: reduxSessionConfig.schoolStartTime || "08:30",
        schoolEndTime: reduxSessionConfig.schoolEndTime || "14:30",
      });
    }
  }, [reduxSessionConfig]);

  const filteredEvents = useMemo(() => {
    let result = reduxEvents;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ev) =>
          ev.title.toLowerCase().includes(q) ||
          (ev.category && ev.category.toLowerCase().includes(q)) ||
          (ev.description && ev.description.toLowerCase().includes(q)) ||
          (ev.location && ev.location.toLowerCase().includes(q))
      );
    }

    return result;
  }, [reduxEvents, searchQuery]);

  const openAddEventModal = (dateStr?: string) => {
    setEditingEvent(null);
    const d = dateStr || new Date().toISOString().split("T")[0];
    setEventFormData({
      title: "",
      type: "EVENT",
      category: "Academic",
      startDate: d,
      endDate: d,
      startTime: "09:00",
      endTime: "12:00",
      description: "",
      location: "",
      targetRoles: ["all"],
      isHoliday: false,
      affectsAttendance: true,
      color: "indigo",
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (ev: CalendarEvent) => {
    setEditingEvent(ev);
    setEventFormData({
      title: ev.title,
      type: ev.type || (ev.isHoliday ? "HOLIDAY" : "EVENT"),
      category: ev.category || "",
      startDate: ev.startDate,
      endDate: ev.endDate,
      startTime: ev.startTime || "",
      endTime: ev.endTime || "",
      description: ev.description || "",
      location: ev.location || "",
      targetRoles: ev.targetRoles || ["all"],
      isHoliday: ev.isHoliday,
      affectsAttendance: ev.affectsAttendance,
      color: ev.color || "indigo",
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (!eventFormData.title || !eventFormData.startDate) {
      return;
    }
    if (editingEvent) {
      updateCalendarEventRequest({
        schoolId,
        id: editingEvent.id,
        data: eventFormData,
      });
    } else {
      createCalendarEventRequest({
        schoolId,
        data: {
          ...eventFormData,
          createdBy: user?.id ? String(user.id) : undefined,
        },
      });
    }
    setShowEventModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (!confirm("Are you sure you want to delete this event/holiday?")) return;
    deleteCalendarEventRequest({ schoolId, id });
  };

  const handleSaveConfig = () => {
    updateWorkingConfigRequest({
      schoolId,
      data: configFormData,
    });
    setShowConfigModal(false);
  };

  return (
    <AcademicCalendarUI
      user={user}
      canManage={canManage}
      loading={loading}
      sessionConfig={reduxSessionConfig}
      events={filteredEvents}
      summary={reduxSummary}
      currentDate={currentDate}
      setCurrentDate={setCurrentDate}
      selectedMonth={selectedMonth}
      setSelectedMonth={setSelectedMonth}
      filterType={filterType}
      setFilterType={setFilterType}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      viewMode={viewMode}
      setViewMode={setViewMode}
      showEventModal={showEventModal}
      setShowEventModal={setShowEventModal}
      editingEvent={editingEvent}
      eventFormData={eventFormData}
      setEventFormData={setEventFormData}
      openAddEventModal={openAddEventModal}
      openEditEventModal={openEditEventModal}
      handleSaveEvent={handleSaveEvent}
      handleDeleteEvent={handleDeleteEvent}
      showConfigModal={showConfigModal}
      setShowConfigModal={setShowConfigModal}
      configFormData={configFormData}
      setConfigFormData={setConfigFormData}
      handleSaveConfig={handleSaveConfig}
      isSubmitting={loading}
    />
  );
}

export const AcademicCalendarContainer = mapper(AcademicCalendarContainerContent);
