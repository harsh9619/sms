import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { CalendarEvent, WorkingConfig } from "../../../Services/academicCalendar.service";
import { MONTH_NAMES, WEEK_DAYS, TYPE_STYLES } from "./calendarConstants";

interface CalendarGridViewProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  events: CalendarEvent[];
  sessionConfig: WorkingConfig | null;
  filterType: string;
  setFilterType: (val: string) => void;
  canManage: boolean;
  openAddEventModal: (dateStr?: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarGridView: React.FC<CalendarGridViewProps> = ({
  currentDate,
  setCurrentDate,
  events,
  sessionConfig,
  filterType,
  setFilterType,
  canManage,
  openAddEventModal,
  onSelectEvent,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Calendar cells calculation
  const calendarCells = useMemo(() => {
    const cells: Array<{ date: Date | null; dateStr: string | null; isCurrentMonth: boolean }> = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push({ date: null, dateStr: null, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dObj = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: dObj, dateStr, isCurrentMonth: true });
    }
    return cells;
  }, [year, month, firstDayOfMonth, daysInMonth]);

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      let cur = new Date(ev.startDate);
      const end = new Date(ev.endDate);
      while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, "0");
        const d = String(cur.getDate()).padStart(2, "0");
        const key = `${y}-${m}-${d}`;
        if (!map[key]) map[key] = [];
        map[key].push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  const prevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  const activeWorkingDays = useMemo(() => {
    return (
      sessionConfig?.workingDays || [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ]
    ).map((d) => d.toLowerCase());
  }, [sessionConfig?.workingDays]);

  return (
    <div className="space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            type="button"
            onClick={resetToToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all border border-border cursor-pointer"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-border rounded-lg bg-background p-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="HOLIDAY">Holidays Only</option>
            <option value="EXAM">Exams</option>
            <option value="EVENT">School Events</option>
            <option value="SPORTS">Sports</option>
            <option value="MEETING">Meetings</option>
          </select>
        </div>
      </div>

      {/* Month Calendar Grid */}
      <div className="bg-card rounded-xl border border-border p-3 sm:p-4 shadow-xs space-y-3">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground border-b border-border pb-2">
          {WEEK_DAYS.map((day, idx) => (
            <div key={day} className={idx === 0 ? "text-rose-500" : ""}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth || !cell.dateStr) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[85px] sm:min-h-[95px] rounded-lg bg-muted/10 border border-transparent p-1.5 opacity-25"
                />
              );
            }

            const isToday = cell.dateStr === todayStr;
            const isSunday = cell.date?.getDay() === 0;
            const dayNameLower = cell.date
              ? cell.date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
              : "";

            const isNonWorkingDay = dayNameLower
              ? !activeWorkingDays.includes(dayNameLower)
              : isSunday;

            const dayEvents = eventsByDate[cell.dateStr] || [];
            const hasHolidayEvent = dayEvents.some((ev) => ev.isHoliday || ev.type === "HOLIDAY");
            const isHolidayDay = isNonWorkingDay || hasHolidayEvent;

            return (
              <div
                key={cell.dateStr}
                className={`min-h-[85px] sm:min-h-[95px] rounded-lg border p-1 sm:p-1.5 flex flex-col justify-between transition-all group relative ${
                  isToday
                    ? "bg-primary/5 border-primary ring-2 ring-primary/20"
                    : isHolidayDay
                    ? "bg-rose-500/10 dark:bg-rose-950/20 border-rose-500/30"
                    : "bg-background hover:bg-muted/30 border-border"
                }`}
              >
                {/* Top Date Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : isHolidayDay
                        ? "text-rose-600 dark:text-rose-400 font-bold"
                        : "text-foreground"
                    }`}
                  >
                    {cell.date?.getDate()}
                  </span>

                  {canManage && (
                    <button
                      type="button"
                      disabled={!sessionConfig?.sessionStartDate}
                      onClick={() => {
                        if (sessionConfig?.sessionStartDate) {
                          openAddEventModal(cell.dateStr!);
                        }
                      }}
                      className={`opacity-0 group-hover:opacity-100 p-0.5 rounded text-xs transition-opacity ${
                        !sessionConfig?.sessionStartDate
                          ? "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
                          : "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      }`}
                      title={
                        !sessionConfig?.sessionStartDate
                          ? "Session start date is missing. Please configure session start date in School Settings first."
                          : "Add Event on this day"
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Day Events & Non-Working Day Badges */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[55px] sm:max-h-[65px] scrollbar-none">
                  {/* Non-Working Day Badge */}
                  {isNonWorkingDay && !hasHolidayEvent && (
                    <div
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-500/20 flex items-center gap-1"
                      title="Holiday (Non-Working Day)"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="truncate">Weekly Off</span>
                    </div>
                  )}

                  {/* Scheduled Events & Holidays */}
                  {dayEvents.map((ev) => {
                    const isHolidayEv = ev.isHoliday || ev.type === "HOLIDAY";
                    const style = isHolidayEv
                      ? {
                          badge:
                            "bg-rose-500/15 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-500/20",
                          dot: "bg-rose-500",
                          label: "Holiday",
                        }
                      : TYPE_STYLES[ev.type] || TYPE_STYLES.OTHER;

                    return (
                      <div
                        key={`${ev.id}-${cell.dateStr}`}
                        onClick={() => onSelectEvent(ev)}
                        className={`px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-medium truncate cursor-pointer ${style.badge} flex items-center gap-1 hover:opacity-90 transition-opacity`}
                        title={`${ev.title} (${style.label})`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
