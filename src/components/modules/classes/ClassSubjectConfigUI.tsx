import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import {
  BookOpen,
  CheckSquare,
  Square,
  Search,
  Save,
  CheckCircle2,
  RefreshCw,
  Layers,
  GraduationCap,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Check,
  Edit3,
  Table as TableIcon,
  BookMarked,
} from "lucide-react";
import { ClassSubjectConfigUIProps, GroupedClassItem } from "../../../saga/classSubjectConfig/types";
import { SubjectMaster } from "../../../Services/classSubject.service";

const CATEGORY_COLORS: Record<string, string> = {
  science: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
  language: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  arts: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
  commerce: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  vocational: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
  mathematics: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
};

export function ClassSubjectConfigUI(props: ClassSubjectConfigUIProps) {
  const {
    groupedClasses,
    classesList,
    classMasters,
    masterSubjects,
    allAssignedSubjects,
    divMasters,
    activeDivisionsList,
    subjectCategories,
    filteredModalMasters,
    loading,
    error,
    setError,
    tableSearch,
    setTableSearch,
    gradeFilter,
    setGradeFilter,
    editingGroup,
    setEditingGroup,
    editingSubjectMasterIds,
    editingSearch,
    setEditingSearch,
    editingCategory,
    setEditingCategory,
    saving,
    saveSuccess,
    showAddClassModal,
    setShowAddClassModal,
    selectedGradeNames,
    setSelectedGradeNames,
    selectedDivisions,
    setSelectedDivisions,
    customGradeInput,
    setCustomGradeInput,
    customSectionInput,
    setCustomSectionInput,
    selectedNewClassSubjectIds,
    setSelectedNewClassSubjectIds,
    creatingClass,
    deletingGroup,
    setDeletingGroup,
    deleting,
    handleOpenEditGroupModal,
    toggleSubjectMaster,
    handleSelectAllVisible,
    handleClearAllVisible,
    handleSaveClassSubjects,
    toggleGradeName,
    toggleDivision,
    toggleNewClassSubject,
    handleSelectAllNewClassSubjects,
    handleClearAllNewClassSubjects,
    handleCreateClassesBatch,
    handleDeleteGroupedClass,
    handleRefresh,
    totalClassesToCreate,
  } = props;

  // Define table columns using common DataTable ColumnDef
  const columns: ColumnDef<GroupedClassItem>[] = useMemo(
    () => [
      {
        key: "sNo",
        header: "S. No.",
        align: "center",
        width: "60px",
        cell: (_, idx) => (
          <span className="font-mono text-xs text-muted-foreground font-semibold">
            {idx + 1}
          </span>
        ),
      },
      {
        key: "class",
        header: "Class",
        cell: (item) => (
          <span className="text-sm font-bold text-foreground">
            {item.className}
          </span>
        ),
      },
      {
        key: "divisions",
        header: "Divisions Count",
        cell: (item) => (
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
        ),
      },
      {
        key: "assignedSubjects",
        header: "Assigned Subjects",
        cell: (item) => {
          const count = item.assignedSubjects.length;
          if (count === 0) {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <AlertTriangle className="h-3 w-3" /> No subjects assigned yet
              </span>
            );
          }
          return (
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
          );
        },
      },
      {
        key: "totalSubjects",
        header: "Total Subjects",
        align: "center",
        cell: (item) => {
          const count = item.assignedSubjects.length;
          return (
            <span
              className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black ${count > 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              {count} {count === 1 ? "Subject" : "Subjects"}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        align: "center",
        cell: (item) => (
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
        ),
      },
    ],
    [handleOpenEditGroupModal, setDeletingGroup]
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px]">
      {/* Top Action & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
            <TableIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Class Subject Configuration</h1>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Tabular matrix showing one row per class with division names & curriculum subjects
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none font-semibold gap-1.5 h-9 text-xs"
            title="Refresh Data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-primary" : ""}`} /> Refresh
          </Button>

          <Button
            onClick={() => setShowAddClassModal(true)}
            size="sm"
            className="flex-1 sm:flex-none font-semibold gap-2 shadow-md hover:shadow-primary/20 transition-all h-9 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Add Multi-Grades & Divisions</span><span className="sm:hidden">Add Classes</span>
          </Button>
        </div>
      </div>

      {/* Alert Banner for errors */}
      {error && (
        <div className="p-3.5 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="hover:opacity-75 p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Class Grades</p>
              <p className="text-xl sm:text-2xl font-black text-foreground mt-0.5 sm:mt-1">{groupedClasses.length}</p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Divisions</p>
              <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
                <p className="text-xl sm:text-2xl font-black text-primary">{activeDivisionsList.length}</p>
                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground truncate max-w-[70px] sm:max-w-none">
                  ({activeDivisionsList.join(",") || "None"})
                </span>
              </div>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Master Subjects</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-500 mt-0.5 sm:mt-1">{masterSubjects.length}</p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold flex-shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Mappings</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-500 mt-0.5 sm:mt-1">{allAssignedSubjects.length}</p>
            </div>
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold flex-shrink-0">
              <BookMarked className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Card Wrapper containing DataTable */}
      <Card className="border-border/60 shadow-lg overflow-hidden flex flex-col">
        <CardHeader className="p-4 sm:p-6 border-b border-border/40 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <TableIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Class & Division Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Each row represents one class, displaying all its division names & total division count alongside assigned curriculum subjects.
              </CardDescription>
            </div>

            {/* Table Search & Grade Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              {/* Grade Filter Pill Dropdown */}
              <div className="relative">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="w-full sm:w-auto h-9 px-3 py-1 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer"
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
              <div className="relative w-full sm:w-56 md:w-64">
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

        <CardContent className="p-0 flex-1">
          <DataTable<GroupedClassItem>
            data={groupedClasses}
            columns={columns}
            rowKey={(item) => item.className}
            loading={loading}
            bordered={true}
            emptyText="No matching classes found"
            emptyIcon={<BookOpen className="h-10 w-10 opacity-30" />}
            renderMobileCard={(item, idx) => {
              const count = item.assignedSubjects.length;

              return (
                <div className="p-1 space-y-3">
                  {/* Top row: Class name & Actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground font-semibold">#{idx + 1}</span>
                      <h3 className="text-base font-extrabold text-foreground">{item.className}</h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${count > 0
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {count} {count === 1 ? "Sub" : "Subs"}
                      </span>
                      <button
                        onClick={() => setDeletingGroup(item)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete Class"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Divisions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-muted-foreground font-semibold mr-1">Divisions:</span>
                    {item.divisionNames.map((div) => (
                      <span
                        key={div}
                        className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20"
                      >
                        {div}
                      </span>
                    ))}
                  </div>

                  {/* Assigned subjects badges */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-muted-foreground font-semibold">Assigned Subjects:</span>
                    {count === 0 ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-3 w-3" /> No subjects assigned yet
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.assignedSubjects.map((sub) => {
                          const subName = sub.masterSubjectName || sub.name;
                          return (
                            <span
                              key={sub.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-muted/80 text-foreground border border-border/60"
                            >
                              <BookOpen className="h-3 w-3 text-primary opacity-80" />
                              <span>{subName}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile action button */}
                  <div className="pt-1">
                    <Button
                      onClick={() => handleOpenEditGroupModal(item)}
                      size="sm"
                      variant="outline"
                      className="w-full h-9 text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit Subjects for {item.className}
                    </Button>
                  </div>
                </div>
              );
            }}
          />
        </CardContent>
      </Card>

      {/* --- EDIT / CONFIGURE SUBJECTS MODAL FOR GROUPED CLASS --- */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <Card className="w-full max-w-3xl border-border/80 shadow-2xl bg-card max-h-[92vh] flex flex-col my-auto rounded-2xl">
            {/* Modal Header */}
            <CardHeader className="p-4 sm:p-6 flex flex-row items-start justify-between pb-3 sm:pb-4 border-b border-border/40">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                  <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-1.5 flex-wrap">
                    Configure Subjects:{" "}
                    <span className="text-primary font-black">
                      {editingGroup.className}
                    </span>
                  </CardTitle>
                  <CardDescription className="text-[11px] sm:text-xs">
                    Divisions: {editingGroup.divisionNames.join(", ")}
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => setEditingGroup(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            {/* Filter Bar Inside Modal */}
            <div className="p-3 sm:p-4 border-b border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                {subjectCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setEditingCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold capitalize transition-all whitespace-nowrap ${editingCategory === cat
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-border/60"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Quick Action: Select All / Clear All visible */}
              <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSelectAllVisible(filteredModalMasters)}
                  className="h-7 sm:h-8 text-[11px] sm:text-xs font-bold px-2.5"
                >
                  <CheckSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-primary" /> Select All
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleClearAllVisible(filteredModalMasters)}
                  className="h-7 sm:h-8 text-[11px] sm:text-xs font-bold px-2.5"
                >
                  <Square className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-muted-foreground" /> Clear
                </Button>
              </div>
            </div>

            {/* Search Input */}
            <div className="px-4 sm:px-6 pt-3">
              <Input
                placeholder="Search subject by name or code..."
                value={editingSearch}
                onChange={(e) => setEditingSearch(e.target.value)}
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
                className="h-9 text-xs"
              />
            </div>

            {/* Subjects Selection Cards Grid */}
            <CardContent className="p-4 sm:p-6 overflow-y-auto flex-1 max-h-[45vh] sm:max-h-[50vh]">
              {filteredModalMasters.length === 0 ? (
                <div className="text-center py-10 sm:py-12 text-muted-foreground">
                  <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs sm:text-sm font-bold">No master subjects found</p>
                  <p className="text-[11px] sm:text-xs">Adjust your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                  {filteredModalMasters.map((m: SubjectMaster) => {
                    const isChecked = editingSubjectMasterIds.some((id) => String(id) === String(m.id));
                    const catClass = m.category
                      ? CATEGORY_COLORS[m.category.toLowerCase()] || "bg-muted text-muted-foreground"
                      : "bg-muted text-muted-foreground";

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleSubjectMaster(m.id)}
                        className={`flex flex-col text-left p-3 rounded-xl border-2 transition-all ${isChecked
                            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20"
                            : "border-border/60 bg-card hover:border-muted-foreground/40"
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-foreground">
                            {m.code || `SUB-${m.id}`}
                          </span>

                          <div
                            className={`h-5 w-5 rounded-md flex items-center justify-center transition-all ${isChecked
                                ? "bg-primary text-primary-foreground shadow-xs scale-110"
                                : "border border-border bg-background"
                              }`}
                          >
                            {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </div>
                        </div>

                        <h4 className="font-bold text-xs text-foreground line-clamp-1">{m.name}</h4>

                        {m.category && (
                          <div className="mt-1.5">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-border/40 bg-muted/20">
              <div className="text-xs font-bold text-muted-foreground self-start sm:self-auto">
                Selected:{" "}
                <span className="text-primary font-black text-sm">{editingSubjectMasterIds.length} Subjects</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingGroup(null)} className="flex-1 sm:flex-none text-xs font-semibold h-9">
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveClassSubjects}
                  disabled={saving}
                  className="flex-1 sm:flex-none font-bold gap-2 shadow-lg min-w-[130px] h-9 text-xs"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" /> Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Subjects
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 animate-fade-in overflow-y-auto">
          <Card className="w-full max-w-2xl border-border/80 shadow-2xl bg-card/95 backdrop-blur-xl max-h-[92vh] flex flex-col my-auto rounded-3xl overflow-hidden border">
            {/* Modal Header */}
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between pb-4 border-b border-border/40 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                  <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-xl font-black tracking-tight flex items-center gap-2">
                    Batch Create Classes & Divisions
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Select multiple grade levels, sections & curriculum subjects to auto-generate class mappings
                  </CardDescription>
                </div>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-xl hover:bg-muted/80"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>

            <form onSubmit={handleCreateClassesBatch} className="flex-1 overflow-y-auto">
              <CardContent className="p-4 sm:p-6 space-y-6">
                {/* 1. Select Grade Levels */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center shadow-xs">
                        1
                      </span>
                      Select Grade Levels{" "}
                      <span className="text-primary font-black text-xs">({selectedGradeNames.length} Selected)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedGradeNames(classMasters.map((cm) => cm.name))}
                        className="text-xs text-primary font-bold hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20 transition-all hover:bg-primary/20"
                      >
                        <CheckSquare className="h-3 w-3" /> Select All ({classMasters.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGradeNames([])}
                        className="text-xs text-muted-foreground font-semibold hover:underline flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border/60 transition-all hover:bg-muted/80"
                      >
                        <Square className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  </div>

                  {/* Grade Cards Checkbox Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-2 border rounded-2xl border-border/50 bg-muted/20">
                    {classMasters.map((cm) => {
                      const isChecked = selectedGradeNames.includes(cm.name);
                      return (
                        <button
                          key={cm.id}
                          type="button"
                          onClick={() => toggleGradeName(cm.name)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${
                            isChecked
                              ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30"
                              : "border-border/60 bg-background text-foreground hover:border-muted-foreground/40 hover:bg-muted/30"
                          }`}
                        >
                          <span className="truncate">{cm.name}</span>
                          <div
                            className={`h-4.5 w-4.5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                              isChecked ? "bg-primary text-primary-foreground shadow-xs scale-105" : "border border-border bg-background"
                            }`}
                          >
                            {isChecked && <Check className="h-3 w-3" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <Input
                    placeholder="Custom grades (optional, e.g. Nursery, Pre-K, KG-1)"
                    value={customGradeInput}
                    onChange={(e) => setCustomGradeInput(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                {/* 2. Select Divisions */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-indigo-500 text-white text-[11px] font-black inline-flex items-center justify-center shadow-xs">
                        2
                      </span>
                      Select Divisions / Sections{" "}
                      <span className="text-indigo-500 font-black text-xs">({selectedDivisions.length} Selected)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDivisions([...divMasters])}
                        className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all hover:bg-indigo-500/20"
                      >
                        <CheckSquare className="h-3 w-3" /> Select All ({divMasters.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDivisions([])}
                        className="text-xs text-muted-foreground font-semibold hover:underline flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border/60 transition-all hover:bg-muted/80"
                      >
                        <Square className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  </div>

                  {/* Division Pills */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {divMasters.map((div) => {
                      const isSelected = selectedDivisions.includes(div);
                      return (
                        <button
                          key={div}
                          type="button"
                          onClick={() => toggleDivision(div)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all font-bold ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm scale-105 ring-1 ring-indigo-500/30"
                              : "border-border/60 bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                          }`}
                        >
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Div</span>
                          <span className="text-lg font-black">{div}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Input
                    placeholder="Custom sections (optional, e.g. F, G, H)"
                    value={customSectionInput}
                    onChange={(e) => setCustomSectionInput(e.target.value)}
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                {/* 3. Assign Subjects (Optional, Multi/Select All) */}
                <div className="space-y-3 pt-3 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[11px] font-black inline-flex items-center justify-center shadow-xs">
                        3
                      </span>
                      Assign Master Subjects{" "}
                      <span className="text-emerald-500 font-black text-xs">({selectedNewClassSubjectIds.length} Selected)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSelectAllNewClassSubjects()}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 transition-all hover:bg-emerald-500/20"
                      >
                        <CheckSquare className="h-3 w-3" /> Select All ({masterSubjects.length})
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllNewClassSubjects}
                        className="text-xs text-muted-foreground font-semibold hover:underline flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg border border-border/60 transition-all hover:bg-muted/80"
                      >
                        <Square className="h-3 w-3" /> Clear
                      </button>
                    </div>
                  </div>

                  {/* Master Subjects Checkbox Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-52 overflow-y-auto p-2 border rounded-2xl border-border/50 bg-muted/20">
                    {masterSubjects.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic col-span-full py-3 text-center">
                        No master subjects available in library.
                      </p>
                    ) : (
                      masterSubjects.map((m) => {
                        const isChecked = selectedNewClassSubjectIds.includes(String(m.id));
                        const catClass = m.category
                          ? CATEGORY_COLORS[m.category.toLowerCase()] || "bg-muted text-muted-foreground"
                          : "bg-muted text-muted-foreground";

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleNewClassSubject(String(m.id))}
                            className={`flex flex-col text-left p-2.5 rounded-xl border-2 transition-all ${
                              isChecked
                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/30"
                                : "border-border/60 bg-background hover:border-muted-foreground/40"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-muted text-foreground">
                                {m.code || `SUB-${m.id}`}
                              </span>
                              <div
                                className={`h-4.5 w-4.5 rounded-md flex items-center justify-center transition-all ${
                                  isChecked
                                    ? "bg-emerald-500 text-white shadow-xs scale-105"
                                    : "border border-border bg-background"
                                }`}
                              >
                                {isChecked && <Check className="h-3 w-3" />}
                              </div>
                            </div>

                            <h4 className="font-bold text-xs text-foreground line-clamp-1">{m.name}</h4>

                            {m.category && (
                              <div className="mt-1">
                                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${catClass}`}>
                                  {m.category}
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-border/40 bg-muted/20">
                <div className="text-xs font-bold text-muted-foreground self-start sm:self-auto flex items-center gap-2 flex-wrap">
                  <span>Will create:</span>
                  <span className="text-primary font-black text-sm px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                    {totalClassesToCreate > 0 ? totalClassesToCreate : 0} Class Sections
                  </span>
                  {selectedNewClassSubjectIds.length > 0 && (
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">
                      + {selectedNewClassSubjectIds.length} subjects each
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddClassModal(false)} className="flex-1 sm:flex-none text-xs font-bold h-9 px-4 rounded-xl">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={creatingClass || totalClassesToCreate === 0}
                    className="flex-1 sm:flex-none font-black gap-2 shadow-lg h-9 text-xs rounded-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:brightness-110 transition-all min-w-[150px]"
                  >
                    {creatingClass ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
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
        <div className="fixed inset-0 z-50 flex items-center sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-fade-in overflow-y-auto">
          <Card className="w-full max-w-md border-destructive/30 shadow-2xl bg-card my-auto rounded-2xl">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <CardTitle className="text-base sm:text-lg font-bold">Remove Class</CardTitle>
              </div>
              <button
                onClick={() => setDeletingGroup(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              <p className="text-xs sm:text-sm font-medium">
                Are you sure you want to delete{" "}
                <span className="font-bold text-foreground">
                  {deletingGroup.className} (Divisions: {deletingGroup.divisionNames.join(", ")})
                </span>
                ?
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                This will remove all class divisions and assigned subject mappings from the database.
              </p>
            </CardContent>
            <div className="flex items-center justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 border-t border-border/40 bg-muted/20">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingGroup(null)} className="text-xs font-semibold h-9">
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={deleting}
                onClick={handleDeleteGroupedClass}
                className="font-bold gap-2 h-9 text-xs"
              >
                {deleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ClassSubjectConfigUI;
