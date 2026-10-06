import React from "react";

interface StatItem {
  label: string;
  val: string | number;
  icon: any;
  color: string;
  bg: string;
}

interface TimetableStatsProps {
  roleStats: StatItem[];
}

export const TimetableStats: React.FC<TimetableStatsProps> = ({ roleStats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {roleStats.map((stat, idx) => {
        const IconComp = stat.icon;
        return (
          <div
            key={idx}
            className="bg-card/70 border border-border/60 p-3 rounded-xl flex items-center gap-3 shadow-xs hover:border-primary/30 transition-all"
          >
            <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} shrink-0`}>
              <IconComp className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                {stat.label}
              </p>
              <h4 className="text-base font-bold text-foreground mt-0.5 truncate">{stat.val}</h4>
            </div>
          </div>
        );
      })}
    </div>
  );
};
