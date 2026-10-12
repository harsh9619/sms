import React from "react";
import { Plus, Settings, CalendarDays, List, SlidersHorizontal } from "lucide-react";
import type { CalendarViewMode } from "./types";

interface CalendarHeaderProps {
  canManage: boolean;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  eventsCount: number;
  openAddEventModal: () => void;
  setShowConfigModal: (val: boolean) => void;
  sessionStartDate?: string | null;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  canManage,
  viewMode,
  setViewMode,
  eventsCount,
  openAddEventModal,
  setShowConfigModal,
  sessionStartDate,
}) => {
  const isStartDateMissing = !sessionStartDate;

  return (
    <div className="space-y-4">
      {/* Top Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Academic Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage school events, holidays, examinations, and working schedule
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {viewMode !== "workingDays" ? (
              <div
                className="relative group inline-flex"
                title={
                  isStartDateMissing
                    ? "Session start date is missing. Please configure session start date in School Settings first."
                    : undefined
                }
              >
                {/* inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-xs cursor-pointer */}
                <button
                  type="button"
                  disabled={isStartDateMissing}
                  onClick={openAddEventModal}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-xs ${isStartDateMissing
                    ? "bg-muted border-2 border-border text-muted-foreground cursor-not-allowed opacity-90"
                    : "bg-primary text-primary-foreground hover:opacity-90 cursor-pointer"
                    }`}
                >
                  <Plus className="h-4 w-4" /> Add Event / Holiday
                </button>

                {isStartDateMissing && (
                  <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex z-50 w-72 p-2.5 bg-popover text-popover-foreground border border-border text-xs rounded-lg shadow-lg pointer-events-none leading-relaxed">
                    Session start date is missing. Please configure the academic session start date in School Settings & Timings first.
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfigModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-xs cursor-pointer"
              >
                <Settings className="h-4 w-4" /> Edit Configuration
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs (3 distinct views: Calendar, List, Settings) */}
      <div className="w-full border-b border-border flex items-center gap-1">
        {canManage && (
          <button
            type="button"
            onClick={() => setViewMode("workingDays")}
            className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-all inline-flex items-center justify-center gap-2 truncate cursor-pointer ${viewMode === "workingDays"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>School Settings & Timings</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-all inline-flex items-center justify-center gap-2 truncate cursor-pointer ${viewMode === "list"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <List className="h-4 w-4 shrink-0" />
          <span>Events List ({eventsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("calendar")}
          className={`hidden sm:inline-flex flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold border-b-2 text-center transition-all items-center justify-center gap-2 truncate cursor-pointer ${viewMode === "calendar"
            ? "border-primary text-primary font-bold"
            : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
        >
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>Calendar View</span>
        </button>




      </div>
    </div>
  );
};
