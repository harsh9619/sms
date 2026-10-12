import React from "react";
import { X, Calendar as CalendarIcon, Clock, MapPin, Edit2, Trash2 } from "lucide-react";
import type { CalendarEvent } from "../../../Services/academicCalendar.service";
import { TYPE_STYLES } from "./calendarConstants";

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  canManage: boolean;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
  canManage,
  onEdit,
  onDelete,
}) => {
  if (!event) return null;

  const evType = event.type ? event.type.toUpperCase() : "OTHER";
  const isHol = event.isHoliday || evType === "HOLIDAY";
  const style = isHol ? TYPE_STYLES.HOLIDAY : TYPE_STYLES[evType] || TYPE_STYLES.OTHER;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
      <div className="w-full max-w-md p-6 rounded-xl bg-card border border-border shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-3">
          <div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${style.badge}`}
            >
              {isHol ? "Official Holiday" : style.label}
            </span>
            <h3 className="text-lg font-bold text-foreground mt-2">{event.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content details */}
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
            <span>
              {event.startDate === event.endDate
                ? new Date(event.startDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : `${new Date(event.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })} – ${new Date(event.endDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`}
            </span>
          </div>

          {event.startTime && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                Time: {event.startTime} {event.endTime ? `- ${event.endTime}` : ""}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>Location: {event.location}</span>
            </div>
          )}

          {event.category && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Category:</span>
              <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-medium">
                {event.category}
              </span>
            </div>
          )}

          {event.description && (
            <div className="p-3 rounded-lg bg-muted/40 border border-border text-foreground mt-2">
              <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(event);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = event.id;
                  onClose();
                  onDelete(id);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs cursor-pointer hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
