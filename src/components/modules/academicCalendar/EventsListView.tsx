import React, { useState, useMemo } from "react";
import {
  Search,
  X,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  PartyPopper,
} from "lucide-react";
import type { CalendarEvent } from "../../../Services/academicCalendar.service";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import { TYPE_STYLES } from "./calendarConstants";

interface EventsListViewProps {
  events: CalendarEvent[];
  loading: boolean;
  canManage: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  openEditEventModal: (event: CalendarEvent) => void;
  handleDeleteEvent: (id: string) => void;
}

export const EventsListView: React.FC<EventsListViewProps> = ({
  events,
  loading,
  canManage,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  onSelectEvent,
  openEditEventModal,
  handleDeleteEvent,
}) => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const paginatedEvents = useMemo(() => {
    const start = (page - 1) * limit;
    return events.slice(start, start + limit);
  }, [events, page, limit]);

  // Define Table Columns for Desktop List View
  const columns: ColumnDef<CalendarEvent>[] = [
    {
      key: "title",
      header: "Title & Details",
      cell: (row) => (
        <div className="py-1">
          <div className="font-bold text-foreground">{row.title}</div>
          {row.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
              {row.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      cell: (row) => {
        const isHolidayEv = row.isHoliday || row.type === "HOLIDAY";
        const style = isHolidayEv
          ? TYPE_STYLES.HOLIDAY
          : (row.type && TYPE_STYLES[row.type.toUpperCase()]) || TYPE_STYLES.OTHER;
        const IconComp = style.icon || FileText;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${style.badge}`}
            >
              <IconComp className="h-3 w-3" />
              {isHolidayEv ? "Holiday" : style.label}
            </span>
            {row.category && (
              <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                {row.category}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "startDate",
      header: "Start Date",
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          {new Date(row.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "endDate",
      header: "End Date",
      cell: (row) => (
        <span className="text-xs font-semibold text-foreground">
          {new Date(row.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onSelectEvent(row)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => openEditEventModal(row)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Edit Event"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEvent(row.id)}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                title="Delete Event"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search event title or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="HOLIDAY">Holidays Only</option>
          <option value="EXAM">Exams</option>
          <option value="EVENT">School Events</option>
          <option value="SPORTS">Sports</option>
          <option value="MEETING">Meetings</option>
        </select>
      </div>

      {/* Common DataTable */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xs">
        <DataTable
          data={paginatedEvents}
          columns={columns}
          rowKey={(row) => row.id}
          loading={loading}
          bordered={false}
          hoverable={true}
          onRowClick={(row) => onSelectEvent(row)}
          emptyText="No events or holidays found"
          emptyIcon={<PartyPopper className="h-8 w-8 opacity-30" />}
          renderMobileCard={(row) => {
            const isHolidayEv = row.isHoliday || row.type === "HOLIDAY";
            const style = isHolidayEv
              ? TYPE_STYLES.HOLIDAY
              : (row.type && TYPE_STYLES[row.type.toUpperCase()]) || TYPE_STYLES.OTHER;
            const IconComp = style.icon || FileText;

            const startDateStr = new Date(row.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const endDateStr = new Date(row.endDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const isSameDate = row.startDate === row.endDate;

            return (
              <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2.5 shadow-xs">
                {/* Top Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${style.badge}`}
                    >
                      <IconComp className="h-3 w-3" />
                      {isHolidayEv ? "Holiday" : style.label}
                    </span>
                    {row.category && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                        {row.category}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectEvent(row)}
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canManage && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditEventModal(row)}
                          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          title="Edit Event"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEvent(row.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <div className="font-bold text-foreground text-sm leading-snug">
                    {row.title}
                  </div>
                  {row.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {row.description}
                    </p>
                  )}
                </div>

                {/* Date, Time & Venue Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50 flex-wrap gap-2">
                  <div className="flex items-center gap-1 font-semibold text-foreground">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{isSameDate ? startDateStr : `${startDateStr} – ${endDateStr}`}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {row.startTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{row.startTime}</span>
                      </span>
                    )}
                    {row.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{row.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
          pagination={{
            page,
            limit,
            totalItems: events.length,
            onPageChange: (newPage) => setPage(newPage),
          }}
        />
      </div>
    </div>
  );
};
