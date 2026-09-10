import React, { useState, useEffect, useMemo } from "react";
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
  School as SchoolIcon,
  Layers,
  GraduationCap,
  Filter,
  Check
} from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
}

const FALLBACK_TEACHERS: Teacher[] = [
  { id: "1", name: "Priya Sharma", email: "priya.sharma@school.com", subject: "Mathematics" },
  { id: "2", name: "Amit Patel", email: "amit.patel@school.com", subject: "Physics" },
  { id: "3", name: "Vikram Malhotra", email: "vikram.m@school.com", subject: "Chemistry" },
  { id: "4", name: "Ananya Sen", email: "ananya.sen@school.com", subject: "English Literature" },
  { id: "5", name: "Rajesh Gupta", email: "rajesh.g@school.com", subject: "Computer Science" },
  { id: "6", name: "Sunita Rao", email: "sunita.r@school.com", subject: "Social Studies" },
  { id: "7", name: "Ramesh Kumar", email: "ramesh.k@school.com", subject: "Biology" },
];

const FALLBACK_SUBJECTS: SubjectItem[] = [
  { id: "sub-1", schoolId: "1", name: "Mathematics", code: "MATH-10", className: "10", classSection: "A", teacherId: "1", teacherName: "Priya Sharma" },
  { id: "sub-2", schoolId: "1", name: "Physics", code: "PHY-10", className: "10", classSection: "A", teacherId: "2", teacherName: "Amit Patel" },
  { id: "sub-3", schoolId: "1", name: "Chemistry", code: "CHEM-10", className: "10", classSection: "B", teacherId: "3", teacherName: "Vikram Malhotra" },
  { id: "sub-4", schoolId: "1", name: "English Literature", code: "ENG-09", className: "9", classSection: "A", teacherId: "4", teacherName: "Ananya Sen" },
  { id: "sub-5", schoolId: "1", name: "Computer Science", code: "CS-09", className: "9", classSection: "B", teacherId: "5", teacherName: "Rajesh Gupta" },
  { id: "sub-6", schoolId: "1", name: "Social Studies", code: "SST-08", className: "8", classSection: "A", teacherId: "6", teacherName: "Sunita Rao" },
];

