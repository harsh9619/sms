import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../saga/rootReducer";
import { useSchool } from "../../context/SchoolContext";
import {
  fetchClassSubjectConfigRequest,
  syncClassSubjectsRequest,
  batchCreateClassesRequest,
  deleteClassGroupRequest,
  clearClassSubjectConfigMessages,
} from "../../saga/classSubjectConfig";
import { ClassSubjectConfigUI } from "../../components/modules/classes/ClassSubjectConfigUI";
import { GroupedClassItem } from "../../saga/classSubjectConfig/types";
import { SubjectMaster, SubjectItem } from "../../Services/classSubject.service";
import type { ClassInfo } from "../../types";

export function ClassSubjectConfigContainer() {
  const dispatch = useDispatch();
  const { activeSchool } = useSchool();

  const {
    classesList,
    classMasters,
    masterSubjects,
    allAssignedSubjects,
    divMasters,
    loading,
    saving,
    saveSuccess,
    creatingClass,
    deleting,
    successMsg,
    error: storeError,
  } = useSelector((state: RootState) => state.classSubjectConfig);

  const [localError, setLocalError] = useState<string | null>(null);

  // Table Search & Filter States
  const [tableSearch, setTableSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");

  // Edit Modal State
  const [editingGroup, setEditingGroup] = useState<GroupedClassItem | null>(null);
  const [editingSubjectMasterIds, setEditingSubjectMasterIds] = useState<string[]>([]);
  const [editingSearch, setEditingSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<string>("all");

  // Batch Add Class Modal State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedGradeNames, setSelectedGradeNames] = useState<string[]>([]);
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>(["A"]);
  const [selectedNewClassSubjectIds, setSelectedNewClassSubjectIds] = useState<string[]>([]);
  const [customGradeInput, setCustomGradeInput] = useState<string>("");
  const [customSectionInput, setCustomSectionInput] = useState<string>("");

  // Delete Class Modal State
  const [deletingGroup, setDeletingGroup] = useState<GroupedClassItem | null>(null);

  // Initial load
  useEffect(() => {
    dispatch(fetchClassSubjectConfigRequest());
  }, [dispatch, activeSchool]);

  // Clear feedback messages after 3s
  useEffect(() => {
    if (successMsg || storeError) {
      const timer = setTimeout(() => {
        dispatch(clearClassSubjectConfigMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, storeError, dispatch]);

  // Close modals on successful actions
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setEditingGroup(null);
        dispatch(clearClassSubjectConfigMessages());
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, dispatch]);

  const combinedError = localError || storeError;

  const handleRefresh = () => {
    setLocalError(null);
    dispatch(fetchClassSubjectConfigRequest());
  };

  // Open Edit Modal for a grouped class row with robust pre-selection
  const handleOpenEditGroupModal = (group: GroupedClassItem) => {
    setEditingGroup(group);
    setEditingSearch("");
    setEditingCategory("all");

    const matchedMasterIds = new Set<string>();

    group.assignedSubjects.forEach((assigned) => {
      const assignedMasterId = assigned.subjectMasterId ? String(assigned.subjectMasterId) : undefined;
      const assignedId = assigned.id ? String(assigned.id) : undefined;
      const assignedName = (assigned.masterSubjectName || assigned.name || "").toLowerCase().trim();
      const assignedCode = assigned.code ? assigned.code.toLowerCase().trim() : undefined;

      const foundMaster = masterSubjects.find((m) => {
        const mId = String(m.id);
        if (assignedMasterId && mId === assignedMasterId) return true;
        if (assignedId && mId === assignedId) return true;
        if (assignedName && m.name.toLowerCase().trim() === assignedName) return true;
        if (assignedCode && m.code && m.code.toLowerCase().trim() === assignedCode) return true;
        return false;
      });

      if (foundMaster) {
        matchedMasterIds.add(String(foundMaster.id));
      } else if (assignedMasterId) {
        matchedMasterIds.add(assignedMasterId);
      } else if (assignedId) {
        matchedMasterIds.add(assignedId);
      }
    });

    setEditingSubjectMasterIds(Array.from(matchedMasterIds));
  };

  // Toggle subject inside edit modal
  const toggleSubjectMaster = (masterId: string) => {
    const targetId = String(masterId);
    setEditingSubjectMasterIds((prev) =>
      prev.some((id) => String(id) === targetId)
        ? prev.filter((id) => String(id) !== targetId)
        : [...prev, targetId]
    );
  };

  // Select all visible in edit modal
  const handleSelectAllVisible = (visibleMasters: SubjectMaster[]) => {
    const visibleIds = visibleMasters.map((m) => String(m.id));
    setEditingSubjectMasterIds((prev) => Array.from(new Set([...prev.map(String), ...visibleIds])));
  };

  // Clear all visible in edit modal
  const handleClearAllVisible = (visibleMasters: SubjectMaster[]) => {
    const visibleSet = new Set(visibleMasters.map((m) => String(m.id)));
    setEditingSubjectMasterIds((prev) => prev.filter((id) => !visibleSet.has(String(id))));
  };

  // Save subject configuration
  const handleSaveClassSubjects = () => {
    if (!editingGroup) return;
    setLocalError(null);
    const masterSubjectNumbers = editingSubjectMasterIds.map((id) => Number(id));
    dispatch(
      syncClassSubjectsRequest({
        classIds: editingGroup.classIds,
        masterSubjectNumbers,
      })
    );
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

  // Toggle subject in batch class creation modal
  const toggleNewClassSubject = (id: string) => {
    setSelectedNewClassSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all subjects for new classes
  const handleSelectAllNewClassSubjects = (visibleMasters?: SubjectMaster[]) => {
    const mastersToUse = visibleMasters || masterSubjects;
    setSelectedNewClassSubjectIds(mastersToUse.map((m) => String(m.id)));
  };

  // Clear all subjects for new classes
  const handleClearAllNewClassSubjects = () => {
    setSelectedNewClassSubjectIds([]);
  };

  // Create Classes Batch Handler
  const handleCreateClassesBatch = (e: React.FormEvent) => {
    e.preventDefault();

    const gradesToCreate = [...selectedGradeNames];
    if (customGradeInput.trim()) {
      const extra = customGradeInput.split(",").map((s) => s.trim()).filter(Boolean);
      gradesToCreate.push(...extra);
    }
    const uniqueGrades = Array.from(new Set(gradesToCreate));
    if (uniqueGrades.length === 0) {
      setLocalError("Please select or enter at least one grade.");
      return;
    }

    const divList = [...selectedDivisions];
    if (customSectionInput.trim()) {
      const extraDiv = customSectionInput.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
      divList.push(...extraDiv);
    }
    const uniqueDivisions = Array.from(new Set(divList));
    if (uniqueDivisions.length === 0) {
      setLocalError("Please select at least one division (e.g. A, B, C, D, E).");
      return;
    }

    setLocalError(null);

    const batchPayload: { name: string; section: string }[] = [];
    for (const gradeName of uniqueGrades) {
      for (const sec of uniqueDivisions) {
        batchPayload.push({ name: gradeName, section: sec });
      }
    }

    const masterSubjectNumbers = selectedNewClassSubjectIds.map((id) => Number(id)).filter(Boolean);

    dispatch(
      batchCreateClassesRequest({
        classes: batchPayload,
        masterSubjectNumbers,
      } as any)
    );
    setShowAddClassModal(false);
    setSelectedGradeNames([]);
    setSelectedDivisions(["A"]);
    setSelectedNewClassSubjectIds([]);
    setCustomGradeInput("");
    setCustomSectionInput("");
  };

  // Delete Grouped Class Handler
  const handleDeleteGroupedClass = () => {
    if (!deletingGroup) return;
    setLocalError(null);
    dispatch(deleteClassGroupRequest(deletingGroup.classIds));
    setDeletingGroup(null);
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
    const divsSet = new Set<string>();
    classesList.forEach((c) => {
      if (Array.isArray(c.divisions) && c.divisions.length > 0) {
        c.divisions.forEach((d: any) => {
          const name = typeof d === "string" ? d : d?.name;
          if (name) divsSet.add(String(name).toUpperCase());
        });
      } else if (c.division) {
        divsSet.add(String(c.division).toUpperCase());
      } else if (c.section) {
        divsSet.add(String(c.section).toUpperCase());
      }
    });
    return Array.from(divsSet).sort();
  }, [classesList]);

  // Group classes by class name so that ONE ROW per class is rendered
  const groupedClasses = useMemo(() => {
    const groupsMap = new Map<string, ClassInfo[]>();

    classesList.forEach((cls) => {
      const classNameKey = cls.name.trim();
      const fullTitle = `${cls.name} ${cls.section || cls.division || ""}`.toLowerCase();
      const matchesSearch =
        tableSearch.trim() === "" ||
        fullTitle.includes(tableSearch.toLowerCase()) ||
        cls.name.toLowerCase().includes(tableSearch.toLowerCase());

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
      const classIds = classItems.map((c) => c.id || c.schoolClassId || "").filter(Boolean);

      const divisionNamesSet = new Set<string>();
      classItems.forEach((c) => {
        if (Array.isArray(c.divisions) && c.divisions.length > 0) {
          c.divisions.forEach((d: any) => {
            const name = typeof d === "string" ? d : d?.name;
            if (name) divisionNamesSet.add(String(name).toUpperCase());
          });
        } else if (c.division) {
          divisionNamesSet.add(String(c.division).toUpperCase());
        } else if (c.section) {
          divisionNamesSet.add(String(c.section).toUpperCase());
        }
      });

      const divisionNames = Array.from(divisionNamesSet).sort();

      // Collect unique assigned subjects across all divisions of this class
      const assignedMap = new Map<string, SubjectItem>();

      classItems.forEach((c) => {
        if (Array.isArray(c.subjects)) {
          c.subjects.forEach((s: any) => {
            const subId = typeof s === "object" ? String(s.id || s.subjectMasterId || s.name) : String(s);
            const subName = typeof s === "object" ? s.name : String(s);
            const subCode = typeof s === "object" ? s.code : undefined;
            if (!assignedMap.has(subId)) {
              assignedMap.set(subId, {
                id: subId,
                subjectMasterId: typeof s === "object" && s.id ? String(s.id) : undefined,
                masterSubjectName: subName,
                name: subName,
                code: subCode,
                schoolId: c.schoolId || "",
              });
            }
          });
        }

        const classIdKey = String(c.id || c.schoolClassId);
        const subsFromMap = classSubjectMapping.get(classIdKey) || [];
        subsFromMap.forEach((s) => {
          const subKey = s.subjectMasterId ? String(s.subjectMasterId) : (s.id || s.name);
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
    return ["all", ...Array.from(new Set(masterSubjects.map((m) => m.category).filter((c): c is string => Boolean(c))))];
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
    <ClassSubjectConfigUI
      groupedClasses={groupedClasses}
      classesList={classesList}
      classMasters={classMasters}
      masterSubjects={masterSubjects}
      allAssignedSubjects={allAssignedSubjects}
      divMasters={divMasters}
      activeDivisionsList={activeDivisionsList}
      subjectCategories={subjectCategories}
      filteredModalMasters={filteredModalMasters}
      loading={loading}
      error={combinedError}
      setError={setLocalError}
      tableSearch={tableSearch}
      setTableSearch={setTableSearch}
      gradeFilter={gradeFilter}
      setGradeFilter={setGradeFilter}
      editingGroup={editingGroup}
      setEditingGroup={setEditingGroup}
      editingSubjectMasterIds={editingSubjectMasterIds}
      editingSearch={editingSearch}
      setEditingSearch={setEditingSearch}
      editingCategory={editingCategory}
      setEditingCategory={setEditingCategory}
      saving={saving}
      saveSuccess={saveSuccess}
      showAddClassModal={showAddClassModal}
      setShowAddClassModal={setShowAddClassModal}
      selectedGradeNames={selectedGradeNames}
      setSelectedGradeNames={setSelectedGradeNames}
      selectedDivisions={selectedDivisions}
      setSelectedDivisions={setSelectedDivisions}
      customGradeInput={customGradeInput}
      setCustomGradeInput={setCustomGradeInput}
      customSectionInput={customSectionInput}
      setCustomSectionInput={setCustomSectionInput}
      selectedNewClassSubjectIds={selectedNewClassSubjectIds}
      setSelectedNewClassSubjectIds={setSelectedNewClassSubjectIds}
      creatingClass={creatingClass}
      deletingGroup={deletingGroup}
      setDeletingGroup={setDeletingGroup}
      deleting={deleting}
      handleOpenEditGroupModal={handleOpenEditGroupModal}
      toggleSubjectMaster={toggleSubjectMaster}
      handleSelectAllVisible={handleSelectAllVisible}
      handleClearAllVisible={handleClearAllVisible}
      handleSaveClassSubjects={handleSaveClassSubjects}
      toggleGradeName={toggleGradeName}
      toggleDivision={toggleDivision}
      toggleNewClassSubject={toggleNewClassSubject}
      handleSelectAllNewClassSubjects={handleSelectAllNewClassSubjects}
      handleClearAllNewClassSubjects={handleClearAllNewClassSubjects}
      handleCreateClassesBatch={handleCreateClassesBatch}
      handleDeleteGroupedClass={handleDeleteGroupedClass}
      handleRefresh={handleRefresh}
      totalClassesToCreate={totalClassesToCreate}
    />
  );
}

export default ClassSubjectConfigContainer;
