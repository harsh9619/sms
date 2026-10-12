import React from "react";
import { X } from "lucide-react";
import { ALL_WEEKDAYS_LOWER } from "./calendarConstants";

interface SchoolConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configFormData: any;
  setConfigFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isSubmitting: boolean;
}

export const SchoolConfigModal: React.FC<SchoolConfigModalProps> = ({
  isOpen,
  onClose,
  configFormData,
  setConfigFormData,
  onSave,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg p-6 rounded-xl bg-card border border-border shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">Configure School Settings</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Session Start Date</label>
              <input
                type="date"
                value={configFormData.sessionStartDate}
                onChange={(e) =>
                  setConfigFormData((prev: any) => ({ ...prev, sessionStartDate: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Session End Date</label>
              <input
                type="date"
                value={configFormData.sessionEndDate}
                onChange={(e) =>
                  setConfigFormData((prev: any) => ({ ...prev, sessionEndDate: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-2">Weekly Working Days</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_WEEKDAYS_LOWER.map((day) => {
                const isChecked = configFormData.workingDays?.includes(day);
                return (
                  <label
                    key={day}
                    className={`p-2 rounded-lg border text-xs font-semibold capitalize flex items-center gap-2 cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setConfigFormData((prev: any) => ({
                            ...prev,
                            workingDays: [...(prev.workingDays || []), day],
                          }));
                        } else {
                          setConfigFormData((prev: any) => ({
                            ...prev,
                            workingDays: (prev.workingDays || []).filter((d: string) => d !== day),
                          }));
                        }
                      }}
                      className="rounded text-primary h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>{day}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Start Time</label>
              <input
                type="time"
                value={configFormData.schoolStartTime}
                onChange={(e) =>
                  setConfigFormData((prev: any) => ({ ...prev, schoolStartTime: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">End Time</label>
              <input
                type="time"
                value={configFormData.schoolEndTime}
                onChange={(e) =>
                  setConfigFormData((prev: any) => ({ ...prev, schoolEndTime: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Periods/Day</label>
              <input
                type="number"
                min={1}
                max={15}
                value={configFormData.periodsPerDay}
                onChange={(e) =>
                  setConfigFormData((prev: any) => ({
                    ...prev,
                    periodsPerDay: Number(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSave}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs disabled:opacity-50 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};
