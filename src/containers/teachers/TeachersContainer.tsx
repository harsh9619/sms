import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../saga/hooks";
import { fetchTeachersRequest } from "../../saga";
import type { Teacher } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import * as XLSX from "xlsx";
import { TeachersUI } from "../../components/modules/teachers/TeachersUI";

export function TeachersContainer() {
  const dispatch = useAppDispatch();
  const reduxTeachers = useAppSelector((state) => state.teachers.teachers);
  const { activeSchool } = useSchool();
  const [extraTeachers, setExtraTeachers] = useState<Teacher[]>([]);
  const teachers = useMemo(() => [...reduxTeachers, ...extraTeachers], [reduxTeachers, extraTeachers]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [importStatus, setImportStatus] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t: any) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [teachers, searchQuery]);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    dispatch(fetchTeachersRequest());
  }, [dispatch, activeSchool]);

  const handleSave = () => {
    if (editingTeacher) {
      setExtraTeachers((prev) =>
        prev.map((t) => (t.id === editingTeacher.id ? { ...t, ...formData } as Teacher : t))
      );
    } else {
      const newTeacher: Teacher = {
        id: `t${Date.now()}`,
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        subject: formData.subject || "",
        department: formData.department || "",
        qualification: formData.qualification || "",
        experience: formData.experience || "",
        address: formData.address || "",
        joinDate: new Date().toISOString().split("T")[0],
        salary: formData.salary,
      };
      setExtraTeachers((prev) => [...prev, newTeacher]);
    }
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      setExtraTeachers((prev) => prev.filter((t: any) => t.id !== id));
    }
  };

  const handleExportExcel = () => {
    const data = teachers.map((t) => ({
      Name: t.name,
      Email: t.email,
      Phone: t.phone,
      Subject: t.subject,
      Department: t.department,
      Qualification: t.qualification,
      Experience: t.experience,
      Address: t.address,
      Salary: t.salary || "",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Teachers");
    XLSX.writeFile(wb, "teachers_data.xlsx");
  };

  return (
    <TeachersUI
      teachers={teachers}
      filteredTeachers={filteredTeachers}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      showModal={showModal}
      setShowModal={setShowModal}
      showDetail={showDetail}
      setShowDetail={setShowDetail}
      editingTeacher={editingTeacher}
      setEditingTeacher={setEditingTeacher}
      formData={formData}
      setFormData={setFormData}
      importStatus={importStatus}
      setImportStatus={setImportStatus}
      getInitials={getInitials}
      handleSave={handleSave}
      handleDelete={handleDelete}
      handleExportExcel={handleExportExcel}
    />
  );
}

export default TeachersContainer;
