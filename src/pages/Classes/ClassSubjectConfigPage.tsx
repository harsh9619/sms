import React, { useState, useEffect } from "react";
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
  SlidersHorizontal,
  AlertTriangle,
  Award,
  Check
} from "lucide-react";

interface ClassMasterItem {
  id: string;
  name: string;
  gradeLevel?: number;
  description?: string;
}

const AVAILABLE_DIVISIONS = ["A", "B", "C", "D", "E"];

export function ClassSubjectConfigPage() {
  const { activeSchool } = useSchool();
  const [classesList, setClassesList] = useState<ClassInfo[]>([]);
  const [classMasters, setClassMasters] = useState<ClassMasterItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [masterSubjects, setMasterSubjects] = useState<SubjectMaster[]>([]);
  const [assignedSubjectMasterIds, setAssignedSubjectMasterIds] = useState<string[]>([]);
  
  // UI states
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-grade Add Class Modal state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedGradeNames, setSelectedGradeNames] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(["A"]);
  const [customGradeInput, setCustomGradeInput] = useState<string>("");
  const [customSectionInput, setCustomSectionInput] = useState<string>("");
  const [creatingClass, setCreatingClass] = useState(false);

  // Delete Class Modal state
  const [showDeleteClassModal, setShowDeleteClassModal] = useState(false);
  const [deletingClass, setDeletingClass] = useState(false);

  // Fetch classes list
  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const data = await classService.getClasses();
      setClassesList(data);
      if (data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
      }
    } catch (err) {
      setError("Failed to load classes list");
    } finally {
      setLoadingClasses(false);
    }
  };

  // Fetch class masters list
  const loadClassMasters = async () => {
    try {
      const masters = await classService.getClassMasters();
      setClassMasters(masters);
    } catch (err) {
      setClassMasters([
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
      ]);
    }
  };

  useEffect(() => {
    loadClasses();
    loadClassMasters();
  }, [activeSchool]);

  // Load master subjects once
  useEffect(() => {
    classSubjectService.getSubjectMasters()
      .then(setMasterSubjects)
      .catch(() => setError("Failed to load master subjects"));
  }, []);

  // Fetch assigned subjects when selected class changes
  useEffect(() => {
    if (!selectedClassId) {
      setAssignedSubjectMasterIds([]);
      return;
    }
    setLoadingSubjects(true);
    classSubjectService.getSubjects(selectedClassId)
      .then((subjects: SubjectItem[]) => {
        const masterIds = subjects
          .map((s) => s.subjectMasterId)
          .filter((id): id is string => Boolean(id));
        setAssignedSubjectMasterIds(masterIds);
      })
      .catch(() => setError("Failed to load assigned subjects"))
      .finally(() => setLoadingSubjects(false));
  }, [selectedClassId]);

  const toggleSubject = (masterId: string) => {
    setAssignedSubjectMasterIds((prev) =>
      prev.includes(masterId)
        ? prev.filter((id) => id !== masterId)
        : [...prev, masterId]
    );
  };

  const handleSelectAll = () => {
    const visibleIds = filteredMasters.map((m) => m.id);
    setAssignedSubjectMasterIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const handleClearAll = () => {
    const visibleIds = new Set(filteredMasters.map((m) => m.id));
    setAssignedSubjectMasterIds((prev) => prev.filter((id) => !visibleIds.has(id)));
  };

  const handleSave = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    setError(null);
    try {
      await classSubjectService.syncClassSubjects(
        selectedClassId,
        assignedSubjectMasterIds.map((id) => Number(id))
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadClasses();
    } catch (err: any) {
      setError(err.message || "Failed to update class subjects");
    } finally {
      setSaving(false);
    }
  };

  // Toggle multi-grade selection
  const toggleGradeName = (name: string) => {
    setSelectedGradeNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleSelectAllGrades = () => {
    setSelectedGradeNames(classMasters.map((cm) => cm.name));
  };

  const handleClearAllGrades = () => {
    setSelectedGradeNames([]);
  };

  // Toggle multi-division selection
  const toggleDivision = (div: string) => {
    setSelectedDivisions((prev) =>
      prev.includes(div) ? prev.filter((d) => d !== div) : [...prev, div]
    );
  };

  const handleSelectAllDivisions = () => {
    setSelectedDivisions([...AVAILABLE_DIVISIONS]);
  };

  const handleClearDivisions = () => {
    setSelectedDivisions([]);
  };

  // Add Multi-Class Batch Handler
  const handleCreateClassesBatch = async (e: React.FormEvent) => {
    e.preventDefault();

    // Determine target grade names
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

    // Determine divisions
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
      const createdItems = await classService.createClassesBatch(batchPayload);
      setShowAddClassModal(false);
      setSelectedGradeNames([]);
      setSelectedDivisions(["A"]);
      setCustomGradeInput("");
      setCustomSectionInput("");
      await loadClasses();
      if (createdItems && createdItems.length > 0 && createdItems[0].id) {
        setSelectedClassId(createdItems[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to batch create classes");
    } finally {
      setCreatingClass(false);
    }
  };

  // Delete Class Handler
  const handleDeleteClass = async () => {
    if (!selectedClassId) return;
    setDeletingClass(true);
    try {
      await classService.deleteClass(selectedClassId);
      setShowDeleteClassModal(false);
      const remaining = classesList.filter((c) => c.id !== selectedClassId);
      setClassesList(remaining);
      setSelectedClassId(remaining.length > 0 ? remaining[0].id : "");
    } catch (err: any) {
      setError(err.message || "Failed to remove class");
    } finally {
      setDeletingClass(false);
    }
  };

  // Extract categories
  const categories = ["all", ...Array.from(new Set(masterSubjects.map((m) => m.category).filter(Boolean)))];

  const filteredMasters = masterSubjects.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || m.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const selectedClass = classesList.find((c) => c.id === selectedClassId);
  const completionPercentage = masterSubjects.length > 0
    ? Math.round((assignedSubjectMasterIds.length / masterSubjects.length) * 100)
    : 0;

  const categoryBadges: Record<string, string> = {
    science: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    language: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    arts: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    commerce: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    vocational: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };

  // Calculate batch creation count for button badge
  const customGradesCount = customGradeInput.split(",").map((s) => s.trim()).filter(Boolean).length;
  const totalGradesCount = Array.from(new Set([...selectedGradeNames, ...Array(customGradesCount).fill("custom")])).length;
  const customDivsCount = customSectionInput.split(",").map((s) => s.trim()).filter(Boolean).length;
  const totalDivisionsCount = Array.from(new Set([...selectedDivisions, ...Array(customDivsCount).fill("custom")])).length;
  const totalClassesToCreate = totalGradesCount * totalDivisionsCount;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Class-Subject Configuration</h1>
            <p className="text-xs text-muted-foreground">Select multiple grades and divisions (up to 5) from class masters and assign curriculum subjects</p>
          </div>
        </div>

        {/* Global Controls & Add Multi-Class Trigger */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setShowAddClassModal(true)}
            variant="outline"
            className="font-semibold gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary"
          >
            <Plus className="h-4 w-4 text-primary" /> Add Multi-Grades & Divisions
          </Button>

          {selectedClassId && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="font-semibold gap-2 shadow-lg hover:shadow-primary/25 transition-all"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Curriculum
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Class Selector & Header Management Bar */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-md relative overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Class Dropdown & Controls */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Select Active Class
                </label>
                {selectedClassId && (
                  <button
                    onClick={() => setShowDeleteClassModal(true)}
                    className="text-xs text-destructive hover:underline flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Class
                  </button>
                )}
              </div>

              <div className="relative">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm font-bold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer shadow-sm"
                >
                  {classesList.length === 0 ? (
                    <option value="">-- No Classes Available --</option>
                  ) : (
                    classesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        Class {c.name}-{c.section || "A"} {c.studentCount ? `(${c.studentCount} Students)` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Curriculum Progress & Live Stats */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Assigned Subjects</p>
                <p className="text-2xl font-black text-primary mt-0.5">
                  {selectedClassId ? assignedSubjectMasterIds.length : 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Master Library</p>
                <p className="text-2xl font-black text-foreground mt-0.5">{masterSubjects.length}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Completion</p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-primary">{completionPercentage}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 rounded-full"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Configuration Card */}
      {selectedClassId ? (
        <Card className="border-border/60 shadow-lg">
          <CardHeader className="flex flex-col space-y-4 pb-4 border-b border-border/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" /> Curriculum Subjects Setup
                </CardTitle>
                <CardDescription>
                  Toggle subject cards below to assign or unassign subjects for{" "}
                  <span className="font-bold text-foreground">
                    Class {selectedClass?.name}-{selectedClass?.section || "A"}
                  </span>
                </CardDescription>
              </div>

              {/* Select All & Clear Controls */}
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll} className="text-xs font-semibold">
                  <CheckSquare className="h-3.5 w-3.5 mr-1 text-primary" /> Select Visible
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll} className="text-xs font-semibold">
                  <Square className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> Clear Visible
                </Button>
              </div>
            </div>

            {/* Filter Bar: Search + Category Pills */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-64 flex-shrink-0">
                <Input
                  placeholder="Search subject or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="h-4 w-4 text-muted-foreground" />}
                  className="h-9 text-xs font-medium"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {loadingSubjects ? (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm font-semibold">Loading subjects configuration...</span>
                </div>
              </div>
            ) : filteredMasters.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-base font-bold">No subjects found</p>
                <p className="text-xs text-muted-foreground">Try adjusting your category filter or search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMasters.map((m) => {
                  const isAssigned = assignedSubjectMasterIds.includes(m.id);
                  const catClass = m.category ? categoryBadges[m.category.toLowerCase()] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground";

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleSubject(m.id)}
                      className={`relative flex flex-col text-left p-4 rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                        isAssigned
                          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
                          : "border-border/60 bg-card hover:border-muted-foreground/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-muted text-foreground">
                          {m.code || `SUB-${m.id}`}
                        </span>

                        <div
                          className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${
                            isAssigned
                              ? "bg-primary text-primary-foreground shadow-sm scale-110"
                              : "border border-border bg-background"
                          }`}
                        >
                          {isAssigned && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-foreground line-clamp-1">{m.name}</h4>

                      {m.category && (
                        <div className="mt-3">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${catClass}`}>
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
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-border/60 p-16 text-center shadow-none">
          <div className="max-w-md mx-auto space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
              <GraduationCap className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold">No Class Selected</h3>
            <p className="text-xs text-muted-foreground">
              Select an existing class from the dropdown above, or click <strong>Add Multi-Grades & Divisions</strong> to batch create class sections.
            </p>
            <Button onClick={() => setShowAddClassModal(true)} variant="outline" className="font-bold gap-2">
              <Plus className="h-4 w-4 text-primary" /> Add Multi-Grades & Divisions
            </Button>
          </div>
        </Card>
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
                        onClick={handleSelectAllGrades}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Select All
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={handleClearAllGrades}
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
                          className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                            isChecked
                              ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                              : "border-border/60 bg-background text-foreground hover:border-muted-foreground/40"
                          }`}
                        >
                          <span className="truncate">{cm.name}</span>
                          <div
                            className={`h-4 w-4 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                              isChecked ? "bg-primary text-primary-foreground" : "border border-border"
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
                        onClick={handleSelectAllDivisions}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Select All 5
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        type="button"
                        onClick={handleClearDivisions}
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
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all font-bold ${
                            isSelected
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
      {showDeleteClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <Card className="w-full max-w-md border-destructive/30 shadow-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <CardTitle className="text-lg font-bold">Remove Class</CardTitle>
              </div>
              <button
                onClick={() => setShowDeleteClassModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <p className="text-sm font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  Class {selectedClass?.name}-{selectedClass?.section || "A"}
                </span>
                ?
              </p>
              <p className="text-xs text-muted-foreground">
                This will remove the class and its associated subject mappings from the system.
              </p>
            </CardContent>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/40 bg-muted/20">
              <Button type="button" variant="outline" onClick={() => setShowDeleteClassModal(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deletingClass}
                onClick={handleDeleteClass}
                className="font-bold gap-2"
              >
                {deletingClass ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
