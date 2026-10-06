import React from "react";
import { Edit, Plus, X, AlertTriangle, GraduationCap, BookOpen, User, Sparkles, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import type { TimetableSlot, Teacher } from "../../../types";

interface AddSlotModalProps {
  showModal: boolean;
  setShowModal: (val: boolean) => void;
  editingSlot: TimetableSlot | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  error: string | null;
  expandedClasses: Array<{ id: string; name: string; section: string; classMasterId: string; divisionMasterId: string }>;
  uniqueSubjectsList: Array<{ id: string; name: string; code?: string }>;
  teachers: Teacher[];
  DAYS_OF_WEEK: string[];
  reduxTimetable: TimetableSlot[];
  handleSave: () => void;
}

export const AddSlotModal: React.FC<AddSlotModalProps> = ({
  showModal,
  setShowModal,
  editingSlot,
  formData,
  setFormData,
  error,
  expandedClasses,
  uniqueSubjectsList,
  teachers,
  DAYS_OF_WEEK,
  reduxTimetable,
  handleSave,
}) => {
  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4"
      onClick={() => setShowModal(false)}
    >
      <div
        className="bg-card/95 border border-border/80 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/15 border border-primary/30 text-primary shadow-xs">
              {editingSlot ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground tracking-tight">
                {editingSlot ? "Edit Timetable Slot" : "Add Timetable Slot"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editingSlot ? "Modify existing class period schedule" : "Assign a new period slot to class schedule"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-left">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Class Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-primary" /> Target Class
            </label>
            <select
              value={formData.classId}
              onChange={(e) =>
                setFormData({ ...formData, classId: e.target.value, subjectId: "" })
              }
              disabled={!!editingSlot}
              className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:opacity-60 shadow-xs"
            >
              <option value="" disabled>
                Select a class
              </option>
              {expandedClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}-{c.section}
                </option>
              ))}
            </select>
          </div>

          {/* Unique Subject Select */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Subject
              </label>
            </div>

            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-xs"
            >
              <option value="" disabled>
                Select a subject
              </option>
              {uniqueSubjectsList.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} {sub.code ? `(${sub.code})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" /> Teaching Staff
            </label>
            <select
              value={formData.teacherId || ""}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full h-10 rounded-xl border border-input bg-background/80 px-3 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-xs"
            >
              <option value="">Auto-Assign (From Subject Teacher Config)</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher Pre-selection Info Badge */}
          {formData.classId && formData.subjectId && (
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary flex items-center justify-between shadow-xs">
              <span className="font-semibold flex items-center gap-1.5 truncate">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {formData.teacherId
                    ? `Teacher: ${teachers.find((t) => String(t.id) === String(formData.teacherId))?.name || "Assigned Teacher"}`
                    : "Auto-assigning configured Subject Teacher"}
                </span>
              </span>
              <span className="text-[10px] uppercase font-bold opacity-90 px-2 py-0.5 rounded bg-primary/20 shrink-0">
                Configured
              </span>
            </div>
          )}

          {/* Day of Week Select Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" /> Operating Day
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFormData({ ...formData, dayOfWeek: d })}
                  className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all ${
                    formData.dayOfWeek.toLowerCase() === d
                      ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                      : "bg-background/60 hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Start Time
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background/80"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> End Time
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="h-10 text-xs rounded-xl bg-background/80"
              />
            </div>
          </div>

          {/* Live Schedule Conflict Warning Badge */}
          {(() => {
            if (!formData.teacherId || !formData.startTime || !formData.dayOfWeek) return null;
            const conflict = reduxTimetable.find(
              (t) =>
                (!editingSlot || String(t.id) !== String(editingSlot.id)) &&
                String(t.teacherId) === String(formData.teacherId) &&
                t.dayOfWeek.toLowerCase() === formData.dayOfWeek.toLowerCase() &&
                t.startTime.substring(0, 5) === formData.startTime.substring(0, 5)
            );
            if (!conflict) return null;
            return (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Schedule Conflict: Teacher <strong>{conflict.teacherName || "assigned teacher"}</strong> is already teaching <strong>{conflict.className || "another class"}</strong> ({conflict.subjectName}) during this period!
                </span>
              </div>
            );
          })()}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-border/60 flex items-center justify-end gap-3 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => setShowModal(false)}
            className="rounded-xl px-5 border-border hover:bg-muted font-semibold text-xs"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-xl px-6 font-bold shadow-md shadow-primary/20 gap-2 text-xs">
            {editingSlot ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingSlot ? "Update Slot" : "Save Slot"}
          </Button>
        </div>
      </div>
    </div>
  );
};
