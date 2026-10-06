import React from "react";
import { Calendar, Layers, Wand2, Plus } from "lucide-react";
import { Button } from "../../ui/Button";

interface TimetableHeaderProps {
  user: any;
  viewMode: "weekly" | "dayGrid";
  setViewMode: (val: "weekly" | "dayGrid") => void;
  activeGridDay: string;
  setActiveGridDay: (val: string) => void;
  setSelectedDay: (val: string) => void;
  getCurrentDayOfWeek: () => string;
  setShowGenModal: (val: boolean) => void;
  openAddModal: () => void;
}

export const TimetableHeader: React.FC<TimetableHeaderProps> = ({
  user,
  viewMode,
  setViewMode,
  activeGridDay,
  setActiveGridDay,
  setSelectedDay,
  getCurrentDayOfWeek,
  setShowGenModal,
  openAddModal,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-border/60 shadow-xs">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <Calendar className="h-6 w-6 text-primary animate-pulse-glow" />
          School Timetable Portal
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {user?.role === "student"
            ? "View your daily & weekly class schedule"
            : user?.role === "teacher"
              ? "View and manage your assigned teaching schedule"
              : "Master School Timetable Overview & Management"}
        </p>
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* View Mode Toggle Switcher */}
        <div className="bg-muted/50 p-1 rounded-xl border border-border/60 flex items-center gap-1">
          <button
            onClick={() => {
              setViewMode("weekly");
              setSelectedDay("");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "weekly"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Weekly View
          </button>
          <button
            onClick={() => {
              setViewMode("dayGrid");
              if (!activeGridDay) setActiveGridDay(getCurrentDayOfWeek());
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === "dayGrid"
                ? "bg-background text-primary shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Day Grid Matrix
          </button>
        </div>

        {user?.role === "admin" && (
          <>
            <Button
              variant="outline"
              onClick={() => setShowGenModal(true)}
              className="border-primary/40 text-primary hover:bg-primary/10 gap-1.5 font-semibold h-9 text-xs px-3.5"
            >
              <Wand2 className="h-3.5 w-3.5" /> Auto Generate
            </Button>
            <Button onClick={() => openAddModal()} className="gap-1.5 h-9 text-xs px-3.5">
              <Plus className="h-3.5 w-3.5" /> Add Slot
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
