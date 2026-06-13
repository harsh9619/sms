import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchHomework, createHomework, updateHomework, deleteHomework, fetchClasses, fetchSubjects, fetchStudents } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { useSchool } from "../../context/SchoolContext";
import { BookOpen, Calendar, Clock, Plus, Trash2, Edit, X, User, CheckCircle2 } from "lucide-react";
import type { HomeworkRecord, ClassInfo } from "../../types";

export function HomeworkPage() {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [homeworkList, setHomeworkList] = useState<HomeworkRecord[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [studentClassId, setStudentClassId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHomework, setEditingHomework] = useState<HomeworkRecord | null>(null);
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    title: "",
    description: "",
    dueDate: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState<string | null>(null);

  // Load baseline data (classes)
  useEffect(() => {
    fetchClasses()
      .then((d) => setClasses(d))
      .catch((err) => console.error(err));
  }, [activeSchool]);

  // Fetch student class details if student
  useEffect(() => {
    if (user?.role === "student") {
      fetchStudents()
        .then((students) => {
          const profile = students.find((s: any) => s.email === user.email);
          if (profile && profile.classId) {
            setStudentClassId(profile.classId);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user, activeSchool]);

  // Load homeworks based on role
  const loadHomework = React.useCallback(() => {
    setLoading(true);
    let params: any = {};
    if (user?.role === "student" && studentClassId) {
      params.classId = studentClassId;
    } else if (user?.role === "teacher") {
      params.teacherId = user.id;
    } else if (user?.role === "admin") {
      // Admins see all homeworks
    } else {
      setLoading(false);
      return;
    }

    fetchHomework(params)
      .then((data) => {
        setHomeworkList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user, studentClassId]);

  useEffect(() => {
    loadHomework();
  }, [loadHomework, activeSchool]);

  // Load subjects dynamically for modal forms
  useEffect(() => {
    if (formData.classId) {
      fetchSubjects({ classId: formData.classId })
        .then((subs) => setSubjects(subs))
        .catch((err) => console.error(err));
    } else {
      setSubjects([]);
    }
  }, [formData.classId]);

  const openAddModal = () => {
    setEditingHomework(null);
    setFormData({
      classId: classes[0]?.id || "",
      subjectId: "",
      title: "",
      description: "",
      dueDate: new Date().toISOString().slice(0, 10),
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (hw: HomeworkRecord) => {
    setEditingHomework(hw);
    setFormData({
      classId: hw.classId,
      subjectId: hw.subjectId,
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate.substring(0, 10),
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this homework?")) return;
    deleteHomework(id)
      .then(() => {
        setHomeworkList((prev) => prev.filter((h) => h.id !== id));
      })
      .catch(() => alert("Failed to delete homework"));
  };

  const handleSave = () => {
    setError(null);
    if (!formData.classId || !formData.subjectId || !formData.title || !formData.description || !formData.dueDate) {
      setError("Please fill out all required fields.");
      return;
    }

    const payload = {
      ...formData,
      teacherId: user?.id || "",
    };

    if (editingHomework) {
      updateHomework(editingHomework.id, payload)
        .then(() => {
          setShowModal(false);
          loadHomework();
        })
        .catch(() => setError("Failed to update homework assignment."));
    } else {
      createHomework(payload)
        .then(() => {
          setShowModal(false);
          loadHomework();
        })
        .catch(() => setError("Failed to create homework assignment."));
    }
  };

  const getDaysLeft = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diff = due.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDaysBadge = (dueDateStr: string) => {
    const days = getDaysLeft(dueDateStr);
    if (days < 0) return <Badge variant="destructive">Overdue ({Math.abs(days)}d ago)</Badge>;
    if (days === 0) return <Badge variant="warning">Due Today</Badge>;
    if (days === 1) return <Badge variant="warning">Due Tomorrow</Badge>;
    return <Badge variant="success">{days} Days Left</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary animate-pulse-glow" />
            Homework Assignments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {user?.role === "student"
              ? "View and complete your homework assignments"
              : "Create and manage homework assignments for your classes"}
          </p>
        </div>
        {user?.role === "teacher" && (
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-2" /> Assign Homework
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground">Loading homework list...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homeworkList.map((hw) => (
            <Card key={hw.id} className="hover-lift flex flex-col justify-between group overflow-hidden border border-border/80">
              <CardHeader className="pb-3 text-left">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge className="bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 uppercase font-semibold text-[9px] tracking-wider py-0.5 px-2">
                    {hw.subjectName}
                  </Badge>
                  {getDaysBadge(hw.dueDate)}
                </div>
                <CardTitle className="text-base font-bold group-hover:text-primary transition-colors mt-1">
                  {hw.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 pb-5 text-left flex-1 flex flex-col justify-between">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-4">
                  {hw.description}
                </p>

                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                    <User className="h-3.5 w-3.5 text-primary/70" />
                    <span>{hw.teacherName || "Teacher"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                    <Calendar className="h-3.5 w-3.5 text-primary/70" />
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              </CardContent>

              {/* Action Buttons for Teacher */}
              {user?.role === "teacher" && (
                <div className="bg-muted/30 border-t border-border/40 p-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(hw)} className="h-8 px-2 text-primary hover:bg-primary/10">
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(hw.id)} className="h-8 px-2 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {homeworkList.length === 0 && (
            <div className="col-span-full text-center py-16 bg-muted/10 rounded-2xl border border-dashed border-border/70">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No homework assignments found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Enjoy your free time!</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingHomework ? "Edit Assignment" : "Assign Homework"}</h3>
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
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="" disabled>Select Class</option>
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
                  <option value="" disabled>Select Subject</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>

              {/* Homework Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Title</label>
                <Input
                  placeholder="e.g. Solve exercises 3.1 & 3.2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Instructions / Description</label>
                <textarea
                  placeholder="Write clear instructions for students..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary outline-none resize-y"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
