import React, { useState, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { toast } from 'react-toastify';
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { StudentsUI } from "../../components/modules/students/StudentsUI";
import type { Student } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import {
  fetchStudentsRequest,
  createStudentRequest,
  updateStudentRequest,
  deleteStudentRequest,
} from "../../saga";
import {
  StudentsContainerProps,
  CreateStudentRequestPayload,
  UpdateStudentRequestPayload,
  DeleteStudentRequestPayload,
  FetchStudentRequestPayload,
} from "../../saga/students/types";
import { fetchClassesRequest } from "../../saga/classes/actions";

function StudentsContainerContent(props: StudentsContainerProps) {
  const {
    students,
    meta,
    loading,
    fetchStudentSuccess,
    fetchStudentMsg,
    addEditStudentSuccess,
    addEditStudentMsg,
    deleteStudentSuccess,
    deleteStudentMsg,
    classes,
    fetchStudentsRequest,
    fetchClassesRequest,
    createStudentRequest,
    updateStudentRequest,
    deleteStudentRequest,
  } = props;

  const { activeSchool, activeAcademicYear } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSection, setSelectedSection] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [formError, setFormError] = useState<any>({});

  useEffect(() => {
    fetchClassesRequest();
  }, [fetchClassesRequest, activeSchool, activeAcademicYear]);

  useEffect(() => {
    if (addEditStudentSuccess || deleteStudentSuccess) {
      fetchStudentsRequest({
        page,
        limit,
        search: searchQuery,
        classId: selectedClass,
        divisionId: selectedSection,
      });

      setShowModal(false);
      setEditingStudent(null);
      setFormData({});
    }
    else if (addEditStudentSuccess === false && addEditStudentMsg) {
      toast.error(addEditStudentMsg)
      setFormError(prev => ({
        ...prev,
        email: addEditStudentMsg,
      }))
    }
    else if (deleteStudentSuccess === false && deleteStudentMsg) {
      toast.error(deleteStudentMsg)
    }
  }, [addEditStudentSuccess, addEditStudentMsg, deleteStudentSuccess, deleteStudentMsg]);


  useEffect(() => {
    fetchStudentsRequest({
      page,
      limit,
      search: searchQuery,
      classId: selectedClass,
      divisionId: selectedSection,
    });
  }, [fetchStudentsRequest, page, limit, searchQuery, selectedClass, selectedSection, activeSchool, activeAcademicYear]);

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setSelectedSection("all");
    setPage(1);
  };

  const handleSectionChange = (val: string) => {
    setSelectedSection(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setPage(1);
  };

  const handleSave = () => {
    if (editingStudent) {
      updateStudentRequest({
        id: editingStudent.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        class_id: formData.class_id,
        division_master_id: formData.division_master_id,
        class: formData.class_name,
        section: formData.division_name,
        rollNumber: formData.roll_no,
        roll_no: formData.roll_no,
        parentName: formData.guardian_name,
        guardian_name: formData.guardian_name,
        parentPhone: formData.guardian_phone,
        guardian_phone: formData.guardian_phone,
        address: formData.address,
        dateOfBirth: formData.dob,
        dob: formData.dob,
        gender: formData.gender || "male",
        bloodGroup: formData.blood_group,
        blood_group: formData.blood_group,
        admissionDate: formData.admission_date,
        admission_date: formData.admission_date,
      });
    } else {
      const newStudent: any = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        class_id: formData.class_id || null,
        division_master_id: formData.division_master_id || null,
        class: formData.class || formData.class_name || "",
        section: formData.section || formData.division_name || "",
        rollNumber: formData.rollNumber || formData.roll_no || `${Date.now()}`.slice(-4),
        roll_no: formData.rollNumber || formData.roll_no || `${Date.now()}`.slice(-4),
        parentName: formData.parentName || formData.guardian_name || "",
        guardian_name: formData.parentName || formData.guardian_name || "",
        parentPhone: formData.parentPhone || formData.guardian_phone || "",
        guardian_phone: formData.parentPhone || formData.guardian_phone || "",
        address: formData.address || "",
        dateOfBirth: formData.dateOfBirth || formData.dob || "",
        dob: formData.dateOfBirth || formData.dob || "",
        gender: formData.gender || "male",
        bloodGroup: formData.bloodGroup || formData.blood_group || "O+",
        blood_group: formData.bloodGroup || formData.blood_group || "O+",
        admissionDate: formData.admissionDate || formData.admission_date || new Date().toISOString().split("T")[0],
        admission_date: formData.admissionDate || formData.admission_date || new Date().toISOString().split("T")[0],
      };
      createStudentRequest(newStudent);
    }
    // setShowModal(false);
    // setEditingStudent(null);
    // setFormData({});
  };

  const handleDelete = (id: string) => {
    deleteStudentRequest({ id });
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
      students={students}
      meta={meta}
      loading={loading}
      error={addEditStudentMsg || deleteStudentMsg}
      searchQuery={searchQuery}
      setSearchQuery={handleSearchChange}
      selectedClass={selectedClass}
      setSelectedClass={handleClassChange}
      selectedSection={selectedSection}
      setSelectedSection={handleSectionChange}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={handleLimitChange}
      classes={classes}
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
      handleRefresh={() =>
        fetchStudentsRequest({
          page,
          limit,
          search: searchQuery,
          classId: selectedClass,
          divisionId: selectedSection,
        })
      }
    />
  );
}


const mapStateToProps = (state: AppState) => ({
  students: state.students.students,
  meta: state.students.meta,
  loading: state.students.loading,
  fetchStudentSuccess: state.students.fetchStudentSuccess,
  fetchStudentMsg: state.students.fetchStudentMsg,
  addEditStudentSuccess: state.students.addEditStudentSuccess,
  addEditStudentMsg: state.students.addEditStudentMsg,
  deleteStudentSuccess: state.students.deleteStudentSuccess,
  deleteStudentMsg: state.students.deleteStudentMsg,
  classes: state.classes.classes,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchStudentsRequest: (
    payload?: FetchStudentRequestPayload
  ) => dispatch(fetchStudentsRequest(payload)),
  fetchClassesRequest: () => dispatch(fetchClassesRequest()),
  createStudentRequest: (
    payload: CreateStudentRequestPayload
  ) => dispatch(createStudentRequest(payload)),
  updateStudentRequest: (
    payload: UpdateStudentRequestPayload
  ) => dispatch(updateStudentRequest(payload)),
  deleteStudentRequest: (
    payload: DeleteStudentRequestPayload
  ) => dispatch(deleteStudentRequest(payload)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);



export const StudentsContainer = mapper(StudentsContainerContent);
export default StudentsContainer;