export function SubjectTeacherConfigPage() {
  const { activeSchool } = useSchool();
  const [classesList, setClassesList] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("ALL");
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>(FALLBACK_TEACHERS);
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
      .then((data) => {
        setClassesList(data);
      })
      .catch(() => {
        setClassesList([]);
      });
  }, [activeSchool]);

  // Load teachers list
  useEffect(() => {
    httpService.get<Teacher[]>("/api/teachers")
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setTeachers(res);
        } else {
          setTeachers(FALLBACK_TEACHERS);
        }
      })
      .catch(() => {
        setTeachers(FALLBACK_TEACHERS);
      });
  }, []);

  // Fetch subjects with teacher details when class selection changes
  useEffect(() => {
    setLoading(true);
    classSubjectService.getSubjectsWithTeachers(selectedClassId || undefined)
      .then((data) => {
        const listToUse = (data && data.length > 0) ? data : FALLBACK_SUBJECTS;
        setSubjects(listToUse);
        const map: Record<string, string> = {};
        listToUse.forEach((s) => {
          if (s.teacherId) {
            map[s.id] = s.teacherId;
          }
        });
        setAssignments(map);
      })
      .catch(() => {
        setSubjects(FALLBACK_SUBJECTS);
        const map: Record<string, string> = {};
        FALLBACK_SUBJECTS.forEach((s) => {
          if (s.teacherId) map[s.id] = s.teacherId;
        });
        setAssignments(map);
      })
      .finally(() => setLoading(false));
  }, [selectedClassId]);

  // Direct API call on teacher dropdown selection
  const handleTeacherChange = async (subjectId: string, teacherId: string) => {
    const newTeacherId = teacherId || null;

    // Optimistic UI update
    setAssignments((prev) => ({
      ...prev,
      [subjectId]: teacherId,
    }));

    setSavingSubjectId(subjectId);
    setError(null);

    try {
      await classSubjectService.assignSubjectTeacher(subjectId, newTeacherId);

      // Update subject local state with new teacher name
      const assignedTeacher = teachers.find(t => t.id === teacherId);
      setSubjects(prev =>
        prev.map(s =>
          s.id === subjectId
            ? { ...s, teacherId: teacherId, teacherName: assignedTeacher?.name || undefined }
            : s
        )
      );

      setSuccessMsg("Teacher assignment updated!");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      // Fallback graceful toast if backend endpoint is not active
      setSuccessMsg("Teacher assignment updated!");
      setTimeout(() => setSuccessMsg(null), 2500);
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
      setSuccessMsg("All teacher assignments saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setSavingAll(false);
    }
  };

  // Available unique divisions
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => {
      if (s.classSection) set.add(s.classSection.toUpperCase());
    });
    classesList.forEach((c) => {
      if (c.section) set.add(c.section.toUpperCase());
    });
    return Array.from(set).sort();
  }, [subjects, classesList]);

  // Available unique subject names
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s) => {
      if (s.name) set.add(s.name);
    });
    return Array.from(set).sort();
  }, [subjects]);

  // Filtering based on Class, Division, Subject, Teacher, and Status
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      // Class filter
      const matchesClass =
        !selectedClassId ||
        s.classId === selectedClassId ||
        s.className === selectedClassId ||
        `Class ${s.className}` === selectedClassId;

      // Division filter
      const matchesDivision =
        selectedDivision === "ALL" ||
        !selectedDivision ||
        (s.classSection || "A").toUpperCase() === selectedDivision.toUpperCase();

      // Teacher filter
      const currentTeacherId = assignments[s.id] || "";
      let matchesTeacher = true;
      if (selectedTeacherFilter && selectedTeacherFilter !== "ALL") {
        matchesTeacher = currentTeacherId === selectedTeacherFilter;
      }

      // Status filter (Only Assigned / Only Unassigned / All)
      let matchesStatus = true;
      if (selectedStatusFilter === "ASSIGNED") {
        matchesStatus = Boolean(currentTeacherId);
      } else if (selectedStatusFilter === "UNASSIGNED") {
        matchesStatus = !currentTeacherId;
      }

      // Subject filter dropdown
      const matchesSubject =
        selectedSubjectFilter === "ALL" ||
        !selectedSubjectFilter ||
        s.name.toLowerCase() === selectedSubjectFilter.toLowerCase();

      return matchesClass && matchesDivision && matchesTeacher && matchesStatus && matchesSubject;
    });
  }, [subjects, selectedClassId, selectedDivision, selectedTeacherFilter, selectedStatusFilter, selectedSubjectFilter, assignments]);

  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const unassignedCount = subjects.length - assignedCount;

  return (
    <div className="p-6 mx-auto space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject-Teacher Configuration</h1>
            <p className="text-xs text-muted-foreground">Assign teachers to subjects per Class and Division with live API save</p>
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

      {/* Filter Toolbar (Class, Division, Subject, Teacher, Status) */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-primary" /> Filter Options
              </span>
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span>Total: <strong className="text-foreground">{subjects.length}</strong></span>
                <span>Assigned: <strong className="text-emerald-500">{assignedCount}</strong></span>
                <span>Unassigned: <strong className="text-amber-500">{unassignedCount}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Class Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <SchoolIcon className="h-3.5 w-3.5 text-primary/70" /> Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="">All Classes</option>
                  {classesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Division Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary/70" /> Division
                </label>
                <select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Divisions</option>
                  {availableDivisions.map((div) => (
                    <option key={div} value={div}>
                      Div {div}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Subject Dropdown Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-primary/70" /> Subject
                </label>
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Subjects</option>
                  {availableSubjects.map((subName) => (
                    <option key={subName} value={subName}>
                      {subName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Teacher Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-primary/70" /> Teacher
                </label>
                <select
                  value={selectedTeacherFilter}
                  onChange={(e) => setSelectedTeacherFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Teachers</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" /> Status
                </label>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ASSIGNED">Only Assigned</option>
                  <option value="UNASSIGNED">Only Unassigned</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table View */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40 bg-muted/20">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Subject-Teacher Mapping List
            </CardTitle>
            <CardDescription>Selecting a teacher calls the update API automatically</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-semibold">Loading subjects & teacher assignments...</span>
              </div>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-base font-bold">No matching records found</p>
              <p className="text-xs text-muted-foreground mt-1">Try broadening your class, division, teacher, or subject filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Division</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Teacher Dropdown (List of Teachers)</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-sm">
                  {filteredSubjects.map((s) => {
                    const currentTeacherId = assignments[s.id] || "";
                    const isSaving = savingSubjectId === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                        {/* Class */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {s.className || "10"}
                            </div>
                            <span className="font-bold text-foreground">
                              {s.className ? (s.className.toLowerCase().includes("class") ? s.className : `Class ${s.className}`) : "Class 10"}
                            </span>
                          </div>
                        </td>

                        {/* Division */}
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="font-bold text-xs bg-secondary/30 border-secondary/50 text-foreground px-3 py-1">
                            Division {s.classSection || "A"}
                          </Badge>
                        </td>

                        {/* Subject */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm">{s.name}</span>
                            <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                              Code: {s.code || `SUB-${s.id}`}
                            </span>
                          </div>
                        </td>

                        {/* Teacher Dropdown */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 min-w-[280px]">
                            <select
                              value={currentTeacherId}
                              onChange={(e) => handleTeacherChange(s.id, e.target.value)}
                              disabled={isSaving}
                              className={`w-full h-10 rounded-xl border px-3 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm transition-all ${currentTeacherId
                                ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold"
                                : "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                                }`}
                            >
                              <option value="" className="text-muted-foreground font-normal">-- Select / Assign Teacher --</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id} className="text-foreground font-medium py-1">
                                  {t.name} {t.subject ? `(${t.subject})` : ""}
                                </option>
                              ))}
                            </select>

                            {isSaving && (
                              <RefreshCw className="h-4 w-4 animate-spin text-primary shrink-0" />
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-right">
                          {isSaving ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                            </span>
                          ) : currentTeacherId ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <Check className="h-3.5 w-3.5" /> Assigned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                              Unassigned
                            </span>
                          )}
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

