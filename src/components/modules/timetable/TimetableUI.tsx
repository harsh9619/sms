import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Users, Clock } from "lucide-react";
import type { TimetableSlot, ClassInfo, Teacher } from "../../../types";
import { getCurrentDayOfWeek } from "./timetableUtils";
import { TimetableHeader } from "./TimetableHeader";
import { TimetableStats } from "./TimetableStats";
import { TimetableFilters } from "./TimetableFilters";
import { TimetableDayGrid } from "./TimetableDayGrid";
import { TimetableWeeklyView } from "./TimetableWeeklyView";
import { AddSlotModal } from "./AddSlotModal";
import { AutoGeneratorModal } from "./AutoGeneratorModal";

export interface TimetableUIProps {
  user: any;
  activeSchool: any;
  loading: boolean;
  classes: ClassInfo[];
  teachers: Teacher[];
  subjects: any[];
  unassignedSubjects: any[];
  selectedClassId: string;
  setSelectedClassId: (val: string) => void;
  selectedTeacherId: string;
  setSelectedTeacherId: (val: string) => void;
  selectedDivision: string;
  setSelectedDivision: (val: string) => void;
  selectedDay: string;
  setSelectedDay: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  viewMode: "weekly" | "dayGrid";
  setViewMode: (val: "weekly" | "dayGrid") => void;
  activeGridDay: string;
  setActiveGridDay: (val: string) => void;
  DAYS_OF_WEEK: string[];
  breakConfig: { enabled: boolean; startTime: string; endTime: string; title: string };
  setBreakConfig: (cfg: any) => void;
  showBreakControls: boolean;
  setShowBreakControls: (val: boolean) => void;
  roleStats: Array<{ label: string; val: string | number; icon: any; color: string; bg: string }>;
  hasActiveFilters: boolean;
  handleResetFilters: () => void;
  handleDayFilterChange: (dayVal: string) => void;
  masterClassOptions: Array<{ id: string; name: string }>;
  expandedClasses: Array<{ id: string; name: string; section: string; classMasterId: string; divisionMasterId: string }>;
  gridTargetClasses: Array<{ id: string; name: string; section: string; classMasterId: string; divisionMasterId: string }>;
  uniqueTimeSlots: string[];
  uniqueSubjectsList: Array<{ id: string; name: string; code?: string }>;
  timetable: TimetableSlot[];
  reduxTimetable: TimetableSlot[];
  displayDays: string[];
  groupedTimetable: Record<string, TimetableSlot[]>;
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  editingSlot: TimetableSlot | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  error: string | null;
  openAddModal: (defaultClassId?: string, timeSlot?: string) => void;
  openEditModal: (slot: TimetableSlot) => void;
  handleDelete: (id: string) => void;
  handleSave: () => void;
  showGenModal: boolean;
  setShowGenModal: (val: boolean) => void;
  genConfig: any;
  setGenConfig: React.Dispatch<React.SetStateAction<any>>;
  handleRunGenerator: () => void;
  toggleDaySelection: (day: string) => void;
}

export function TimetableUI({
  user,
  activeSchool,
  loading,
  classes,
  teachers,
  unassignedSubjects,
  selectedClassId,
  setSelectedClassId,
  selectedTeacherId,
  setSelectedTeacherId,
  selectedDivision,
  setSelectedDivision,
  selectedDay,
  setSelectedDay,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  activeGridDay,
  setActiveGridDay,
  DAYS_OF_WEEK,
  breakConfig,
  setBreakConfig,
  showBreakControls,
  setShowBreakControls,
  roleStats,
  hasActiveFilters,
  handleResetFilters,
  handleDayFilterChange,
  masterClassOptions,
  expandedClasses,
  gridTargetClasses,
  uniqueTimeSlots,
  uniqueSubjectsList,
  reduxTimetable,
  displayDays,
  groupedTimetable,
  showModal,
  setShowModal,
  editingSlot,
  formData,
  setFormData,
  error,
  openAddModal,
  openEditModal,
  handleDelete,
  handleSave,
  showGenModal,
  setShowGenModal,
  genConfig,
  setGenConfig,
  handleRunGenerator,
  toggleDaySelection,
}: TimetableUIProps) {
  return (
    <div className="space-y-3.5">
      {/* Unassigned Subject Teachers Alert Note */}
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
      <TimetableHeader
        user={user}
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeGridDay={activeGridDay}
        setActiveGridDay={setActiveGridDay}
        setSelectedDay={setSelectedDay}
        getCurrentDayOfWeek={getCurrentDayOfWeek}
        setShowGenModal={setShowGenModal}
        openAddModal={openAddModal}
      />

      {/* Overview KPI Stats */}
      <TimetableStats roleStats={roleStats} />

      {/* Filter Controls Panel */}
      <TimetableFilters
        user={user}
        classes={classes}
        teachers={teachers}
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
        DAYS_OF_WEEK={DAYS_OF_WEEK}
        breakConfig={breakConfig}
        setBreakConfig={setBreakConfig}
        showBreakControls={showBreakControls}
        setShowBreakControls={setShowBreakControls}
        hasActiveFilters={hasActiveFilters}
        handleResetFilters={handleResetFilters}
        handleDayFilterChange={handleDayFilterChange}
        masterClassOptions={masterClassOptions}
      />

      {/* Content Area: Loader, Day Grid Matrix, or Weekly View */}
      {loading ? (
        <div className="text-center py-16 bg-card/30 rounded-2xl border border-border/40">
          <Clock className="h-10 w-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Processing timetable schedule...</p>
        </div>
      ) : viewMode === "dayGrid" ? (
        <TimetableDayGrid
          user={user}
          DAYS_OF_WEEK={DAYS_OF_WEEK}
          activeGridDay={activeGridDay}
          setActiveGridDay={setActiveGridDay}
          setSelectedDay={setSelectedDay}
          gridTargetClasses={gridTargetClasses}
          uniqueTimeSlots={uniqueTimeSlots}
          breakConfig={breakConfig}
          reduxTimetable={reduxTimetable}
          selectedTeacherId={selectedTeacherId}
          openAddModal={openAddModal}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
        />
      ) : (
        <TimetableWeeklyView
          user={user}
          displayDays={displayDays}
          groupedTimetable={groupedTimetable}
          uniqueTimeSlots={uniqueTimeSlots}
          breakConfig={breakConfig}
          openEditModal={openEditModal}
          handleDelete={handleDelete}
          openAddModal={openAddModal}
        />
      )}

      {/* Modals */}
      <AutoGeneratorModal
        showGenModal={showGenModal}
        setShowGenModal={setShowGenModal}
        genConfig={genConfig}
        setGenConfig={setGenConfig}
        classes={classes}
        selectedClassId={selectedClassId}
        DAYS_OF_WEEK={DAYS_OF_WEEK}
        unassignedSubjects={unassignedSubjects}
        activeSchool={activeSchool}
        handleRunGenerator={handleRunGenerator}
        toggleDaySelection={toggleDaySelection}
      />

      <AddSlotModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingSlot={editingSlot}
        formData={formData}
        setFormData={setFormData}
        error={error}
        expandedClasses={expandedClasses}
        uniqueSubjectsList={uniqueSubjectsList}
        teachers={teachers}
        DAYS_OF_WEEK={DAYS_OF_WEEK}
        reduxTimetable={reduxTimetable}
        handleSave={handleSave}
      />
    </div>
  );
}
