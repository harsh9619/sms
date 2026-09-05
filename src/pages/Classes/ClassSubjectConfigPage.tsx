import React, { useState, useEffect, useMemo } from "react";
import { useSchool } from "../../context/SchoolContext";
import classService from "../../Services/class.service";
import classSubjectService, { SubjectMaster, SubjectItem } from "../../Services/classSubject.service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import type { ClassInfo } from "../../types";
import {
  BookOpen,
  CheckSquare,
  Square,
  Search,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  GraduationCap,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Check,
  Edit3,
  Filter,
  Eye,
  SlidersHorizontal,
  Table as TableIcon,
  Grid,
  ChevronRight,
  BookMarked
} from "lucide-react";

interface ClassMasterItem {
  id: string;
  name: string;
  gradeLevel?: number;
  description?: string;
}

interface GroupedClassItem {
  className: string;
  classIds: string[];
  classes: ClassInfo[];
  divisionNames: string[];
  divisionCount: number;
  assignedSubjects: SubjectItem[];
}

const AVAILABLE_DIVISIONS = ["A", "B", "C", "D", "E"];

const CATEGORY_COLORS: Record<string, string> = {
  science: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  language: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  arts: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  commerce: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  vocational: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  mathematics: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
};

export function ClassSubjectConfigPage() {
  const { activeSchool } = useSchool();
  const [classesList, setClassesList] = useState<ClassInfo[]>([]);
  const [classMasters, setClassMasters] = useState<ClassMasterItem[]>([]);
  const [masterSubjects, setMasterSubjects] = useState<SubjectMaster[]>([]);
  const [allAssignedSubjects, setAllAssignedSubjects] = useState<SubjectItem[]>([]);

  // UI Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table Search & Filter States
  const [tableSearch, setTableSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  // --- EDIT MODAL STATE (Configuring subjects for a grouped class) ---
  const [editingGroup, setEditingGroup] = useState<GroupedClassItem | null>(null);
  const [editingSubjectMasterIds, setEditingSubjectMasterIds] = useState<string[]>([]);
  const [editingSearch, setEditingSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<string>("all");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // --- BATCH ADD CLASS MODAL STATE ---
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedGradeNames, setSelectedGradeNames] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(["A"]);
  const [customGradeInput, setCustomGradeInput] = useState<string>("");
  const [customSectionInput, setCustomSectionInput] = useState<string>("");
  const [creatingClass, setCreatingClass] = useState(false);

  // --- DELETE CLASS MODAL STATE ---
  const [deletingGroup, setDeletingGroup] = useState<GroupedClassItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all initial data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [classes, masters, subjects, assigned] = await Promise.all([
        classService.getClasses(),
        classService.getClassMasters().catch(() => [
          { id: "1", name: "LKG", gradeLevel: -2 },
          { id: "2", name: "UKG", gradeLevel: -1 },
          { id: "3", name: "1", gradeLevel: 1 },
          { id: "4", name: "2", gradeLevel: 2 },
          { id: "5", name: "3", gradeLevel: 3 },
          { id: "6", name: "4", gradeLevel: 4 },
          { id: "7", name: "5", gradeLevel: 5 },
          { id: "8", name: "6", gradeLevel: 6 },
          { id: "9", name: "7", gradeLevel: 7 },
          { id: "10", name: "8", gradeLevel: 8 },
          { id: "11", name: "9", gradeLevel: 9 },
          { id: "12", name: "10", gradeLevel: 10 },
          { id: "13", name: "11", gradeLevel: 11 },
          { id: "14", name: "12", gradeLevel: 12 },
        ]),
        classSubjectService.getSubjectMasters().catch(() => []),
        classSubjectService.getSubjects().catch(() => []),
      ]);

      setClassesList(classes);
      setClassMasters(masters);
      setMasterSubjects(subjects);
      setAllAssignedSubjects(assigned);
    } catch (err: any) {
      setError(err.message || "Failed to load class & subject configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSchool]);

  // Open Edit Modal for a grouped class row
  const handleOpenEditGroupModal = (group: GroupedClassItem) => {
    setEditingGroup(group);
    setEditingSearch("");
    setEditingCategory("all");
    setSaveSuccess(false);

    // Extract assigned subject master IDs from the group's assignedSubjects
    const masterIds = group.assignedSubjects
      .map((s) => s.subjectMasterId)
      .filter((id): id is string => Boolean(id));

    setEditingSubjectMasterIds(masterIds);
  };

  // Toggle subject inside edit modal
  const toggleSubjectMaster = (masterId: string) => {
    setEditingSubjectMasterIds((prev) =>
      prev.includes(masterId) ? prev.filter((id) => id !== masterId) : [...prev, masterId]
    );
  };

  // Select all visible in edit modal
  const handleSelectAllVisible = (visibleMasters: SubjectMaster[]) => {
    const visibleIds = visibleMasters.map((m) => m.id);
    setEditingSubjectMasterIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Clear all visible in edit modal
  const handleClearAllVisible = (visibleMasters: SubjectMaster[]) => {
    const visibleSet = new Set(visibleMasters.map((m) => m.id));
    setEditingSubjectMasterIds((prev) => prev.filter((id) => !visibleSet.has(id)));
  };

  // Save subject configuration for all divisions of editingGroup
  const handleSaveClassSubjects = async () => {
    if (!editingGroup) return;
    setSaving(true);
    setError(null);
    try {
      const masterSubjectNumbers = editingSubjectMasterIds.map((id) => Number(id));
      await Promise.all(
        editingGroup.classIds.map((classId) =>
          classSubjectService.syncClassSubjects(classId, masterSubjectNumbers)
        )
      );
      setSaveSuccess(true);
      setTimeout(async () => {
        setSaveSuccess(false);
        setEditingGroup(null);
        await loadData();
      }, 600);
    } catch (err: any) {
      setError(err.message || "Failed to save class subject configuration");
    } finally {
      setSaving(false);
    }
  };

  // Multi-Grade toggle
  const toggleGradeName = (name: string) => {
    setSelectedGradeNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Division toggle
  const toggleDivision = (div: string) => {
    setSelectedDivisions((prev) =>
      prev.includes(div) ? prev.filter((d) => d !== div) : [...prev, div]
    );
  };

  // Create Classes Batch Handler
  const handleCreateClassesBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    const gradesToCreate = [...selectedGradeNames];
    if (customGradeInput.trim()) {
      const extra = customGradeInput.split(",").map((s) => s.trim()).filter(Boolean);
      gradesToCreate.push(...extra);
    }
    const uniqueGrades = Array.from(new Set(gradesToCreate));
    if (uniqueGrades.length === 0) {
      setError("Please select or enter at least one grade.");
      return;
    }

    const divList = [...selectedDivisions];
    if (customSectionInput.trim()) {
      const extraDiv = customSectionInput.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
      divList.push(...extraDiv);
    }
    const uniqueDivisions = Array.from(new Set(divList));
    if (uniqueDivisions.length === 0) {
      setError("Please select at least one division (e.g. A, B, C, D, E).");
      return;
    }

    setCreatingClass(true);
    setError(null);

    const batchPayload: { name: string; section: string }[] = [];
    for (const gradeName of uniqueGrades) {
      for (const sec of uniqueDivisions) {
        batchPayload.push({ name: gradeName, section: sec });
      }
    }

    try {
      await classService.createClassesBatch(batchPayload);
      setShowAddClassModal(false);
      setSelectedGradeNames([]);
      setSelectedDivisions(["A"]);
      setCustomGradeInput("");
      setCustomSectionInput("");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create classes");
    } finally {
      setCreatingClass(false);
    }
  };

  // Delete Grouped Class Handler
  const handleDeleteGroupedClass = async () => {
    if (!deletingGroup) return;
    setDeleting(true);
    try {
      await Promise.all(deletingGroup.classIds.map((id) => classService.deleteClass(id)));
      setDeletingGroup(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to remove class");
    } finally {
      setDeleting(false);
    }
  };

  // Map of ClassId -> SubjectItem[]
  const classSubjectMapping = useMemo(() => {
    const map = new Map<string, SubjectItem[]>();
    allAssignedSubjects.forEach((sub) => {
      if (sub.classId) {
        const key = String(sub.classId);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(sub);
      }
    });
    return map;
  }, [allAssignedSubjects]);

  // Unique active divisions list across all classes
  const activeDivisionsList = useMemo(() => {
    return Array.from(new Set(classesList.map((c) => (c.section || "A").toUpperCase()))).sort();
  }, [classesList]);

  // Group classes by class name so that ONE ROW per class is rendered
  const groupedClasses = useMemo(() => {
    // Group filtered classes by class name
    const groupsMap = new Map<string, ClassInfo[]>();

    classesList.forEach((cls) => {
      const classNameKey = cls.name.trim();
      const fullTitle = `${cls.name} ${cls.section || "A"}`.toLowerCase();
      const matchesSearch =
        tableSearch.trim() === "" ||
        fullTitle.includes(tableSearch.toLowerCase()) ||
        cls.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        (cls.section && cls.section.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchesGrade =
        gradeFilter === "all" || cls.name.toLowerCase() === gradeFilter.toLowerCase();

      if (matchesSearch && matchesGrade) {
        if (!groupsMap.has(classNameKey)) {
          groupsMap.set(classNameKey, []);
        }
        groupsMap.get(classNameKey)!.push(cls);
      }
    });

    const result: GroupedClassItem[] = [];

    groupsMap.forEach((classItems, className) => {
      const classIds = classItems.map((c) => c.id);
      const divisionNames = Array.from(
        new Set(classItems.map((c) => (c.section || "A").toUpperCase()))
      ).sort();

      // Collect unique assigned subjects across all divisions of this class
      const assignedMap = new Map<string, SubjectItem>();
      classIds.forEach((id) => {
        const subs = classSubjectMapping.get(String(id)) || [];
        subs.forEach((s) => {
          const subKey = s.subjectMasterId ? String(s.subjectMasterId) : s.name;
          if (!assignedMap.has(subKey)) {
            assignedMap.set(subKey, s);
          }
        });
      });

      result.push({
        className,
        classIds,
        classes: classItems,
        divisionNames,
        divisionCount: divisionNames.length,
        assignedSubjects: Array.from(assignedMap.values()),
      });
    });

    return result;
  }, [classesList, tableSearch, gradeFilter, classSubjectMapping]);

  // Subject categories available in master library
  const subjectCategories = useMemo(() => {
    return ["all", ...Array.from(new Set(masterSubjects.map((m) => m.category).filter(Boolean)))];
  }, [masterSubjects]);

  // Master subjects filtered for modal
  const filteredModalMasters = useMemo(() => {
    return masterSubjects.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(editingSearch.toLowerCase()) ||
        (m.code && m.code.toLowerCase().includes(editingSearch.toLowerCase()));
      const matchesCat =
        editingCategory === "all" || (m.category && m.category.toLowerCase() === editingCategory.toLowerCase());
      return matchesSearch && matchesCat;
    });
  }, [masterSubjects, editingSearch, editingCategory]);

  // Calculations for Add Modal
  const customGradesCount = customGradeInput.split(",").map((s) => s.trim()).filter(Boolean).length;
  const totalGradesCount = Array.from(new Set([...selectedGradeNames, ...Array(customGradesCount).fill("custom")])).length;
  const customDivsCount = customSectionInput.split(",").map((s) => s.trim()).filter(Boolean).length;
  const totalDivisionsCount = Array.from(new Set([...selectedDivisions, ...Array(customDivsCount).fill("custom")])).length;
  const totalClassesToCreate = totalGradesCount * totalDivisionsCount;

  return (
    <div className="p-6 mx-auto space-y-6 animate-fade-in">
      {/* Top Action & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <TableIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Class Subject Configuration</h1>
            <p className="text-xs text-muted-foreground">
              Tabular matrix showing one row per class with division names & curriculum subjects
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => loadData()}
            variant="outline"
            size="sm"
            className="font-semibold gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={() => setShowAddClassModal(true)}
            className="font-semibold gap-2 shadow-md hover:shadow-primary/20 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Multi-Grades & Divisions
          </Button>
        </div>
      </div>

      {/* Alert Banner for errors */}
      {error && (
        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Class Grades</p>
              <p className="text-2xl font-black text-foreground mt-1">{groupedClasses.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Divisions</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-black text-primary">{activeDivisionsList.length}</p>
                <span className="text-xs font-bold text-muted-foreground">
                  ({activeDivisionsList.join(", ") || "None"})
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Master Subjects</p>
              <p className="text-2xl font-black text-emerald-500 mt-1">{masterSubjects.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Mappings</p>
              <p className="text-2xl font-black text-indigo-500 mt-1">{allAssignedSubjects.length}</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <BookMarked className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabular View Card (ONE ROW PER CLASS) */}
      <Card className="border-border/60 shadow-lg overflow-hidden">
        <CardHeader className="p-6 border-b border-border/40 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-primary" /> Class & Division Matrix (One Row per Class)
              </CardTitle>
              <CardDescription>
                Each row represents one class, displaying all its division names & total division count alongside assigned curriculum subjects.
              </CardDescription>
            </div>

            {/* Table Search & Grade Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Grade Filter Pill Dropdown */}
              <div className="relative">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="h-9 px-3 py-1 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
                >
                  <option value="all">All Grade Levels</option>
                  {Array.from(new Set(classesList.map((c) => c.name))).map((grade) => (
                    <option key={grade} value={grade}>
                      Grade: {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Input
                  placeholder="Search class or subject..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  className="h-9 text-xs font-medium"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Tabular Table Content (1 Row per Class) */}
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm font-semibold">Loading class subject configuration matrix...</span>
              </div>
            </div>
          ) : groupedClasses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground space-y-3">
              <BookOpen className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-base font-bold">No classes found</p>
              <p className="text-xs text-muted-foreground">
                {tableSearch || gradeFilter !== "all"
                  ? "Try clearing your filters or search term."
                  : "Click 'Add Multi-Grades & Divisions' above to create class sections."}
              </p>
              <Button onClick={() => setShowAddClassModal(true)} size="sm" className="font-bold gap-2 mt-2">
                <Plus className="h-4 w-4" /> Add Classes Now
              </Button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">S. No.</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Class</th>
                  <th className="py-3.5 px-4 min-w-[220px]">Divisions Count</th>
                  <th className="py-3.5 px-4 min-w-[300px]">Assigned Subjects</th>
                  <th className="py-3.5 px-4 w-34 text-center">Total Subjects </th>
                  <th className="py-3.5 px-4 w-40 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {groupedClasses.map((item, idx) => {
                  const count = item.assignedSubjects.length;

                  return (
                    <tr
                      key={item.className}
                      className="hover:bg-muted/20 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="py-4 px-4 text-center font-mono text-xs text-muted-foreground font-semibold">
                        {idx + 1}
                      </td>

                      {/* Class Name Column */}
                      <td className="py-4 px-4">
                        <span className="text-sm font-bold ">
                          {item.className}
                        </span>
                      </td>

                      {/* Division Names & Count Column */}
                      <td className="py-4 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {item.divisionNames.map((div) => (
                              <span
                                key={div}
                                className="px-2.5 py-0.5 rounded-md text-xs font-black bg-primary/10 text-primary border border-primary/20 shadow-2xs"
                              >
                                {div}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Assigned Curriculum Subjects (Badges Grid) */}
                      <td className="py-4 px-4">
                        {count === 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="h-3 w-3" /> No subjects assigned yet
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-xl">
                            {item.assignedSubjects.map((sub) => {
                              const subName = sub.masterSubjectName || sub.name;
                              return (
                                <span
                                  key={sub.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-muted/80 text-foreground border border-border/60 hover:border-primary/40 transition-colors"
                                >
                                  <BookOpen className="h-3 w-3 text-primary opacity-80" />
                                  <span>{subName}</span>
                                  {sub.code && (
                                    <span className="text-[10px] opacity-60 font-mono">({sub.code})</span>
                                  )}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Total Subjects Count Badge */}
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black ${count > 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                            }`}
                        >
                          {count} {count === 1 ? "Subject" : "Subjects"}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleOpenEditGroupModal(item)}
                            size="sm"
                            variant="outline"
                            className="h-8 px-3 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit Subjects
                          </Button>

                          <button
                            onClick={() => setDeletingGroup(item)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* --- EDIT / CONFIGURE SUBJECTS MODAL FOR GROUPED CLASS --- */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-3xl border-border/80 shadow-2xl bg-card max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    Configure Subjects:{" "}
                    <span className="text-primary font-black">
                      {editingGroup.className}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground font-semibold">
                      (Applies to Divisions: {editingGroup.divisionNames.join(", ")})
                    </span>
                  </CardTitle>
                  <CardDescription>
                    Select curriculum subjects to assign to all divisions of this class section and click Save.
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => setEditingGroup(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            {/* Filter Bar Inside Modal */}
            <div className="p-4 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {subjectCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEditingCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${editingCategory === cat
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Action: Select All / Clear All visible */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllVisible(filteredModalMasters)}
                  className="h-8 text-xs font-bold"
                >
                  <CheckSquare className="h-3.5 w-3.5 mr-1 text-primary" /> Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearAllVisible(filteredModalMasters)}
                  className="h-8 text-xs font-bold"
                >
                  <Square className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Clear
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-6 pt-3">
              <Input
                placeholder="Search subject by name or code..."
                value={editingSearch}
                onChange={(e) => setEditingSearch(e.target.value)}
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                className="h-9 text-xs"
              />
            </div>

            {/* Subjects Selection Cards Grid */}
            <CardContent className="p-6 overflow-y-auto flex-1 max-h-[50vh]">
              {filteredModalMasters.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-bold">No master subjects found</p>
                  <p className="text-xs">Adjust your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {filteredModalMasters.map((m) => {
                    const isChecked = editingSubjectMasterIds.includes(m.id);
                    const catClass = m.category
                      ? CATEGORY_COLORS[m.category.toLowerCase()] || "bg-muted text-muted-foreground"
                      : "bg-muted text-muted-foreground";

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSubjectMaster(m.id)}
                        className={`flex flex-col text-left p-3.5 rounded-xl border-2 transition-all ${isChecked
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border/60 bg-card hover:border-muted-foreground/40"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-muted text-foreground">
                            {m.code || `SUB-${m.id}`}
                          </span>

                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${isChecked
                              ? "bg-primary text-primary-foreground shadow-sm scale-110"
                              : "border border-border bg-background"
                              }`}
                          >
                            {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                        </div>

                        <h4 className="font-bold text-xs text-foreground line-clamp-1">{m.name}</h4>

                        {m.category && (
                          <div className="mt-2">
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border capitalize ${catClass}`}>
                              {m.category}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>

            {/* Modal Footer with Save Button */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
              <div className="text-xs font-bold text-muted-foreground">
                Selected:{" "}
                <span className="text-primary font-black text-sm">{editingSubjectMasterIds.length} Subjects</span>
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingGroup(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveClassSubjects}
                  disabled={saving}
                  className="font-bold gap-2 shadow-lg min-w-[140px]"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save Subjects
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* --- BATCH MULTI-GRADE & MULTI-DIVISION ADD CLASS MODAL --- */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-xl border-border/80 shadow-2xl bg-card max-h-[90vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> Batch Create Classes & Divisions
                </CardTitle>
                <CardDescription>Select multiple grade levels & divisions (up to 5) to generate class sections at once</CardDescription>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreateClassesBatch} className="flex-1 overflow-y-auto">
              <CardContent className="p-6 space-y-6">
                {/* 1. Select Grade Levels */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      1. Select Grade Levels ({selectedGradeNames.length} selected)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGradeNames(classMasters.map((cm) => cm.name))}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedGradeNames([])}
                        className="text-xs text-muted-foreground font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Grade Cards Checkbox Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-52 overflow-y-auto p-1.5 border rounded-xl border-border/50 bg-muted/20">
                    {classMasters.map((cm) => {
                      const isChecked = selectedGradeNames.includes(cm.name);
                      return (
                        <button
                          key={cm.id}
                          type="button"
                          onClick={() => toggleGradeName(cm.name)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all ${isChecked
                            ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                            : "border-border/60 bg-background text-foreground hover:border-muted-foreground/40"
                            }`}
                        >
                          <span className="truncate">{cm.name}</span>
                          <div
                            className={`h-4 w-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? "bg-primary text-primary-foreground" : "border border-border"
                              }`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Grade Input fallback */}
                  <Input
                    placeholder="Custom grades (optional, e.g. Nursery, Pre-K)"
                    value={customGradeInput}
                    onChange={(e) => setCustomGradeInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                {/* 2. Select Divisions (Up to 5: A, B, C, D, E) */}
                <div className="space-y-2.5 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      2. Select Divisions / Sections (Up to 5)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDivisions([...AVAILABLE_DIVISIONS])}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Select All 5
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedDivisions([])}
                        className="text-xs text-muted-foreground font-semibold hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Division Pills (A, B, C, D, E) */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {AVAILABLE_DIVISIONS.map((div) => {
                      const isSelected = selectedDivisions.includes(div);
                      return (
                        <button
                          key={div}
                          type="button"
                          onClick={() => toggleDivision(div)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-bold ${isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-md scale-105"
                            : "border-border/60 bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                            }`}
                        >
                          <span className="text-xs text-muted-foreground font-normal">Division</span>
                          <span className="text-lg font-black">{div}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Additional Custom Division Input */}
                  <Input
                    placeholder="Additional custom sections (optional, e.g. F, G)"
                    value={customSectionInput}
                    onChange={(e) => setCustomSectionInput(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </CardContent>

              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/20">
                <div className="text-xs font-bold text-muted-foreground">
                  Will create:{" "}
                  <span className="text-primary font-black text-sm">
                    {totalClassesToCreate > 0 ? totalClassesToCreate : 0} Class Sections
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddClassModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creatingClass || totalClassesToCreate === 0}
                    className="font-bold gap-2 shadow-lg"
                  >
                    {creatingClass ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Batch Create ({totalClassesToCreate})
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* --- DELETE CLASS CONFIRMATION MODAL --- */}
      {deletingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md border-destructive/30 shadow-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Remove Class</CardTitle>
              </div>
              <button
                onClick={() => setDeletingGroup(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <p className="text-sm font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  {deletingGroup.className} (Divisions: {deletingGroup.divisionNames.join(", ")})
                </span>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                This will remove all class divisions and assigned subject mappings from the database.
              </p>
            </CardContent>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40 bg-muted/20">
              <Button type="button" variant="outline" onClick={() => setDeletingGroup(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={handleDeleteGroupedClass}
                className="font-bold gap-2"
              >
                {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ClassSubjectConfigPage;
