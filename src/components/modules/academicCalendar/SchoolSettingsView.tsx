import React from "react";
import { CheckCircle2, Calendar, Clock, SlidersHorizontal } from "lucide-react";
import type { WorkingConfig } from "../../../Services/academicCalendar.service";
import { ALL_WEEKDAYS_LOWER } from "./calendarConstants";

interface SchoolSettingsViewProps {
  sessionConfig: WorkingConfig | null;
  totalWorkingDays: number;
  canManage: boolean;
  onOpenConfigModal: () => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  sessionConfig,
  totalWorkingDays,
  canManage,
  onOpenConfigModal,
}) => {
  const activeWorkingDays = (sessionConfig?.workingDays || []).map((d) => d.toLowerCase());

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session Dates */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Academic Session</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-semibold text-foreground">
                {sessionConfig?.sessionStartDate
                  ? new Date(sessionConfig.sessionStartDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : ""}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-semibold text-foreground">
                {sessionConfig?.sessionEndDate
                  ? new Date(sessionConfig.sessionEndDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : ""}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Calculated Working Days:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {totalWorkingDays} Days
              </span>
            </div>
          </div>
        </div>

        {/* School Operating Hours */}
        <div className="p-5 rounded-xl bg-card border border-border space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Daily School Timings</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">School Start Time:</span>
              <span className="font-semibold text-foreground">
                {sessionConfig?.schoolStartTime}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-border">
              <span className="text-muted-foreground">School End Time:</span>
              <span className="font-semibold text-foreground">
                {sessionConfig?.schoolEndTime}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-muted-foreground">Total Periods / Day:</span>
              <span className="font-semibold text-foreground">
                {sessionConfig?.periodsPerDay} Periods
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Active Working Days */}
      <div className="p-5 rounded-xl bg-card border border-border space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Weekly Working Days</h3>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              Change Settings
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {ALL_WEEKDAYS_LOWER.map((day) => {
            const isActive = activeWorkingDays.includes(day);
            return (
              <div
                key={day}
                className={`p-3 rounded-lg text-xs font-semibold capitalize flex items-center justify-between border transition-all ${isActive
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500 border-rose-500/20 opacity-60"
                  }`}
              >
                <span>{day}</span>
                {isActive ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <span className="text-[10px] font-bold text-rose-500">OFF</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
