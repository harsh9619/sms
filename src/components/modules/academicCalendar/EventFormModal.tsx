import React from "react";
import { X } from "lucide-react";
import type { CalendarEvent } from "../../../Services/academicCalendar.service";

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEvent: CalendarEvent | null;
  eventFormData: any;
  setEventFormData: React.Dispatch<React.SetStateAction<any>>;
  onSave: () => void;
  isSubmitting: boolean;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  onClose,
  editingEvent,
  eventFormData,
  setEventFormData,
  onSave,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-lg p-6 rounded-xl bg-card border border-border shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="text-base font-bold text-foreground">
            {editingEvent ? "Edit Event / Holiday" : "Add New Event / Holiday"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-foreground mb-1">Title / Name *</label>
            <input
              type="text"
              placeholder="e.g. Mid-Term Exam, Diwali Holiday"
              value={eventFormData.title}
              onChange={(e) =>
                setEventFormData((prev: any) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Type *</label>
              <select
                value={eventFormData.type}
                onChange={(e) => {
                  const type = e.target.value;
                  const isHol = type === "HOLIDAY";
                  setEventFormData((prev: any) => ({
                    ...prev,
                    type,
                    isHoliday: isHol,
                    affectsAttendance: isHol,
                  }));
                }}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs focus:ring-2 focus:ring-primary/30 cursor-pointer"
              >
                <option value="EVENT">School Event</option>
                <option value="HOLIDAY">Official Holiday</option>
                <option value="EXAM">Examination</option>
                <option value="SPORTS">Sports</option>
                <option value="MEETING">Meeting</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">Category Tag</label>
              <input
                type="text"
                placeholder="e.g. Academic, Sports"
                value={eventFormData.category}
                onChange={(e) =>
                  setEventFormData((prev: any) => ({ ...prev, category: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">Start Date *</label>
              <input
                type="date"
                value={eventFormData.startDate}
                onChange={(e) =>
                  setEventFormData((prev: any) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">End Date *</label>
              <input
                type="date"
                value={eventFormData.endDate}
                onChange={(e) =>
                  setEventFormData((prev: any) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-foreground mb-1">
                Start Time (Optional)
              </label>
              <input
                type="time"
                value={eventFormData.startTime}
                onChange={(e) =>
                  setEventFormData((prev: any) => ({ ...prev, startTime: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-foreground mb-1">
                End Time (Optional)
              </label>
              <input
                type="time"
                value={eventFormData.endTime}
                onChange={(e) =>
                  setEventFormData((prev: any) => ({ ...prev, endTime: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Additional details..."
              value={eventFormData.description}
              onChange={(e) =>
                setEventFormData((prev: any) => ({ ...prev, description: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-foreground mb-1">Location / Venue</label>
            <input
              type="text"
              placeholder="e.g. Auditorium"
              value={eventFormData.location}
              onChange={(e) =>
                setEventFormData((prev: any) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground outline-none text-xs"
            />
          </div>

          {/* Is Holiday Checkbox */}
          <div className="pt-2 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={eventFormData.isHoliday || false}
                onChange={(e) =>
                  setEventFormData((prev: any) => ({
                    ...prev,
                    isHoliday: e.target.checked,
                    affectsAttendance: e.target.checked,
                  }))
                }
                className="rounded text-primary focus:ring-primary h-4 w-4 border-border cursor-pointer"
              />
              <span>Mark as Official School Holiday (School Closed)</span>
            </label>
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
            {isSubmitting ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};
