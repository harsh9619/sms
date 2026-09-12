import React, { useState, useEffect, useMemo } from "react";
import { useSchool } from "../../context/SchoolContext";
import classService from "../../Services/class.service";
import httpService from "../../Services/http.service";
import type { ClassInfo } from "../../types";
import { ClassesUI, Teacher, ClassTeacherItem } from "../../components/modules/classes/ClassesUI";

export function ClassesContainer() {
  const { activeSchool } = useSchool();
  const [classesList, setClassesList] = useState<ClassInfo[]>([]);
  const [classTeacherData, setClassTeacherData] = useState<ClassTeacherItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({}); // classId -> teacherId

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  const [loading, setLoading] = useState(true);
  const [savingClassId, setSavingClassId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Classes data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classService.getClasses();
      setClassesList(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const loadClassTeacherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await classService.getClassTeachers();
      setClassTeacherData(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load class teacher configurations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadClassTeacherData();
  }, [activeSchool]);

  // Load Teachers list
  useEffect(() => {
    httpService.get<Teacher[]>("/api/teachers")
      .then((res) => {
        if (Array.isArray(res)) {
          setTeachers(res);
        }
      })
      .catch(() => {
        setTeachers([]);
      });
  }, []);

  // Direct API call on teacher dropdown selection
  const handleTeacherChange = async (classId: string, teacherId: string) => {
    const newTeacherId = teacherId || null;

    // Optimistic UI update
    setAssignments((prev) => ({
      ...prev,
      [classId]: teacherId,
    }));

    const assignedTeacher = teachers.find((t) => String(t.id) === String(teacherId));
    setClassTeacherData((prev) =>
      prev.map((c) =>
        String(c.classId) === String(classId) || String(c.id) === String(classId)
          ? {
              ...c,
              teacherId: newTeacherId ? Number(newTeacherId) : null,
              teacherName: assignedTeacher?.name || null,
            }
          : c
      )
    );

    setSavingClassId(classId);
    setError(null);

    try {
      const res = await classService.updateClassTeacher(classId, { teacherId: newTeacherId });
      if (Array.isArray(res) && res.length > 0) {
        setClassTeacherData(res);
      }

      setSuccessMsg("Class teacher updated!");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to update class teacher");
      await loadClassTeacherData();
    } finally {
      setSavingClassId(null);
    }
  };

  // Flatten / Expand class items for matrix display
  const classRows = useMemo(() => {
    const rows: ClassTeacherItem[] = [];
    classTeacherData.forEach((cls) => {
      rows.push({
        id: cls.id,
        classTeacherId: cls.classTeacherId,
        schoolId: cls.schoolId,
        schoolAcademicYearId: cls.schoolAcademicYearId,
        classId: cls.classId,
        className: cls.className,
        divisionId: cls.divisionId,
        divisionName: cls.divisionName,
        classDivision: cls?.classDivision,
        classSection: cls?.classSection,
        teacherId: cls.teacherId || null,
        teacherName: cls.teacherName || null,
        isPrimary: cls?.isPrimary,
      });
    });

    return rows;
  }, [classTeacherData]);

  // Available unique divisions
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    classesList.forEach((c) => {
      if (c.divisions && Array.isArray(c.divisions)) {
        c.divisions.forEach((d) => set.add(d.name.toUpperCase()));
      } else if (c.section) {
        set.add(c.section.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [classesList]);

  // Filtered Rows based on Class, Division, Teacher, Status
  const filteredRows = useMemo(() => {
    const selectedClassObj = classesList.find(
      (c) => String(c.id) === String(selectedClassId) || String(c.schoolClassId) === String(selectedClassId)
    );

    return classRows.filter((r) => {
      // 1. Class filter
      let matchesClass = true;
      if (selectedClassId) {
        matchesClass = false;
        if (String(r.id) === String(selectedClassId) || String(r.schoolClassId) === String(selectedClassId)) {
          matchesClass = true;
        } else if (selectedClassObj) {
          const classNameLower = String(selectedClassObj.name).trim().toLowerCase();
          const rClassNameLower = String(r.className).trim().toLowerCase();
          if (
            rClassNameLower === classNameLower ||
            `class ${rClassNameLower}` === classNameLower ||
            rClassNameLower === `class ${classNameLower}`
          ) {
            matchesClass = true;
          }
        }
      }

      // 2. Division filter
      let matchesDivision = true;
      if (selectedDivision && selectedDivision !== "ALL") {
        const selDivUpper = selectedDivision.trim().toUpperCase();
        matchesDivision =
          r.divisionName?.toUpperCase() === selDivUpper ||
          String(r.divisionId) === String(selectedDivision);
      }

      // 3. Teacher filter
      const currentTeacherId = assignments[r.id] || (r.teacherId ? String(r.teacherId) : "");
      let matchesTeacher = true;
      if (selectedTeacherFilter && selectedTeacherFilter !== "ALL") {
        matchesTeacher = String(currentTeacherId) === String(selectedTeacherFilter);
      }

      // 4. Status filter
      let matchesStatus = true;
      if (selectedStatusFilter === "ASSIGNED") {
        matchesStatus = Boolean(currentTeacherId);
      } else if (selectedStatusFilter === "UNASSIGNED") {
        matchesStatus = !currentTeacherId;
      }

      return matchesClass && matchesDivision && matchesTeacher && matchesStatus;
    });
  }, [classRows, classesList, selectedClassId, selectedDivision, selectedTeacherFilter, selectedStatusFilter, assignments]);

  const assignedCount = classRows.filter((r) => Boolean(assignments[r.id] || r.teacherId)).length;
  const unassignedCount = classRows.length - assignedCount;

  return (
    <ClassesUI
      loading={loading}
      error={error}
      successMsg={successMsg}
      savingClassId={savingClassId}
      classesList={classesList}
      teachers={teachers}
      assignments={assignments}
      selectedClassId={selectedClassId}
      setSelectedClassId={setSelectedClassId}
      selectedDivision={selectedDivision}
      setSelectedDivision={setSelectedDivision}
      selectedTeacherFilter={selectedTeacherFilter}
      setSelectedTeacherFilter={setSelectedTeacherFilter}
      selectedStatusFilter={selectedStatusFilter}
      setSelectedStatusFilter={setSelectedStatusFilter}
      filteredRows={filteredRows}
      availableDivisions={availableDivisions}
      assignedCount={assignedCount}
      unassignedCount={unassignedCount}
      totalCount={classRows.length}
      onTeacherChange={handleTeacherChange}
    />
  );
}

export default ClassesContainer;
