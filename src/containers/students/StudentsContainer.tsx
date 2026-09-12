import React, { useState, useEffect, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { StudentsUI } from "../../components/modules/students/StudentsUI";
import type { Student } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import { useAppDispatch, useAppSelector } from "../../saga/hooks";
import {
  fetchStudentsRequest,
  createStudentRequest,
  updateStudentRequest,
  deleteStudentRequest,
} from "../../saga";
import { fetchClassesRequest } from "../../saga/classes/actions";

const mapStateToProps = (state: AppState) => ({
  reduxStudents: state.students.students,
  reduxClasses: state.classes.classes,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchStudentsRequest: () => dispatch(fetchStudentsRequest()),
  fetchClassesRequest: () => dispatch(fetchClassesRequest()),
  createStudentRequest: (student: any) => dispatch(createStudentRequest(student)),
  updateStudentRequest: (payload: any) => dispatch(updateStudentRequest(payload)),
  deleteStudentRequest: (id: string) => dispatch(deleteStudentRequest(id)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof mapper>;

function StudentsContainerContent({
  reduxStudents,
  reduxClasses,
  fetchStudentsRequest,
  fetchClassesRequest,
  createStudentRequest,
  updateStudentRequest,
  deleteStudentRequest,
}: PropsFromRedux) {
  const { activeSchool } = useSchool();
  const [extraStudents] = useState<Student[]>([]);
  const students = useMemo(() => [...reduxStudents, ...extraStudents], [reduxStudents, extraStudents]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});

  useEffect(() => {
    fetchStudentsRequest();
    fetchClassesRequest();
  }, [fetchStudentsRequest, fetchClassesRequest, activeSchool]);

  const classes = useMemo(() => {
    const set = new Set(students.map((s) => s.class));
    return Array.from(set).sort();
  }, [students]);

  const sections = useMemo(() => {
    const set = new Set(students.map((s) => s.section));
    return Array.from(set).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClass === "all" || student.class === selectedClass;
      const matchesSection = selectedSection === "all" || student.section === selectedSection;
      return matchesSearch && matchesClass && matchesSection;
    });
  }, [students, searchQuery, selectedClass, selectedSection]);

  const handleSave = () => {
    if (editingStudent) {
      updateStudentRequest({ id: editingStudent.id, ...formData });
    } else {
      const newStudent: any = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        class: formData.class || "10",
        section: formData.section || "A",
        rollNumber: formData.rollNumber || `${Date.now()}`.slice(-4),
        parentName: formData.parentName || "",
        parentPhone: formData.parentPhone || "",
        address: formData.address || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: formData.gender || "male",
        bloodGroup: formData.bloodGroup || "O+",
        enrollmentDate: new Date().toISOString().split("T")[0],
        status: "active",
      };
      createStudentRequest(newStudent);
    }
    setShowModal(false);
    setEditingStudent(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentRequest(id);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({});
    setShowModal(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowModal(true);
  };

  return (
    <StudentsUI
      filteredStudents={filteredStudents}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      selectedClass={selectedClass}
      setSelectedClass={setSelectedClass}
      selectedSection={selectedSection}
      setSelectedSection={setSelectedSection}
      classes={classes}
      sections={sections}
      showModal={showModal}
      setShowModal={setShowModal}
      showDetail={showDetail}
      setShowDetail={setShowDetail}
      editingStudent={editingStudent}
      formData={formData}
      setFormData={setFormData}
      handleSave={handleSave}
      handleDelete={handleDelete}
      handleOpenAddModal={handleOpenAddModal}
      handleOpenEditModal={handleOpenEditModal}
    />
  );
}

export const StudentsContainer = mapper(StudentsContainerContent);
export default StudentsContainer;
