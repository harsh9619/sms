import React from "react";
import { Link } from "react-router-dom";
import { Wand2, X, GraduationCap, Calendar, Clock, Coffee, Info, AlertTriangle } from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import type { ClassInfo } from "../../../types";

interface AutoGeneratorModalProps {
  showGenModal: boolean;
  setShowGenModal: (val: boolean) => void;
  genConfig: any;
  setGenConfig: React.Dispatch<React.SetStateAction<any>>;
  classes: ClassInfo[];
  selectedClassId: string;
  DAYS_OF_WEEK: string[];
  unassignedSubjects: any[];
  activeSchool: any;
  handleRunGenerator: () => void;
  toggleDaySelection: (day: string) => void;
}

export const AutoGeneratorModal: React.FC<AutoGeneratorModalProps> = ({
  showGenModal,
  setShowGenModal,
  genConfig,
  setGenConfig,
  classes,
  selectedClassId,
  DAYS_OF_WEEK,
  unassignedSubjects,
  activeSchool,
  handleRunGenerator,
  toggleDaySelection,
}) => {
  if (!showGenModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4"
      onClick={() => setShowGenModal(false)}
    >
      <div
        className="bg-card/95 border border-border/80 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 border border-primary/30 text-primary shadow-xs">
              <Wand2 className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground tracking-tight">
                Automatic Timetable Generator
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generate optimized clash-free timetables automatically
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGenModal(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-left max-h-[75vh] overflow-y-auto scrollbar-none">
          {/* Target Scope */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Target Scope
            </label>
            <select
              value={genConfig.scope}
              onChange={(e) => setGenConfig({ ...genConfig, scope: e.target.value })}
              className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-xs"
            >
              <option value="selected">
                Selected Class Only (
                {classes.find((c) => String(c.id) === String(selectedClassId) || String(c.classMasterId) === String(selectedClassId))
                  ? `${classes.find((c) => String(c.id) === String(selectedClassId) || String(c.classMasterId) === String(selectedClassId))?.name}`
                  : "Current Filtered"}
                )
              </option>
              <option value="all">All Classes in School</option>
            </select>
          </div>

          {/* Operating Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Operating Days
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DAYS_OF_WEEK.map((d) => {
                const isChecked = genConfig.daysOfWeek.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDaySelection(d)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                      isChecked
                        ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                        : "bg-background/60 hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start & End Working Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Start Time
              </label>
              <Input
                type="time"
                value={genConfig.startTime}
                onChange={(e) => setGenConfig({ ...genConfig, startTime: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background/80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> End Time
              </label>
              <Input
                type="time"
                value={genConfig.endTime}
                onChange={(e) => setGenConfig({ ...genConfig, endTime: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background/80"
              />
            </div>
          </div>

          {/* Period Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" /> Period Duration (Minutes)
            </label>
            <Input
              type="number"
              value={genConfig.periodDuration}
              onChange={(e) =>
                setGenConfig({ ...genConfig, periodDuration: Number(e.target.value) })
              }
              min={15}
              max={120}
              className="h-10 text-xs rounded-xl bg-background/80"
            />
          </div>

          {/* Break / Recess Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Coffee className="h-3.5 w-3.5 text-amber-500" /> Break Start
              </label>
              <Input
                type="time"
                value={genConfig.breakStartTime}
                onChange={(e) => setGenConfig({ ...genConfig, breakStartTime: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background/80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Coffee className="h-3.5 w-3.5 text-amber-500" /> Break End
              </label>
              <Input
                type="time"
                value={genConfig.breakEndTime}
                onChange={(e) => setGenConfig({ ...genConfig, breakEndTime: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background/80"
              />
            </div>
          </div>

          {/* Clear Existing Checkbox */}
          <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/50">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={genConfig.clearExisting}
                onChange={(e) => setGenConfig({ ...genConfig, clearExisting: e.target.checked })}
                className="rounded-md text-primary focus:ring-primary/20 h-4 w-4 border-input"
              />
              <span className="text-xs font-semibold text-foreground">
                Clear existing timetable slots for target class(es)
              </span>
            </label>
          </div>

          {/* Subject Teacher Requirement Note Box */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 shadow-xs">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5">
              <Info className="h-4 w-4" />
            </div>
            <div className="space-y-1 w-full">
              <span className="font-bold text-xs uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Subject Teacher Requirement Note
              </span>
              <p className="text-[11px] leading-relaxed opacity-90">
                All class subjects must have an assigned <strong>Subject Teacher</strong> prior to generation. If any subject lacks an assigned teacher, generation will be blocked.
              </p>
              {unassignedSubjects.length > 0 && (
                <div className="pt-2 border-t border-amber-500/20 mt-2">
                  <p className="text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> {unassignedSubjects.length} unassigned class subject(s) detected:
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {unassignedSubjects.slice(0, 5).map((sub: any, idx: number) => {
                      const clsLabel = sub.className ? `${sub.className}${sub.classSection ? `-${sub.classSection}` : ""}` : "";
                      const subLabel = sub.name || sub.masterSubjectName || sub.subjectName || "Subject";
                      return (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full bg-background/80 border border-amber-500/40 text-[10px] font-bold">
                          {clsLabel ? `${clsLabel}: ${subLabel}` : subLabel}
                        </span>
                      );
                    })}
                  </div>
                  <div className="mt-2.5">
                    <Link
                      to={`/school/${activeSchool?.id || "1"}/subject-teacher-config?status=UNASSIGNED`}
                      onClick={() => setShowGenModal(false)}
                      className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 dark:text-amber-200 underline hover:opacity-80"
                    >
                      Go to Subject Teacher Configuration &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border/60 flex items-center justify-end gap-3 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => setShowGenModal(false)}
            className="rounded-xl px-5 border-border hover:bg-muted font-semibold text-xs"
          >
            Cancel
          </Button>
          <Button onClick={handleRunGenerator} className="rounded-xl px-6 font-bold shadow-md shadow-primary/20 gap-2 text-xs">
            <Wand2 className="h-4 w-4" /> Generate Timetable
          </Button>
        </div>
      </div>
    </div>
  );
};
