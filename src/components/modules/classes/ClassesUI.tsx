import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { RefreshCw, UserCheck, BookOpen, Filter, School as SchoolIcon, Layers, GraduationCap, CheckCircle2, Check } from "lucide-react";
import type { ClassInfo } from "../../../types";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
}

export interface ClassTeacherItem {
  id: string;
  classTeacherId: null | string;
  schoolId: string;
  schoolAcademicYearId: string;
  classId: string;
  className: string;
  divisionId: string;
  divisionName: string;
  classDivision: string;
  classSection: string;
  teacherId: number | null;
  teacherName: string | null;
  isPrimary: boolean;
}

export interface ClassesUIProps {
  loading: boolean;
  error: string | null;
  successMsg: string | null;
  savingClassId: string | null;
  classesList: ClassInfo[];
  teachers: Teacher[];
  assignments: Record<string, string>;
  selectedClassId: string;
  setSelectedClassId: (val: string) => void;
  selectedDivision: string;
  setSelectedDivision: (val: string) => void;
  selectedTeacherFilter: string;
  setSelectedTeacherFilter: (val: string) => void;
  selectedStatusFilter: string;
  setSelectedStatusFilter: (val: string) => void;
  filteredRows: ClassTeacherItem[];
  availableDivisions: string[];
  assignedCount: number;
  unassignedCount: number;
  totalCount: number;
  onTeacherChange: (classId: string, teacherId: string) => void;
}

export function ClassesUI({
  loading,
  error,
  successMsg,
  savingClassId,
  classesList,
  teachers,
  assignments,
  selectedClassId,
  setSelectedClassId,
  selectedDivision,
  setSelectedDivision,
  selectedTeacherFilter,
  setSelectedTeacherFilter,
  selectedStatusFilter,
  setSelectedStatusFilter,
  filteredRows,
  availableDivisions,
  assignedCount,
  unassignedCount,
  totalCount,
  onTeacherChange,
}: ClassesUIProps) {
  return (
    <div className="p-6 mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Class-Teacher Configuration</h1>
            <p className="text-xs text-muted-foreground">Assign primary class teachers to classes and divisions with live API save</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
          {successMsg}
        </div>
      )}

      {/* Filter Toolbar Card */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" /> Filter Options
              </span>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span>Total: <strong className="text-foreground">{totalCount}</strong></span>
                <span>Assigned: <strong className="text-emerald-500">{assignedCount}</strong></span>
                <span>Unassigned: <strong className="text-amber-500">{unassignedCount}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* 1. Class Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <SchoolIcon className="h-3.5 w-3.5 text-primary/70" /> Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
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
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Divisions</option>
                  {selectedClassId
                    ? classesList?.find((c) => String(c.id) === String(selectedClassId) || String(c.schoolClassId) === String(selectedClassId))?.divisions?.map((div) => (
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

              {/* 3. Teacher Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary/70" /> Teacher
                </label>
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" /> Status
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">Only Assigned</option>
                  <option value="UNASSIGNED">Only Unassigned</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table View */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40 bg-muted/20">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Class-Teacher Mapping List
            </CardTitle>
            <CardDescription>Selecting a teacher calls the update API automatically</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-semibold">Loading class-teacher configuration...</span>
              </div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-bold">No matching records found</p>
              <p className="text-xs text-muted-foreground mt-1">Try broadening your class, division, teacher, or status filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Division</th>
                    <th className="px-6 py-4">Teacher Dropdown (List of Teachers)</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filteredRows.map((r) => {
                    const currentTeacherId = assignments[r.id] || (r.teacherId ? String(r.teacherId) : "");
                    const isSaving = savingClassId === r.id;

                    const classNameDisplay = r.className
                      ? (r.className.toLowerCase().includes("class") ? r.className : `Class ${r.className}`)
                      : "Class";

                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        {/* Class */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {classNameDisplay}
                            </span>
                          </div>
                        </td>

                        {/* Division */}
                        <td className="px-6 py-4">
                          <span className="font-bold text-xs px-3 py-1">
                            {r.divisionName}
                          </span>
                        </td>

                        {/* Teacher Dropdown */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[280px]">
                            <select
                              value={currentTeacherId}
                              disabled={isSaving}
                              onChange={(e) => onTeacherChange(r.classId, e.target.value)}
                              className="w-full h-10 rounded-xl border px-3 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm transition-all"
                            >
                              <option value="" className="text-muted-foreground font-normal">Select Teacher</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id} className="text-foreground font-medium py-1">
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          {isSaving ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                            </span>
                          ) : currentTeacherId ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <Check className="h-3.5 w-3.5" /> Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              Unassigned
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
