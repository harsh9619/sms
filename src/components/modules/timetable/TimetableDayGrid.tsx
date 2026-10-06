import React from "react";
import { Clock, Coffee, Plus, User, MapPin, Edit, Trash2 } from "lucide-react";
import type { TimetableSlot } from "../../../types";
import { getSubjectColorStyle, isCurrentPeriodNow } from "./timetableUtils";

interface TimetableDayGridProps {
  user: any;
  DAYS_OF_WEEK: string[];
  activeGridDay: string;
  setActiveGridDay: (val: string) => void;
  setSelectedDay: (val: string) => void;
  gridTargetClasses: Array<{ id: string; name: string; section: string; classMasterId: string; divisionMasterId: string }>;
  uniqueTimeSlots: string[];
  breakConfig: { enabled: boolean; startTime: string; endTime: string; title: string };
  reduxTimetable: TimetableSlot[];
  selectedTeacherId: string;
  openAddModal: (defaultClassId?: string, timeSlot?: string) => void;
  openEditModal: (slot: TimetableSlot) => void;
  handleDelete: (id: string) => void;
}

export const TimetableDayGrid: React.FC<TimetableDayGridProps> = ({
  user,
  DAYS_OF_WEEK,
  activeGridDay,
  setActiveGridDay,
  setSelectedDay,
  gridTargetClasses,
  uniqueTimeSlots,
  breakConfig,
  reduxTimetable,
  selectedTeacherId,
  openAddModal,
  openEditModal,
  handleDelete,
}) => {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Day Selector Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-card/40 p-1.5 rounded-xl border border-border/50">
        {DAYS_OF_WEEK.map((d) => (
          <button
            key={d}
            onClick={() => {
              setActiveGridDay(d);
              setSelectedDay(d);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${activeGridDay.toLowerCase() === d
              ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
              : "bg-card hover:bg-muted border-border/80 text-muted-foreground hover:text-foreground"
              }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Day Grid Matrix Table */}
      <div className="bg-card/80 border border-border/70 rounded-2xl overflow-x-auto max-h-[65vh] overflow-y-auto shadow-md backdrop-blur-sm scrollbar-thin">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-md shadow-xs">
            <tr className="bg-muted/60 border-b border-border text-muted-foreground uppercase tracking-wider text-[10px]">
              <th className="p-2.5 border-r border-border min-w-[130px] font-bold text-primary">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Time Period
                </div>
              </th>
              {gridTargetClasses.map((c) => (
                <th
                  key={c.id}
                  className="p-2.5 border-r border-border min-w-[150px] text-center font-bold text-foreground bg-primary/5"
                >
                  {c.name}-{c.section || (c as any).division || ""}
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
              const targetClasses = gridTargetClasses;

              const isBreakRow =
                breakConfig.enabled &&
                timeSlot === `${breakConfig.startTime} - ${breakConfig.endTime}`;

              if (isBreakRow) {
                return (
                  <tr
                    key={timeSlot}
                    className="bg-amber-500/15 border-y border-amber-500/40 text-amber-700 dark:text-amber-300 font-bold"
                  >
                    <td className="p-2 border-r border-amber-500/30 whitespace-nowrap text-xs bg-amber-500/10">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Coffee className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{timeSlot}</span>
                      </div>
                    </td>
                    <td
                      colSpan={targetClasses.length}
                      className="p-2 text-center text-xs tracking-wider uppercase bg-amber-500/10 font-bold text-amber-700 dark:text-amber-300"
                    >
                      🍽️ {breakConfig.title} (Recess Break All Classes)
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={timeSlot} className="hover:bg-muted/20 transition-colors">
                  <td className="p-2 font-bold text-muted-foreground bg-muted/15 border-r border-border whitespace-nowrap text-[11px]">
                    {timeSlot}
                  </td>
                  {targetClasses.map((c) => {
                    const slot = reduxTimetable.find((t) => {
                      const startStr = t.startTime ? t.startTime.substring(0, 5) : "";
                      const [slotStart] = timeSlot.split(" - ");
                      const matchesClass =
                        String(t.classId) === String(c.id) ||
                        (c.classMasterId && String(t.classMasterId) === String(c.classMasterId)) ||
                        (c.classMasterId && String(t.classId) === String(c.classMasterId));

                      const matchesDivision =
                        !c.divisionMasterId ||
                        !t.divisionMasterId ||
                        String(t.divisionMasterId) === String(c.divisionMasterId);

                      const matchesTeacher =
                        !selectedTeacherId || String(t.teacherId) === String(selectedTeacherId);

                      return (
                        matchesClass &&
                        matchesDivision &&
                        matchesTeacher &&
                        t.dayOfWeek?.toLowerCase() === activeGridDay.toLowerCase() &&
                        startStr === slotStart
                      );
                    });

                    return (
                      <td
                        key={c.id}
                        className="p-1.5 border-r border-border/60 align-top min-w-[150px]"
                      >
                        {(() => {
                          if (!slot) {
                            return user?.role === "admin" ? (
                              <div
                                onClick={() => openAddModal(c.id, timeSlot)}
                                className="flex items-center justify-center min-h-[52px] text-muted-foreground/40 text-[10px] font-medium bg-muted/10 hover:bg-primary/5 hover:border-primary/40 cursor-pointer rounded-lg border border-dashed border-border/40 p-1.5 transition-all group gap-1"
                              >
                                <Plus className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-all" />
                                <span className="text-[10px] font-semibold opacity-70 group-hover:text-primary">Add Slot</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center min-h-[52px] text-muted-foreground/40 text-[10px] font-medium bg-muted/10 rounded-lg border border-dashed border-border/40 p-1.5">
                                <span className="text-[10px] font-semibold opacity-70">Free Period</span>
                              </div>
                            );
                          }

                          const colorStyle = getSubjectColorStyle(slot.subjectName);
                          const isActiveNow = isCurrentPeriodNow(slot.dayOfWeek, slot.startTime, slot.endTime);

                          return (
                            <div
                              className={`group relative ${colorStyle.bg} border ${isActiveNow ? "border-emerald-500 ring-2 ring-emerald-500/30" : colorStyle.border
                                } hover:border-primary rounded-lg p-2 shadow-xs transition-all`}
                            >
                              {isActiveNow && (
                                <div className="mb-1 flex items-center">
                                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[8px] font-bold tracking-wider uppercase animate-pulse flex items-center gap-1 shadow-xs">
                                    <span className="h-1 w-1 rounded-full bg-white animate-ping" />
                                    NOW ACTIVE
                                  </span>
                                </div>
                              )}
                              <div className="flex items-start justify-between gap-1">
                                <h5 className={`font-bold text-xs ${colorStyle.text} group-hover:text-primary transition-colors truncate`}>
                                  {slot.subjectName}
                                </h5>
                                <span className={`px-1 py-0.2 rounded text-[8px] font-bold border ${colorStyle.badge} shrink-0 uppercase`}>
                                  {slot.subjectName.substring(0, 3)}
                                </span>
                              </div>
                              <div className="mt-1 pt-1 border-t border-border/40 text-[10px] flex items-center justify-between gap-1 text-muted-foreground">
                                {slot.teacherName && (
                                  <div className="flex items-center gap-1 truncate font-medium min-w-0">
                                    <User className="h-3 w-3 text-primary/70 shrink-0" />
                                    <span className="truncate">{slot.teacherName}</span>
                                  </div>
                                )}
                                {/* {slot.classroom && (
                                  <div className="flex items-center gap-1 shrink-0 font-medium">
                                    <MapPin className="h-3 w-3 text-muted-foreground/70 shrink-0" />
                                    <span>{slot.classroom}</span>
                                  </div>
                                )} */}
                              </div>
                              {user?.role === "admin" && (
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => openEditModal(slot)}
                                    className="p-0.5 rounded bg-background border border-border hover:text-primary shadow-xs"
                                    title="Edit"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(slot.id)}
                                    className="p-0.5 rounded bg-background border border-border hover:text-destructive shadow-xs"
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
  );
};
