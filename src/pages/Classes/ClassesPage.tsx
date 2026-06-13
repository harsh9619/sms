import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { Input } from "../../components/ui/Input";
import { fetchClasses, fetchTeachers, createClass, updateClass, deleteClass } from "../../lib/api";
import { BookOpen, Users, User, Plus, UserPlus, Edit, Trash2, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useSchool } from "../../context/SchoolContext";
import { useAuth } from "../../context/AuthContext";

export function ClassesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSchool } = useSchool();

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "??";

  const colors = [
    "from-blue-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-purple-500 to-violet-600",
    "from-amber-500 to-orange-600",
    "from-rose-500 to-pink-600",
  ];

  const [classes, setClasses] = React.useState<any[]>([]);
  const [teachers, setTeachers] = React.useState<any[]>([]);
  const [showModal, setShowModal] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    section: "",
    teacherId: "",
    subjects: "",
  });
  const [error, setError] = React.useState<string | null>(null);

  const loadClasses = React.useCallback(() => {
    fetchClasses().then((d) => setClasses(d)).catch(() => {});
  }, []);

  React.useEffect(() => {
    loadClasses();
    fetchTeachers().then((t) => setTeachers(t)).catch(() => {});
  }, [activeSchool, loadClasses]);

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      name: "",
      section: "",
      teacherId: "",
      subjects: "",
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      section: cls.section,
      teacherId: cls.teacherId || "",
      subjects: Array.isArray(cls.subjects) ? cls.subjects.join(", ") : "",
    });
    setError(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this class? This will also remove all subjects, timetables, and homework schedules associated with it.")) return;
    deleteClass(id)
      .then(() => {
        setClasses((prev) => prev.filter((c) => c.id !== id));
      })
      .catch(() => alert("Failed to delete class."));
  };

  const handleSave = () => {
    setError(null);
    if (!formData.name || !formData.section) {
      setError("Please enter class name and section.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      section: formData.section.trim(),
      teacherId: formData.teacherId || null,
      subjects: formData.subjects
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    if (editingClass) {
      updateClass(editingClass.id, payload)
        .then(() => {
          setShowModal(false);
          loadClasses();
        })
        .catch((err: any) => setError(err.message || "Failed to update class."));
    } else {
      createClass(payload)
        .then(() => {
          setShowModal(false);
          loadClasses();
        })
        .catch((err: any) => setError(err.message || "Failed to create class."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" />
            Classes Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{classes.length} classes</p>
        </div>
        {user?.role === "admin" && (
          <div className="flex gap-2">
            <Button onClick={() => navigate("/classes/assign")} variant="outline" className="shadow-sm">
              <UserPlus className="h-4 w-4 mr-2" /> Assign Class Teacher
            </Button>
            <Button onClick={openAddModal} className="shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4 mr-2" /> Add Class
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls, i) => (
          <Card key={cls.id} className="hover-lift overflow-hidden group">
            {/* Color Header */}
            <div className={`h-24 bg-gradient-to-br ${colors[i % colors.length]} relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card" />
              <div className="relative z-10 p-4 flex justify-between items-start">
                <h2 className="text-2xl font-bold text-white">
                  Class {cls.name}-{cls.section}
                </h2>
                {user?.role === "admin" && (
                  <div className="flex gap-1.5 bg-black/20 backdrop-blur-md p-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openEditModal(cls)}
                      className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                      title="Edit Class"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id)}
                      className="p-1 text-red-200 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
                      title="Delete Class"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="pt-4">
              {/* Class Teacher */}
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
                <Avatar size="sm">
                  <AvatarFallback>{getInitials(cls.teacherName)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Class Teacher</p>
                  <p className="text-sm font-medium">{cls.teacherName || "Unassigned"}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <Users className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{cls.studentCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Students</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 text-center">
                  <BookOpen className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{cls.subjects?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Subjects</p>
                </div>
              </div>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1.5">
                {cls.subjects && Array.isArray(cls.subjects) && cls.subjects.map((sub: string) => (
                  <Badge key={sub} variant="secondary" className="text-[10px]">
                    {sub}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base">{editingClass ? "Edit Class" : "Create Class"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-left">
              {error && <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">{error}</div>}

              {/* Class Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class Name *</label>
                <Input
                  placeholder="e.g. 10 or 11"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Section *</label>
                <Input
                  placeholder="e.g. A or B"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                />
              </div>

              {/* Class Teacher */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Class Teacher</label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>
                  ))}
                </select>
              </div>

              {/* Subjects */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Subjects (comma-separated)</label>
                <Input
                  placeholder="e.g. Mathematics, Science, English"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                />
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingClass ? "Save Changes" : "Create Class"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
