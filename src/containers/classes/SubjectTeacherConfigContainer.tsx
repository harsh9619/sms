import React, { useState, useEffect, useMemo } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { useSchool } from "../../context/SchoolContext";
import {
  fetchSubjectTeacherConfigRequest,
  fetchConfigTeachersRequest,
  fetchConfigClassesRequest,
  assignSubjectTeacherRequest,
  clearConfigMessages,
} from "../../saga/subjectTeacherConfig/actions";
import {
  AssignSubjectTeacherPayload,
  FetchSubjectTeacherConfigParams,
  PaginationMeta,
} from "../../saga/subjectTeacherConfig/types";
import { SubjectTeacherConfigUI } from "../../components/modules/classes/SubjectTeacherConfigUI";
import { SubjectItem } from "../../Services/classSubject.service";
import { ClassInfo } from "../../types";

function SubjectTeacherConfigContainerContent(props: any) {
  const {
    subjects,
    teachers,
    classesList,
    assignments,
    meta,
    loading,
    savingSubjectId,
    savingAll,
    successMsg,
    error,
    fetchSubjectTeacherConfig,
    fetchConfigTeachers,
    fetchConfigClasses,
    assignSubjectTeacher,
    clearMessages,
  } = props;

  const { activeSchool } = useSchool();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedDivision, setSelectedDivision] = useState<string>("ALL");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("ALL");

  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  // Reset page on filter changes
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };
  const handleClassChange = (val: string) => {
    setSelectedClassId(val);
    setPage(1);
  };
  const handleDivisionChange = (val: string) => {
    setSelectedDivision(val);
    setPage(1);
  };
  const handleTeacherFilterChange = (val: string) => {
    setSelectedTeacherFilter(val);
    setPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setSelectedStatusFilter(val);
    setPage(1);
  };
  const handleSubjectFilterChange = (val: string) => {
    setSelectedSubjectFilter(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedClassId("");
    setSelectedDivision("ALL");
    setSelectedTeacherFilter("ALL");
    setSelectedStatusFilter("ALL");
    setSelectedSubjectFilter("ALL");
    setPage(1);
  };

  useEffect(() => {
    fetchSubjectTeacherConfig({
      page,
      limit,
      search: searchQuery || undefined,
      classId: selectedClassId || undefined,
      division: selectedDivision !== "ALL" ? selectedDivision : undefined,
      teacherId: selectedTeacherFilter !== "ALL" ? selectedTeacherFilter : undefined,
      status: selectedStatusFilter !== "ALL" ? selectedStatusFilter : undefined,
      subjectName: selectedSubjectFilter !== "ALL" ? selectedSubjectFilter : undefined,
    });
    fetchConfigTeachers();
    fetchConfigClasses();
  }, [
    fetchSubjectTeacherConfig,
    fetchConfigTeachers,
    fetchConfigClasses,
    activeSchool,
    page,
    limit,
    searchQuery,
    selectedClassId,
    selectedDivision,
    selectedTeacherFilter,
    selectedStatusFilter,
    selectedSubjectFilter,
  ]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, clearMessages]);

  const handleTeacherChange = (classSubjectId: string, teacherId: string) => {
    const newTeacherId = teacherId || null;
    assignSubjectTeacher({
      classSubjectId,
      teacherId: newTeacherId,
    });
  };

  const handleRefresh = () => {
    fetchSubjectTeacherConfig({
      page,
      limit,
      search: searchQuery || undefined,
      classId: selectedClassId || undefined,
      division: selectedDivision !== "ALL" ? selectedDivision : undefined,
      teacherId: selectedTeacherFilter !== "ALL" ? selectedTeacherFilter : undefined,
      status: selectedStatusFilter !== "ALL" ? selectedStatusFilter : undefined,
      subjectName: selectedSubjectFilter !== "ALL" ? selectedSubjectFilter : undefined,
    });
    fetchConfigTeachers();
    fetchConfigClasses();
  };

  // Available unique divisions
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s: any) => {
      const divName = s.divisionName || s.classDivision || s.classSection;
      if (divName) set.add(String(divName).toUpperCase());
    });
    (classesList as ClassInfo[]).forEach((c) => {
      if (c.divisions && Array.isArray(c.divisions)) {
        c.divisions.forEach((d) => set.add(d.name.toUpperCase()));
      } else if (c.section) {
        set.add(c.section.toUpperCase());
      }
    });
    return Array.from(set).sort();
  }, [subjects, classesList]);

  // Available unique subject names
  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    subjects.forEach((s: any) => {
      const subName = s.subjectName || s.name;
      if (subName) set.add(subName);
    });
    return Array.from(set).sort();
  }, [subjects]);

  // Filtering based on Search, Class, Division, Subject, Teacher, and Status
  const filteredSubjects = useMemo(() => {
    const selectedClassObj = (classesList as ClassInfo[]).find(
      (c) => String(c.id) === String(selectedClassId) || String(c.schoolClassId) === String(selectedClassId)
    );

    const qLower = searchQuery.trim().toLowerCase();

    return (subjects as SubjectItem[]).filter((s: any) => {
      const itemKey = s.classSubjectId || s.id;
      const currentTeacherId = assignments[itemKey] || s.teacherId || "";
      const assignedTeacher = teachers.find((t: any) => String(t.id) === String(currentTeacherId));

      const className = String(s.className || "").toLowerCase();
      const divName = String(s.divisionName || s.classDivision || s.classSection || "").toLowerCase();
      const subjectName = String(s.subjectName || s.name || "").toLowerCase();
      const teacherName = String(s.teacherName || assignedTeacher?.name || "").toLowerCase();

      // 0. Free Text Search Filter
      if (qLower) {
        const matchesSearch =
          className.includes(qLower) ||
          divName.includes(qLower) ||
          subjectName.includes(qLower) ||
          teacherName.includes(qLower);
        if (!matchesSearch) return false;
      }

      // 1. Class filter
      let matchesClass = true;
      if (selectedClassId) {
        matchesClass = false;
        if (String(s.classId) === String(selectedClassId)) {
          matchesClass = true;
        } else if (selectedClassObj) {
          const classNameLower = String(selectedClassObj.name).trim().toLowerCase();
          const sClassNameLower = String(s.className || "").trim().toLowerCase();
          if (
            sClassNameLower === classNameLower ||
            `class ${sClassNameLower}` === classNameLower ||
            sClassNameLower === `class ${classNameLower}`
          ) {
            matchesClass = true;
          } else if (selectedClassObj.schoolClassId && String(s.classId) === String(selectedClassObj.schoolClassId)) {
            matchesClass = true;
          } else if (selectedClassObj.classMasterId && s.classMasterId && String(s.classMasterId) === String(selectedClassObj.classMasterId)) {
            matchesClass = true;
          }
        }
      }

      // 2. Division filter
      const divNameTrimmed = divName.trim();
      let matchesDivision = true;
      if (selectedDivision && selectedDivision !== "ALL") {
        const selDivUpper = selectedDivision.trim().toUpperCase();
        matchesDivision =
          divNameTrimmed.toUpperCase() === selDivUpper ||
          String(s.divisionId) === String(selectedDivision);
      }

      // 3. Teacher filter
      let matchesTeacher = true;
      if (selectedTeacherFilter && selectedTeacherFilter !== "ALL") {
        matchesTeacher = String(currentTeacherId) === String(selectedTeacherFilter);
      }

      // 4. Status filter (Only Assigned / Only Unassigned / All)
      let matchesStatus = true;
      if (selectedStatusFilter === "ASSIGNED") {
        matchesStatus = Boolean(currentTeacherId);
      } else if (selectedStatusFilter === "UNASSIGNED") {
        matchesStatus = !currentTeacherId;
      }

      // 5. Subject filter dropdown
      const subNameTrimmed = subjectName.trim();
      let matchesSubject = true;
      if (selectedSubjectFilter && selectedSubjectFilter !== "ALL") {
        const selSubLower = selectedSubjectFilter.trim().toLowerCase();
        matchesSubject =
          subNameTrimmed === selSubLower ||
          String(s.subjectId) === String(selectedSubjectFilter);
      }

      return matchesClass && matchesDivision && matchesTeacher && matchesStatus && matchesSubject;
    });
  }, [
    subjects,
    teachers,
    classesList,
    searchQuery,
    selectedClassId,
    selectedDivision,
    selectedTeacherFilter,
    selectedStatusFilter,
    selectedSubjectFilter,
    assignments,
  ]);

  // Handle client-side pagination fallback if server returned full unpaginated list
  const totalItems = meta?.total && meta.total > subjects.length ? meta.total : filteredSubjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  const effectiveMeta: PaginationMeta = {
    total: totalItems,
    page: Math.min(page, totalPages),
    limit,
    totalPages,
  };

  const paginatedSubjects = useMemo(() => {
    // If backend already paginated the data
    if (meta?.total && meta.total > subjects.length) {
      return filteredSubjects;
    }
    // Client side slicing fallback
    const startIndex = (page - 1) * limit;
    return filteredSubjects.slice(startIndex, startIndex + limit);
  }, [filteredSubjects, page, limit, subjects.length, meta]);

  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const unassignedCount = (subjects as SubjectItem[]).length - assignedCount;

  return (
    <SubjectTeacherConfigUI
      subjects={subjects}
      filteredSubjects={filteredSubjects}
      paginatedSubjects={paginatedSubjects}
      teachers={teachers}
      classesList={classesList}
      assignments={assignments}
      loading={loading}
      savingSubjectId={savingSubjectId}
      savingAll={savingAll}
      successMsg={successMsg}
      error={error}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={(l: number) => {
        setLimit(l);
        setPage(1);
      }}
      meta={effectiveMeta}
      searchQuery={searchQuery}
      setSearchQuery={handleSearchChange}
      selectedClassId={selectedClassId}
      setSelectedClassId={handleClassChange}
      selectedDivision={selectedDivision}
      setSelectedDivision={handleDivisionChange}
      selectedSubjectFilter={selectedSubjectFilter}
      setSelectedSubjectFilter={handleSubjectFilterChange}
      selectedTeacherFilter={selectedTeacherFilter}
      setSelectedTeacherFilter={handleTeacherFilterChange}
      selectedStatusFilter={selectedStatusFilter}
      setSelectedStatusFilter={handleStatusFilterChange}
      availableDivisions={availableDivisions}
      availableSubjects={availableSubjects}
      assignedCount={assignedCount}
      unassignedCount={unassignedCount}
      handleTeacherChange={handleTeacherChange}
      handleResetFilters={handleResetFilters}
      handleRefresh={handleRefresh}
    />
  );
}

