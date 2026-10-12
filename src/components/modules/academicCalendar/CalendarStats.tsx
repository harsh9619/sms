import React from "react";
import { PartyPopper, CalendarDays, CheckCircle2 } from "lucide-react";
import type { CalendarSummary } from "./types";

interface CalendarStatsProps {
  summary: CalendarSummary;
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({ summary }) => {
  const stats = [
    {
      label: "Official Holidays",
      val: `${summary.totalHolidays} Days`,
      icon: PartyPopper,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "hover:border-rose-500/30",
    },
    {
      label: "Events & Activities",
      val: `${summary.totalEvents} Total`,
      icon: CalendarDays,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "hover:border-indigo-500/30",
    },
    {
      label: "Term Working Days",
      val: `${summary.totalWorkingDays} Days`,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "hover:border-emerald-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((item, idx) => {
        const IconComp = item.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 rounded-xl bg-card border border-border flex items-center gap-3 shadow-xs transition-all ${item.border}`}
          >
            <div className={`p-2.5 rounded-lg ${item.bg} ${item.color} shrink-0`}>
              <IconComp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-xs text-muted-foreground font-medium block truncate">
                {item.label}
              </span>
              <p className={`text-lg font-bold mt-0.5 truncate ${item.color}`}>{item.val}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
