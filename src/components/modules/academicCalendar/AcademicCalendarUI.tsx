import React, { useState } from "react";
import type { CalendarEvent } from "../../../Services/academicCalendar.service";
import type { AcademicCalendarUIProps } from "./types";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarStats } from "./CalendarStats";
import { CalendarGridView } from "./CalendarGridView";
import { EventsListView } from "./EventsListView";
import { SchoolSettingsView } from "./SchoolSettingsView";
import { EventFormModal } from "./EventFormModal";
import { SchoolConfigModal } from "./SchoolConfigModal";
import { EventDetailsModal } from "./EventDetailsModal";

export type { AcademicCalendarUIProps } from "./types";

export function AcademicCalendarUI({
  canManage,
  loading,
  sessionConfig,
  events,
  summary,
  currentDate,
  setCurrentDate,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  showEventModal,
  setShowEventModal,
  editingEvent,
  eventFormData,
  setEventFormData,
  openAddEventModal,
  openEditEventModal,
  handleSaveEvent,
  handleDeleteEvent,
  showConfigModal,
  setShowConfigModal,
  configFormData,
  setConfigFormData,
  handleSaveConfig,
  isSubmitting,
}: AcademicCalendarUIProps) {
  // Modal state for viewing event details
  const [selectedEventView, setSelectedEventView] = useState<CalendarEvent | null>(null);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-foreground">
      {/* 1. Header & Navigation Tabs */}
      <CalendarHeader
        canManage={canManage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        eventsCount={events.length}
        openAddEventModal={() => openAddEventModal()}
        setShowConfigModal={setShowConfigModal}
        sessionStartDate={sessionConfig?.sessionStartDate}
      />

      {/* 2. Top Summary Metric Cards */}
      <CalendarStats summary={summary} />

      {/* 3. Primary View Content */}
      {viewMode === "calendar" && (
        <>
          <div className="hidden sm:block">
            <CalendarGridView
              currentDate={currentDate}
              setCurrentDate={setCurrentDate}
              events={events}
              sessionConfig={sessionConfig}
              filterType={filterType}
              setFilterType={setFilterType}
              canManage={canManage}
              openAddEventModal={openAddEventModal}
              onSelectEvent={setSelectedEventView}
            />
          </div>
          <div className="block sm:hidden">
            <EventsListView
              events={events}
              loading={loading}
              canManage={canManage}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterType={filterType}
              setFilterType={setFilterType}
              onSelectEvent={setSelectedEventView}
              openEditEventModal={openEditEventModal}
              handleDeleteEvent={handleDeleteEvent}
            />
          </div>
        </>
      )}

      {viewMode === "list" && (
        <EventsListView
          events={events}
          loading={loading}
          canManage={canManage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          onSelectEvent={setSelectedEventView}
          openEditEventModal={openEditEventModal}
          handleDeleteEvent={handleDeleteEvent}
        />
      )}

      {viewMode === "workingDays" && canManage && (
        <SchoolSettingsView
          sessionConfig={sessionConfig}
          totalWorkingDays={summary.totalWorkingDays}
          canManage={canManage}
          onOpenConfigModal={() => setShowConfigModal(true)}
        />
      )}

      {/* 4. Modals */}
      <EventFormModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        editingEvent={editingEvent}
        eventFormData={eventFormData}
        setEventFormData={setEventFormData}
        onSave={handleSaveEvent}
        isSubmitting={isSubmitting}
      />

      <SchoolConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        configFormData={configFormData}
        setConfigFormData={setConfigFormData}
        onSave={handleSaveConfig}
        isSubmitting={isSubmitting}
      />

      <EventDetailsModal
        event={selectedEventView}
        onClose={() => setSelectedEventView(null)}
        canManage={canManage}
        onEdit={openEditEventModal}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}

export default AcademicCalendarUI;
