import React from "react";
import { Calendar, Clock, BookOpen, User, MapPin, Edit, Trash2, Coffee, Plus } from "lucide-react";
import type { TimetableSlot } from "../../../types";
import { getSubjectColorStyle, isCurrentPeriodNow } from "./timetableUtils";

interface TimetableWeeklyViewProps {
  user: any;
  displayDays: string[];
  groupedTimetable: Record<string, TimetableSlot[]>;
  uniqueTimeSlots?: string[];
  breakConfig: { enabled: boolean; startTime: string; endTime: string; title: string };
  openEditModal: (slot: TimetableSlot) => void;
  handleDelete: (id: string) => void;
  openAddModal?: (defaultClassId?: string, timeSlot?: string) => void;
}

export const TimetableWeeklyView: React.FC<TimetableWeeklyViewProps> = ({
  user,
  displayDays,
  groupedTimetable,
  uniqueTimeSlots = [],
  breakConfig,
  openEditModal,
  handleDelete,
  openAddModal,
}) => {
  return (
    <div
      className={`grid grid-cols-1 ${displayDays.length === 1
          ? "max-w-xl mx-auto"
          : displayDays.length <= 3
            ? "md:grid-cols-3"
            : "md:grid-cols-3 xl:grid-cols-6"
        } gap-3 sm:gap-3.5`}
    >
      {displayDays.map((day) => {
        const slots = groupedTimetable[day] || [];
        return (
          <div key={day} className="space-y-2">
            <div className="py-2 px-3 bg-primary/10 rounded-xl text-center border border-primary/20 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-primary truncate">
                {day}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/15 text-primary shrink-0">
                {slots.length} Slots
              </span>
            </div>

            <div className="space-y-2 min-h-[200px] bg-muted/20 p-2 rounded-xl border border-border/50">
              {(() => {
                // If unique time slots exist, render full schedule grid per period including Free Periods
                if (uniqueTimeSlots && uniqueTimeSlots.length > 0) {
                  return uniqueTimeSlots.map((timeSlot) => {
                    const isBreakRow =
                      breakConfig.enabled &&
                      timeSlot === `${breakConfig.startTime} - ${breakConfig.endTime}`;

                    if (isBreakRow) {
                      return (
                        <div
                          key={`recess-${timeSlot}`}
                          className="py-1.5 px-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-center shadow-xs my-1 animate-fade-in"
                        >
                          <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                            <Coffee className="h-3.5 w-3.5" />
                            <span>{breakConfig.title} ({timeSlot})</span>
                          </div>
                        </div>
                      );
                    }

                    const [slotStart] = timeSlot.split(" - ");
                    const slot = slots.find(
                      (s) => s.startTime && s.startTime.substring(0, 5) === slotStart
                    );

                    if (!slot) {
                      const colorStyle = getSubjectColorStyle("free");
                      return (
                        <div
                          key={`free-${timeSlot}`}
                          onClick={() => openAddModal && user?.role === "admin" && openAddModal(undefined, timeSlot)}
                          className={`group relative ${colorStyle.bg} border border-dashed border-slate-500/30 rounded-xl p-2.5 shadow-xs transition-all duration-200 text-left ${user?.role === "admin" ? "hover:border-primary/60 cursor-pointer hover-lift" : ""
                            }`}
                        >
                          {/* Top Time Badge & Tag */}
                          <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-muted-foreground mb-1">
                            <div className="flex items-center gap-1 text-[10px]">
                              <Clock className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                              <span className="truncate">{timeSlot}</span>
                            </div>
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold border bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-400/30 shrink-0 uppercase">
                              FREE
                            </span>
                          </div>

                          {/* Subject / Period Title */}
                          <h4 className="font-bold text-xs tracking-tight text-muted-foreground/80 group-hover:text-primary transition-colors truncate">
                            Free Period
                          </h4>

                          {/* Details footer */}
                          <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground flex items-center justify-between">
                            <span className="text-[10px] font-medium text-muted-foreground/60">Unassigned</span>
                            {user?.role === "admin" && (
                              <span className="text-[9px] font-bold text-primary flex items-center gap-0.5 group-hover:underline">
                                <Plus className="h-3 w-3" /> Add Slot
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    const colorStyle = getSubjectColorStyle(slot.subjectName);
                    const isActiveNow = isCurrentPeriodNow(slot.dayOfWeek, slot.startTime, slot.endTime);

                    return (
                      <div
                        key={slot.id}
                        className={`group relative ${colorStyle.bg} border ${isActiveNow ? "border-emerald-500 ring-2 ring-emerald-500/30" : colorStyle.border
                          } rounded-xl p-2.5 shadow-xs transition-all duration-200 hover-lift text-left`}
                      >
                        {isActiveNow && (
                          <div className="mb-1 flex items-center">
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold tracking-wider uppercase animate-pulse flex items-center gap-1 shadow-xs">
                              <span className="h-1 w-1 rounded-full bg-white animate-ping" />
                              NOW ACTIVE
                            </span>
                          </div>
                        )}

                        {/* Top Time Badge & Subject Tag */}
                        <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-muted-foreground mb-1">
                          <div className="flex items-center gap-1 text-[10px]">
                            <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                            <span className="truncate">
                              {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                            </span>
                          </div>
                          <span className={`px-1 py-0.2 rounded text-[8px] font-bold border ${colorStyle.badge} shrink-0 uppercase`}>
                            {slot.subjectName.substring(0, 3)}
                          </span>
                        </div>

                        {/* Subject Name */}
                        <h4 className={`font-bold text-xs tracking-tight ${colorStyle.text} group-hover:text-primary transition-colors truncate`}>
                          {slot.subjectName}
                        </h4>

                        {/* Classroom, Teacher & Class details */}
                        <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground space-y-0.5">
                          <div className="flex items-center justify-between gap-1 text-[10px]">
                            {slot.teacherName && (
                              <div className="flex items-center gap-1 truncate min-w-0">
                                <User className="h-3 w-3 text-muted-foreground/75 shrink-0" />
                                <span className="truncate font-medium">{slot.teacherName}</span>
                              </div>
                            )}
                            {slot.className && (
                              <div className="flex items-center gap-1 font-semibold text-primary/90 truncate">
                                <BookOpen className="h-3 w-3 shrink-0" />
                                <span className="truncate">{slot.className}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Admin Operations overlay */}
                        {user?.role === "admin" && (
                          <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(slot)}
                              className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-primary shadow-xs transition-transform"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(slot.id)}
                              className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-destructive shadow-xs transition-transform"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  });
                }

                // Fallback if no unique time slots defined
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
                        className="py-1.5 px-2 bg-amber-500/15 border border-amber-500/30 rounded-lg text-center shadow-xs my-1 animate-fade-in"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <Coffee className="h-3.5 w-3.5" />
                          <span>{breakConfig.title} ({breakTimeRange})</span>
                        </div>
                      </div>
                    );
                  }

                  const colorStyle = getSubjectColorStyle(slot.subjectName);
                  const isActiveNow = isCurrentPeriodNow(slot.dayOfWeek, slot.startTime, slot.endTime);

                  elements.push(
                    <div
                      key={slot.id}
                      className={`group relative ${colorStyle.bg} border ${isActiveNow ? "border-emerald-500 ring-2 ring-emerald-500/30" : colorStyle.border
                        } rounded-xl p-2.5 shadow-xs transition-all duration-200 hover-lift text-left`}
                    >
                      {isActiveNow && (
                        <div className="mb-1 flex items-center">
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-bold tracking-wider uppercase animate-pulse flex items-center gap-1 shadow-xs">
                            <span className="h-1 w-1 rounded-full bg-white animate-ping" />
                            NOW ACTIVE
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-muted-foreground mb-1">
                        <div className="flex items-center gap-1 text-[10px]">
                          <Clock className="h-3 w-3 text-primary/70 shrink-0" />
                          <span className="truncate">
                            {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                          </span>
                        </div>
                        <span className={`px-1 py-0.2 rounded text-[8px] font-bold border ${colorStyle.badge} shrink-0 uppercase`}>
                          {slot.subjectName.substring(0, 3)}
                        </span>
                      </div>

                      <h4 className={`font-bold text-xs tracking-tight ${colorStyle.text} group-hover:text-primary transition-colors truncate`}>
                        {slot.subjectName}
                      </h4>

                      <div className="mt-1.5 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground space-y-0.5">
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          {slot.teacherName && (
                            <div className="flex items-center gap-1 truncate min-w-0">
                              <User className="h-3 w-3 text-muted-foreground/75 shrink-0" />
                              <span className="truncate font-medium">{slot.teacherName}</span>
                            </div>
                          )}
                          {slot.className && (
                            <div className="flex items-center gap-1 font-semibold text-primary/90 truncate">
                              <BookOpen className="h-3 w-3 shrink-0" />
                              <span className="truncate">{slot.className}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {user?.role === "admin" && (
                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-primary shadow-xs transition-transform"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-1 rounded bg-background border border-border text-muted-foreground hover:text-destructive shadow-xs transition-transform"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                });

                if (slots.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40">
                      <Calendar className="h-6 w-6 stroke-[1.5] mb-1" />
                      <span className="text-[10px] font-medium">Free Day</span>
                    </div>
                  );
                }

                return elements;
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
};
