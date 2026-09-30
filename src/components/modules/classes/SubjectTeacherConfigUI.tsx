import React, { useMemo } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import {
  UserCheck,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  School as SchoolIcon,
  Layers,
  GraduationCap,
  Filter,
  Check,
  Search,
  X,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { SubjectTeacherConfigUIProps } from "../../../saga/subjectTeacherConfig/types";

export function SubjectTeacherConfigUI(props: SubjectTeacherConfigUIProps) {
  const {
    subjects,
    filteredSubjects,
    paginatedSubjects,
    teachers,
    classesList,
    assignments,
    loading,
    savingSubjectId,
    successMsg,
    error,
    page,
    setPage,
    limit,
    setLimit,
    meta,
    searchQuery,
    setSearchQuery,
    selectedClassId,
    setSelectedClassId,
    selectedDivision,
    setSelectedDivision,
    selectedSubjectFilter,
    setSelectedSubjectFilter,
    selectedTeacherFilter,
    setSelectedTeacherFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    availableDivisions,
    availableSubjects,
    assignedCount,
    unassignedCount,
    handleTeacherChange,
    handleResetFilters,
    handleRefresh,
  } = props;

  const totalItems = meta.total || filteredSubjects.length;

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedClassId) ||
    selectedDivision !== "ALL" ||
    selectedSubjectFilter !== "ALL" ||
    selectedTeacherFilter !== "ALL" ||
    selectedStatusFilter !== "ALL";

  // Reusable Column Definitions for Common DataTable
  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        key: "class",
        header: "Class",
        cell: (s: any) => {
          const classNameDisplay = s.className
            ? s.className.toLowerCase().includes("class")
              ? s.className
              : `Class ${s.className}`
            : "Class";
          return <span className="font-bold text-foreground">{classNameDisplay}</span>;
        },
      },
      {
        key: "division",
        header: "Division",
        cell: (s: any) => {
          const divDisplay = s.divisionName || s.classDivision || s.classSection || "A";
          return <span className="font-bold text-xs">{divDisplay}</span>;
        },
      },
      {
        key: "subject",
        header: "Subject",
        cell: (s: any) => {
          const subjectNameDisplay = s.subjectName || s.name;
          return <span className="font-bold text-foreground text-sm">{subjectNameDisplay}</span>;
        },
      },
      {
        key: "teacher",
        header: "Assign Teacher",
        cell: (s: any) => {
          const itemKey = s.classSubjectId || s.id;
          const currentTeacherId = assignments[itemKey] || s.teacherId || "";
          const isSaving = savingSubjectId === itemKey;

          return (
            <div className="flex items-center gap-2 sm:gap-3 min-w-[220px] sm:min-w-[280px]">
              <select
                value={currentTeacherId}
                disabled={isSaving}
                onChange={(e) => handleTeacherChange(itemKey, e.target.value)}
                className={`w-full h-10 rounded-xl border px-3 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm transition-all ${currentTeacherId
                  ? "bg-background border-border text-foreground font-bold"
                  : "bg-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold"
                  }`}
              >
                <option value="" className="text-muted-foreground font-normal">
                  -- Select / Assign Teacher --
                </option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id} className="text-foreground font-medium py-1">
                    {t.name}
                  </option>
                ))}
              </select>
              {isSaving && (
                <RefreshCw className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
              )}
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        align: "center",
        cell: (s: any) => {
          const itemKey = s.classSubjectId || s.id;
          const currentTeacherId = assignments[itemKey] || s.teacherId || "";
          const isSaving = savingSubjectId === itemKey;

          if (isSaving) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary whitespace-nowrap">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
              </span>
            );
          }
          if (currentTeacherId) {
            return (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                <Check className="h-3.5 w-3.5" /> Assigned
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/20 whitespace-nowrap">
              Unassigned
            </span>
          );
        },
      },
    ],
    [assignments, savingSubjectId, teachers, handleTeacherChange]
  );

  const activeFilterCount = [
    Boolean(searchQuery),
    Boolean(selectedClassId),
    selectedDivision !== "ALL",
    selectedSubjectFilter !== "ALL",
    selectedTeacherFilter !== "ALL",
    selectedStatusFilter !== "ALL",
  ].filter(Boolean).length;

  return (
    <div className="p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px]">
      {/* Top Header & Page Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
            <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              Subject-Teacher Configuration
            </h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Assign subject teachers to classes and divisions seamlessly
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs font-semibold rounded-xl border-border/80 shadow-sm h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Banner Feedback Messages */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Mappings */}
        <div
          onClick={() => setSelectedStatusFilter("ALL")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${selectedStatusFilter === "ALL"
            ? "bg-card border-primary/40 ring-2 ring-primary/20"
            : "bg-card/60 border-border/60 hover:border-border"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Subjects</span>
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-foreground">{subjects.length}</span>
            <span className="text-[11px] font-medium text-muted-foreground">All Configured</span>
          </div>
        </div>

        {/* Assigned Count */}
        <div
          onClick={() => setSelectedStatusFilter("ASSIGNED")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${selectedStatusFilter === "ASSIGNED"
            ? "bg-emerald-500/5 border-emerald-500/40 ring-2 ring-emerald-500/20"
            : "bg-card/60 border-border/60 hover:border-emerald-500/30"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Assigned Teachers
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {assignedCount}
            </span>
            <span className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80">
              {subjects.length > 0 ? `${Math.round((assignedCount / subjects.length) * 100)}%` : "0%"} Complete
            </span>
          </div>
        </div>

        {/* Unassigned Count */}
        <div
          onClick={() => setSelectedStatusFilter("UNASSIGNED")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${selectedStatusFilter === "UNASSIGNED"
            ? "bg-amber-500/5 border-amber-500/40 ring-2 ring-amber-500/20"
            : "bg-card/60 border-border/60 hover:border-amber-500/30"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Unassigned Subjects
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              {unassignedCount}
            </span>
            <span className="text-[11px] font-medium text-amber-600/80 dark:text-amber-400/80">
              Pending Teacher
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Top Bar: Search Input & Filter Summary */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-border/40">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search class, division, subject or teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 h-10 text-xs rounded-xl bg-background border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted transition-all"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Counter Badge */}
            <div className="flex items-center justify-between md:justify-end gap-3 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                  <Filter className="h-3.5 w-3.5" />
                  Filters {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.2 rounded-full font-bold">{activeFilterCount}</span>}
                </span>
              </div>
              <span className="font-semibold text-foreground bg-muted/50 px-2.5 py-1 rounded-lg border border-border/40">
                {totalItems} {totalItems === 1 ? "result" : "results"} found
              </span>
            </div>
          </div>

          {/* Grid Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 items-end">
            {/* 1. Class Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <SchoolIcon className="h-3.5 w-3.5 text-primary/70" /> Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer shadow-sm hover:border-border"
              >
                <option value="">All Classes</option>
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Division Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-primary/70" /> Division
              </label>
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer shadow-sm hover:border-border"
              >
                <option value="ALL">All Divisions</option>
                {selectedClassId
                  ? classesList
                    ?.find(
                      (c) =>
                        String(c.id) === String(selectedClassId) ||
                        String(c.schoolClassId) === String(selectedClassId)
                    )
                    ?.divisions?.map((div) => (
                      <option key={div.id || div.name} value={div.name}>
                        {div.name}
                      </option>
                    ))
                  : availableDivisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
              </select>
            </div>

            {/* 3. Subject Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary/70" /> Subject
              </label>
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer shadow-sm hover:border-border"
              >
                <option value="ALL">All Subjects</option>
                {selectedClassId
                  ? classesList
                    ?.find(
                      (c) =>
                        String(c.id) === String(selectedClassId) ||
                        String(c.schoolClassId) === String(selectedClassId)
                    )
                    ?.subjects?.map((sub) => (
                      <option key={sub.id || sub.name} value={sub.name}>
                        {sub.name}
                      </option>
                    ))
                  : availableSubjects.map((subName) => (
                    <option key={subName} value={subName}>
                      {subName}
                    </option>
                  ))}
              </select>
            </div>

            {/* 4. Teacher Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5 text-primary/70" /> Teacher
              </label>
              <select
                value={selectedTeacherFilter}
                onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer shadow-sm hover:border-border"
              >
                <option value="ALL">All Teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Status Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" /> Status
              </label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer shadow-sm hover:border-border"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Only Assigned</option>
                <option value="UNASSIGNED">Only Unassigned</option>
              </select>
            </div>

            {/* 6. Reset Filters Button */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-transparent select-none hidden sm:block">
                Actions
              </label>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasActiveFilters}
                onClick={handleResetFilters}
                className={`w-full h-10 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                  hasActiveFilters
                    ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 cursor-pointer"
                    : "opacity-50 cursor-not-allowed border-border/60 text-muted-foreground"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </Button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/30">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1">Applied Filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Search: "{searchQuery}"
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-primary-foreground hover:bg-primary rounded-full transition-all"
                    onClick={() => setSearchQuery("")}
                  />
                </span>
              )}
              {selectedClassId && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Class: {classesList.find((c) => String(c.id) === String(selectedClassId))?.name || selectedClassId}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-primary-foreground hover:bg-primary rounded-full transition-all"
                    onClick={() => setSelectedClassId("")}
                  />
                </span>
              )}
              {selectedDivision !== "ALL" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Division: {selectedDivision}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-primary-foreground hover:bg-primary rounded-full transition-all"
                    onClick={() => setSelectedDivision("ALL")}
                  />
                </span>
              )}
              {selectedSubjectFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Subject: {selectedSubjectFilter}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-primary-foreground hover:bg-primary rounded-full transition-all"
                    onClick={() => setSelectedSubjectFilter("ALL")}
                  />
                </span>
              )}
              {selectedTeacherFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Teacher: {teachers.find((t) => String(t.id) === String(selectedTeacherFilter))?.name || selectedTeacherFilter}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-primary-foreground hover:bg-primary rounded-full transition-all"
                    onClick={() => setSelectedTeacherFilter("ALL")}
                  />
                </span>
              )}
              {selectedStatusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full">
                  Status: {selectedStatusFilter === "ASSIGNED" ? "Assigned" : "Unassigned"}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-primary-foreground hover:bg-primary rounded-full transition-all"
                    onClick={() => setSelectedStatusFilter("ALL")}
                  />
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-destructive hover:underline ml-auto"
              >
                Clear all
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Table View using Reusable DataTable Component */}
      <Card className="border-border/60 shadow-lg overflow-hidden flex flex-col">
        <CardContent className="p-0 flex-1">
          <DataTable
            data={paginatedSubjects}
            columns={columns}
            rowKey={(s: any) => s.classSubjectId || s.id}
            loading={loading}
            bordered={true}
            emptyText="No matching subjects found"
            renderMobileCard={(s: any) => {
              const classNameDisplay = s.className
                ? s.className.toLowerCase().includes("class")
                  ? s.className
                  : `Class ${s.className}`
                : "Class";
              const divDisplay = s.divisionName || s.classDivision || s.classSection || "A";
              const subjectNameDisplay = s.subjectName || s.name;
              const itemKey = s.classSubjectId || s.id;
              const currentTeacherId = assignments[itemKey] || s.teacherId || "";
              const isSaving = savingSubjectId === itemKey;
              const currentTeacherObj = teachers.find(t => String(t.id) === String(currentTeacherId));

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                        {classNameDisplay} - {divDisplay}
                      </span>
                      <span className="font-bold text-sm text-foreground">{subjectNameDisplay}</span>
                    </div>
                    {currentTeacherId ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <AlertCircle className="h-3 w-3" /> Unassigned
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
                      Subject Teacher
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={currentTeacherId}
                        disabled={isSaving}
                        onChange={(e) => handleTeacherChange(itemKey, e.target.value)}
                        className={`w-full h-10 rounded-xl border px-3 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm transition-all ${
                          currentTeacherId
                            ? "bg-background border-border text-foreground font-bold"
                            : "bg-amber-500/5 border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold"
                        }`}
                      >
                        <option value="" className="text-muted-foreground font-normal">
                          -- Select / Assign Teacher --
                        </option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id} className="text-foreground font-medium py-1">
                            {t.name}
                          </option>
                        ))}
                      </select>
                      {isSaving && (
                        <RefreshCw className="h-4 w-4 animate-spin text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            }}
            pagination={{
              page,
              limit,
              totalItems,
              onPageChange: setPage,
              onLimitChange: setLimit,
              showPerPage: true,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default SubjectTeacherConfigUI;