const mapStateToProps = (state: AppState) => ({
  subjects: state.subjectTeacherConfig?.subjects || [],
  teachers: state.subjectTeacherConfig?.teachers || [],
  classesList: state.subjectTeacherConfig?.classesList || [],
  assignments: state.subjectTeacherConfig?.assignments || {},
  meta: state.subjectTeacherConfig?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 },
  loading: state.subjectTeacherConfig?.loading || false,
  savingSubjectId: state.subjectTeacherConfig?.savingSubjectId || null,
  savingAll: state.subjectTeacherConfig?.savingAll || false,
  successMsg: state.subjectTeacherConfig?.successMsg || null,
  error: state.subjectTeacherConfig?.error || null,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchSubjectTeacherConfig: (params?: FetchSubjectTeacherConfigParams) =>
    dispatch(fetchSubjectTeacherConfigRequest(params)),
  fetchConfigTeachers: () => dispatch(fetchConfigTeachersRequest()),
  fetchConfigClasses: () => dispatch(fetchConfigClassesRequest()),
  assignSubjectTeacher: (payload: AssignSubjectTeacherPayload) =>
    dispatch(assignSubjectTeacherRequest(payload)),
  clearMessages: () => dispatch(clearConfigMessages()),
});

export const SubjectTeacherConfigContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SubjectTeacherConfigContainerContent);

export default SubjectTeacherConfigContainer;
