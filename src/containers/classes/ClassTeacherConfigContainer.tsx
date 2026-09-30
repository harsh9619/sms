import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../saga/rootReducer";
import {
  fetchClassTeacherConfigRequest,
  assignClassTeacherRequest,
  clearClassTeacherConfigMessages,
} from "../../saga/classTeacherConfig";
import { ClassTeacherConfigUI } from "../../components/modules/classes/ClassTeacherConfigUI";
import { ClassTeacherConfigItem } from "../../saga/classTeacherConfig/types";

export function ClassTeacherConfigContainer() {
  const dispatch = useDispatch();
  const {
    classTeachers,
    classesList,
    teachers,
    loading,
    savingClassTeacherId,
    successMsg,
    error,
  } = useSelector((state: RootState) => state.classTeacherConfig);

  const [assignments, setAssignments] = useState<Record<string, string>>({});

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("ALL");
  const [selectedTeacherFilter, setSelectedTeacherFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");

  useEffect(() => {
    dispatch(fetchClassTeacherConfigRequest());
  }, [dispatch]);

  // Sync local assignments map from store state
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    classTeachers.forEach((ct) => {
      if (ct.teacherId) {
        initialMap[String(ct.id)] = String(ct.teacherId);
      }
    });
    setAssignments(initialMap);
  }, [classTeachers]);

  // Clear feedback messages after 3s
  useEffect(() => {
    if (successMsg || error) {
      const timer = setTimeout(() => {
        dispatch(clearClassTeacherConfigMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, error, dispatch]);

  // Handle assign teacher action
  const handleTeacherChange = (id: string | number, teacherId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [String(id)]: teacherId,
    }));

    dispatch(
      assignClassTeacherRequest({
        id,
        teacherId: teacherId ? teacherId : null,
      })
    );
  };

  const handleRefresh = () => {
    dispatch(fetchClassTeacherConfigRequest());
  };

  // Available unique divisions
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    classTeachers.forEach((c) => {
      const divName = c.divisionName || c.classDivision || c.classSection;
      if (divName) set.add(divName);
    });
    return Array.from(set).sort();
  }, [classTeachers]);

  // Filtered Items Logic (Unassigned on Top!)
  const filteredClassTeachers = useMemo(() => {
    let result = [...classTeachers];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const className = (item.className || "").toLowerCase();
        const divisionName = (
          item.divisionName ||
          item.classDivision ||
          item.classSection ||
          ""
        ).toLowerCase();
        const teacherName = (item.teacherName || "").toLowerCase();
        return (
          className.includes(q) ||
          divisionName.includes(q) ||
          teacherName.includes(q)
        );
      });
    }

    // Class ID filter
    if (selectedClassId) {
      result = result.filter(
        (item) => String(item.classId) === String(selectedClassId)
      );
    }

    // Division filter
    if (selectedDivision !== "ALL") {
      result = result.filter((item) => {
        const divName = item.divisionName || item.classDivision || item.classSection;
        return String(divName) === String(selectedDivision);
      });
    }

    // Teacher filter
    if (selectedTeacherFilter !== "ALL") {
      result = result.filter(
        (item) => String(item.teacherId) === String(selectedTeacherFilter)
      );
    }

    // Status filter
    if (selectedStatusFilter === "ASSIGNED") {
      result = result.filter((item) => Boolean(item.teacherId));
    } else if (selectedStatusFilter === "UNASSIGNED") {
      result = result.filter((item) => !item.teacherId);
    }

    // Unassigned items on top!
    result.sort((a, b) => {
      const aAssigned = Boolean(a.teacherId);
      const bAssigned = Boolean(b.teacherId);

      if (!aAssigned && bAssigned) return -1;
      if (aAssigned && !bAssigned) return 1;

      // Secondary sort by Class Name & Division
      const classA = (a.className || "").localeCompare(b.className || "");
      if (classA !== 0) return classA;
      const divA = (a.divisionName || a.classDivision || "").localeCompare(
        b.divisionName || b.classDivision || ""
      );
      return divA;
    });

    return result;
  }, [
    classTeachers,
    searchQuery,
    selectedClassId,
    selectedDivision,
    selectedTeacherFilter,
    selectedStatusFilter,
  ]);

  // Counts
  const assignedCount = useMemo(
    () => classTeachers.filter((c) => Boolean(c.teacherId)).length,
    [classTeachers]
  );
  const unassignedCount = useMemo(
    () => classTeachers.filter((c) => !c.teacherId).length,
    [classTeachers]
  );

  // Pagination slicing
  const paginatedClassTeachers = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredClassTeachers.slice(startIndex, startIndex + limit);
  }, [filteredClassTeachers, page, limit]);

  // Reset filter handler
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedClassId("");
    setSelectedDivision("ALL");
    setSelectedTeacherFilter("ALL");
    setSelectedStatusFilter("ALL");
    setPage(1);
  };

  return (
    <ClassTeacherConfigUI
      classTeachers={classTeachers}
      filteredClassTeachers={filteredClassTeachers}
      paginatedClassTeachers={paginatedClassTeachers}
      teachers={teachers}
      classesList={classesList}
      assignments={assignments}
      loading={loading}
      savingClassTeacherId={savingClassTeacherId}
      successMsg={successMsg}
      error={error}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      totalItems={filteredClassTeachers.length}
      searchQuery={searchQuery}
      setSearchQuery={(q) => {
        setSearchQuery(q);
        setPage(1);
      }}
      selectedClassId={selectedClassId}
      setSelectedClassId={(id) => {
        setSelectedClassId(id);
        setPage(1);
      }}
      selectedDivision={selectedDivision}
      setSelectedDivision={(div) => {
        setSelectedDivision(div);
        setPage(1);
      }}
      selectedTeacherFilter={selectedTeacherFilter}
      setSelectedTeacherFilter={(t) => {
        setSelectedTeacherFilter(t);
        setPage(1);
      }}
      selectedStatusFilter={selectedStatusFilter}
      setSelectedStatusFilter={(s) => {
        setSelectedStatusFilter(s);
        setPage(1);
      }}
      availableDivisions={availableDivisions}
      assignedCount={assignedCount}
      unassignedCount={unassignedCount}
      handleTeacherChange={handleTeacherChange}
      handleResetFilters={handleResetFilters}
      handleRefresh={handleRefresh}
    />
  );
}

export default ClassTeacherConfigContainer;
