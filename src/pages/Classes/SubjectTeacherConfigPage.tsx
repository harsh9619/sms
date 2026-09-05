import React, { useState, useEffect } from "react";
import { useSchool } from "../../context/SchoolContext";
import classService from "../../Services/class.service";
import classSubjectService, { SubjectItem } from "../../Services/classSubject.service";
import httpService from "../../Services/http.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import type { ClassInfo } from "../../types";
import {
  UserCheck,
  BookOpen,
  Search,
  Save,
  CheckCircle2,
  RefreshCw,
  Users,
  AlertCircle,
  GraduationCap
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
}

export function SubjectTeacherConfigPage() {
  const { activeSchool } = useSchool();
  const [classesList, setClassesList] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // subjectId -> teacherId
  const [loading, setLoading] = useState(false);
  const [savingSubjectId, setSavingSubjectId] = useState<string | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load classes
  useEffect(() => {
    classService.getClasses()
      .then(setClassesList)
      .catch(() => setError("Failed to load classes"));
  }, [activeSchool]);

  // Load teachers list
  useEffect(() => {
    httpService.get<Teacher[]>("/api/teachers")
      .then(setTeachers)
      .catch(() => {
        setTeachers([
          { id: "1", name: "Priya Sharma", email: "teacher@school.com", subject: "Mathematics" },
          { id: "2", name: "Amit Patel", email: "amit@school.com", subject: "Physics" },
          { id: "3", name: "Vikram Malhotra", email: "teacher3@school.com", subject: "Chemistry" },
        ]);
      });
  }, []);

  // Fetch subjects with teacher details when class selection changes
  useEffect(() => {
    setLoading(true);
    classSubjectService.getSubjectsWithTeachers(selectedClassId || undefined)
      .then((data) => {
        setSubjects(data);
        const map: Record<string, string> = {};
        data.forEach((s) => {
          if (s.teacherId) {
            map[s.id] = s.teacherId;
          }
        });
        setAssignments(map);
      })
      .catch(() => setError("Failed to load subject-teacher assignments"))
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  const handleTeacherChange = (subjectId: string, teacherId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [subjectId]: teacherId,
    }));
  };

  const handleSingleSave = async (subjectId: string) => {
    const teacherId = assignments[subjectId] || null;
    setSavingSubjectId(subjectId);
    setError(null);
    try {
      await classSubjectService.assignSubjectTeacher(subjectId, teacherId);
      setSuccessMsg("Teacher assigned successfully!");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update teacher assignment");
    } finally {
      setSavingSubjectId(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    setError(null);
    try {
      for (const sub of subjects) {
        const teacherId = assignments[sub.id] || null;
        await classSubjectService.assignSubjectTeacher(sub.id, teacherId);
      }
      setSuccessMsg("All teacher assignments saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save all assignments");
    } finally {
      setSavingAll(false);
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.teacherName && s.teacherName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const unassignedCount = subjects.length - assignedCount;

  return (
    <div className="p-6 mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject-Teacher Configuration</h1>
            <p className="text-xs text-muted-foreground">Assign and manage faculty teachers for class subjects</p>
          </div>
        </div>

        {/* Global Save Button */}
        {subjects.length > 0 && (
          <Button
            onClick={handleSaveAll}
            disabled={savingAll}
            className="w-full sm:w-auto font-semibold gap-2 shadow-lg hover:shadow-primary/25 transition-all"
          >
            {savingAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Saving All...
              </>
            ) : successMsg ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {successMsg}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save All Assignments
              </>
            )}
          </Button>
        )}
      </div>

      {/* Filter & Stats Bar */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* Filter by Class */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Filter by Target Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
              >
                <option value="">All Classes</option>
                {classesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.name}-{c.section || "A"}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Stats */}
            <div className="md:col-span-3 grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Subjects</p>
                <p className="text-2xl font-black text-foreground mt-0.5">{subjects.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Assigned Faculty</p>
                <p className="text-2xl font-black text-emerald-500 mt-0.5">{assignedCount}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Unassigned</p>
                <p className="text-2xl font-black text-amber-500 mt-0.5">{unassignedCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Subjects & Teachers Table */}
      <Card className="border-border/60 shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Faculty Allocations
            </CardTitle>
            <CardDescription>Assign or change subject teacher per class</CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search subject or teacher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-4 w-4 text-muted-foreground" />}
              className="h-9 text-xs font-medium"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-semibold">Loading faculty assignments...</span>
              </div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-bold">No subjects found</p>
              <p className="text-xs text-muted-foreground">Try assigning subjects to classes in Class-Subject Config first</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3.5">Subject Name</th>
                    <th className="px-6 py-3.5">Code</th>
                    <th className="px-6 py-3.5">Class</th>
                    <th className="px-6 py-3.5">Assigned Faculty / Teacher</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filteredSubjects.map((s) => {
                    const currentTeacherId = assignments[s.id] || "";
                    const isSaving = savingSubjectId === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-foreground">
                          {s.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-muted text-foreground">
                            {s.code || `SUB-${s.id}`}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-bold text-xs">
                            {s.className ? `Class ${s.className}-${s.classSection || 'A'}` : "General"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[240px]">
                            <select
                              value={currentTeacherId}
                              onChange={(e) => handleTeacherChange(s.id, e.target.value)}
                              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm"
                            >
                              <option value="">-- Unassigned --</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name} {t.subject ? `(${t.subject})` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleSingleSave(s.id)}
                            disabled={isSaving}
                            className="text-xs font-semibold gap-1.5 shadow-sm"
                          >
                            {isSaving ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Save className="h-3.5 w-3.5" />
                            )}
                            Save
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
export default SubjectTeacherConfigPage;
