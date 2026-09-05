import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import {
  fetchTimetablesRequest,
  createTimetableRequest,
  updateTimetableRequest,
  deleteTimetableRequest,
  fetchClassesRequest,
  fetchStudentsRequest,
} from "../../saga";
import classService from "../../Services/class.service";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Calendar, Clock, Plus, Trash2, Edit, X, MapPin, User, BookOpen } from "lucide-react";
import type { TimetableSlot, ClassInfo } from "../../types";
import { useSchool } from "../../context/SchoolContext";

const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const mapStateToProps = (state: AppState) => ({
  reduxClasses: state.classes.classes,
  reduxStudents: state.students.students,
  reduxTimetable: state.timetables.timetables,
  loading: state.timetables.loading,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchClassesRequest: () => dispatch(fetchClassesRequest()),
  fetchStudentsRequest: () => dispatch(fetchStudentsRequest()),
  fetchTimetablesRequest: (params?: any) => dispatch(fetchTimetablesRequest(params)),
  createTimetableRequest: (t: any) => dispatch(createTimetableRequest(t)),
  updateTimetableRequest: (payload: { id: string; t: any }) => dispatch(updateTimetableRequest(payload)),
  deleteTimetableRequest: (id: string) => dispatch(deleteTimetableRequest(id)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

function TimetablePageContent({
  reduxClasses,
  reduxStudents,
  reduxTimetable,
  loading,
  fetchClassesRequest,
  fetchStudentsRequest,
  fetchTimetablesRequest,
  createTimetableRequest,
  updateTimetableRequest,
  deleteTimetableRequest,
}: PropsFromRedux) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [studentClassId, setStudentClassId] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    dayOfWeek: "monday",
    startTime: "08:30",
    endTime: "09:30",
    classroom: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassesRequest();
    fetchStudentsRequest();
  }, [fetchClassesRequest, fetchStudentsRequest, activeSchool]);

  useEffect(() => {
    setClasses(reduxClasses);
    if (reduxClasses.length > 0 && user?.role === "admin" && !selectedClassId) {
      setSelectedClassId(reduxClasses[0].id);
    }
  }, [reduxClasses, user, selectedClassId]);

  useEffect(() => {
    if (user?.role === "student") {
      const profile = reduxStudents.find((s: any) => s.email === user.email);
      if (profile && (profile as any).classId) {
        setStudentClassId((profile as any).classId);
      }
    }
  }, [user, reduxStudents]);

  useEffect(() => {
    let params: any = {};
    if (user?.role === "student" && studentClassId) {
      params.classId = studentClassId;
    } else if (user?.role === "teacher") {
      params.teacherId = user.id;
    } else if (user?.role === "admin" && selectedClassId) {
      params.classId = selectedClassId;
    }
    fetchTimetablesRequest(params);
  }, [user, selectedClassId, studentClassId, activeSchool, fetchTimetablesRequest]);

  const timetable = useMemo(() => {
    if (user?.role === "student" && studentClassId) {
      return reduxTimetable.filter((t: any) => t.classId === studentClassId);
    }
    if (user?.role === "teacher") {
      return reduxTimetable.filter((t: any) => t.teacherId === user.id);
    }
    if (user?.role === "admin" && selectedClassId) {
      return reduxTimetable.filter((t: any) => t.classId === selectedClassId);
    }
    return reduxTimetable;
  }, [reduxTimetable, user, selectedClassId, studentClassId]);

  useEffect(() => {
    const cid = formData.classId || selectedClassId;
    if (cid) {
      classService.getSubjects({ classId: cid })
        .then((subs: any) => setSubjects(subs))
        .catch((err: any) => console.error(err));
    }
  }, [formData.classId, selectedClassId]);

  const openAddModal = () => {
    setEditingSlot(null);
    setFormData({
      classId: selectedClassId || (classes[0]?.id || ""),
      subjectId: "",
      dayOfWeek: "monday",
      startTime: "08:30",
      endTime: "09:30",
      classroom: "",
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      classId: slot.classId,
      subjectId: slot.subjectId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime.substring(0, 5),
      endTime: slot.endTime.substring(0, 5),
      classroom: slot.classroom || "",
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this timetable slot?")) return;
    deleteTimetableRequest(id);
  };

  const handleSave = () => {
    setError(null);
    if (!formData.classId || !formData.subjectId || !formData.startTime || !formData.endTime) {
      setError("Please fill out all required fields.");
      return;
    }

    const payload = {
      ...formData,
      startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };

    if (editingSlot) {
      updateTimetableRequest({ id: editingSlot.id, t: payload });
      setShowModal(false);
    } else {
      createTimetableRequest(payload);
      setShowModal(false);
    }
  };

  // Group slots by day
  const groupedTimetable = useMemo(() => {
    const groups: Record<string, TimetableSlot[]> = {};
    DAYS_OF_WEEK.forEach((day) => {
      groups[day] = [];
    });

    timetable.forEach((slot) => {
      const day = slot.dayOfWeek.toLowerCase();
      if (groups[day]) {
        groups[day].push(slot);
      }
    });

    // Sort chronologically
    Object.keys(groups).forEach((day) => {
      groups[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return groups;
  }, [timetable]);



  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-7 w-7 text-primary animate-pulse-glow" />
            Weekly Timetable
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "student" ? "Your class weekly schedule" : "Manage and view class schedule slots"}
          </p>
        </div>
        {user?.role === "admin" && (
          <div className="flex items-center gap-3">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
            >
              <option value="" disabled>Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>
              ))}
            </select>
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Slot
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading timetable schedule...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-5">
          {DAYS_OF_WEEK.map((day) => {
            const slots = groupedTimetable[day] || [];
            return (
              <div key={day} className="space-y-3.5">
                <div className="p-3 bg-primary/10 rounded-xl text-center border border-primary/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                    {day}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{slots.length} Classes</p>
                </div>

                <div className="space-y-3 min-h-[300px] bg-muted/20 p-2.5 rounded-xl border border-border/50">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className="group relative bg-card hover:bg-muted/50 border border-border/80 rounded-xl p-3.5 shadow-sm transition-all duration-300 hover-lift text-left"
                    >
                      {/* Top Time Badge */}
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground mb-2">
                        <Clock className="h-3 w-3 text-primary/70" />
                        <span>
                          {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                        </span>
                      </div>

                      {/* Subject Name */}
                      <h4 className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {slot.subjectName}
                      </h4>

                      {/* Classroom & Teacher details */}
                      <div className="space-y-1.5 mt-3 pt-2.5 border-t border-border/50 text-[10px] text-muted-foreground">
                        {slot.classroom && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-muted-foreground/75" />
                            <span className="truncate">{slot.classroom}</span>
                          </div>
                        )}
                        {slot.teacherName && (
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-muted-foreground/75" />
                            <span className="truncate">{slot.teacherName}</span>
                          </div>
                        )}
                        {user?.role === "teacher" && (
                          <div className="flex items-center gap-1.5 font-medium text-primary/90">
                            <BookOpen className="h-3 w-3" />
                            <span>{slot.className}-{slot.section}</span>
                          </div>
                        )}
                      </div>

                      {/* Admin Operations overlay */}
                      {user?.role === "admin" && (
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(slot)}
                            className="p-1 rounded-md bg-background border border-border text-muted-foreground hover:text-primary shadow-sm hover:scale-105 transition-transform"
                            title="Edit"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(slot.id)}
                            className="p-1 rounded-md bg-background border border-border text-muted-foreground hover:text-destructive shadow-sm hover:scale-105 transition-transform"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {slots.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                      <Calendar className="h-8 w-8 stroke-[1.5] mb-1.5" />
                      <span className="text-[10px] font-medium">Free Day</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingSlot ? "Edit Slot" : "Add Timetable Slot"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {error && <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">{error}</div>}

              {/* Class Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class</label>
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({ ...formData, classId: e.target.value, subjectId: "" })}
                  disabled={!!editingSlot}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>Select a class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>Class {c.name}-{c.section}</option>
                  ))}
                </select>
              </div>

              {/* Subject Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Subject</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              {/* Day of Week Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Day of Week</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>{d.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">End Time</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Classroom */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Classroom (Optional)</label>
                <Input
                  placeholder="e.g. Room 102"
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const TimetablePage = mapper(TimetablePageContent);
