import React from "react";
import { Filter, Coffee, RotateCcw, Search, Users, GraduationCap, Layers, Calendar, X } from "lucide-react";
import { Input } from "../../ui/Input";
import type { ClassInfo, Teacher } from "../../../types";

interface TimetableFiltersProps {
  user: any;
  classes: ClassInfo[];
  teachers: Teacher[];
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
  DAYS_OF_WEEK: string[];
  breakConfig: { enabled: boolean; startTime: string; endTime: string; title: string };
  setBreakConfig: (cfg: any) => void;
  showBreakControls: boolean;
  setShowBreakControls: (val: boolean) => void;
  hasActiveFilters: boolean;
  handleResetFilters: () => void;
  handleDayFilterChange: (dayVal: string) => void;
  masterClassOptions: Array<{ id: string; name: string }>;
}

export const TimetableFilters: React.FC<TimetableFiltersProps> = ({
  user,
  classes,
  teachers,
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
  DAYS_OF_WEEK,
  breakConfig,
  setBreakConfig,
  showBreakControls,
  setShowBreakControls,
  hasActiveFilters,
  handleResetFilters,
  handleDayFilterChange,
  masterClassOptions,
}) => {
  // Hide entire filter section for student login
  if (user?.role === "student") {
    return null;
  }

  const isTeacher = user?.role === "teacher";

  return (
    <div className="bg-card/70 border border-border/70 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
          <Filter className="h-4 w-4 text-primary" />
          <span>Filter Timetable View</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBreakControls(!showBreakControls)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              breakConfig.enabled
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

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          isTeacher ? "lg:grid-cols-3" : "lg:grid-cols-5"
        } gap-3.5`}
      >
        {/* Quick Search - Hidden for Teacher login */}
        {!isTeacher && (
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
        )}

        {/* Teacher-wise Filter - Hidden for Teacher login */}
        {!isTeacher && (
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
        )}

        {/* Class-wise Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary/70" /> Class Wise
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs focus:ring-2 focus:ring-primary outline-none font-medium text-foreground transition-all"
          >
            <option value="">All Classes</option>
            {masterClassOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
            disabled={!selectedClassId}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            <option value="">All Divisions</option>
            {classes
              .find((e) => String(e.classMasterId) === String(selectedClassId) || String(e.id) === String(selectedClassId))
              ?.divisions?.map((div) => (
                <option key={div.id || div.name} value={div.id || div.name}>
                  {div.name}
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
              Class: {masterClassOptions.find((c) => String(c.id) === String(selectedClassId))?.name || selectedClassId}
              <X
                className="h-3 w-3 cursor-pointer hover:opacity-80"
                onClick={() => {
                  setSelectedClassId("");
                  setSelectedDivision("");
                }}
              />
            </span>
          )}
          {!isTeacher && selectedTeacherId && (
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
              Division: {classes.flatMap((c) => c.divisions || []).find((d) => String(d.id) === String(selectedDivision))?.name || selectedDivision}
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
  );
};
