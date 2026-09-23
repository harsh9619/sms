import React, { useState, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { toast } from 'react-toastify';
import { Dispatch } from "redux";
import * as XLSX from "xlsx";
import { AppState } from "../../saga/rootReducer";
import { StudentsUI } from "../../components/modules/students/StudentsUI";
import type { Student } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import studentService from "../../Services/student.service";
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
  const [limit, setLimit] = useState(50);

  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [formError, setFormError] = useState<any>({});
  const [castes, setCastes] = useState<any[]>([]);

  useEffect(() => {
    fetchClassesRequest();
    studentService.getCastes().then((res) => {
      if (Array.isArray(res)) {
        setCastes(res);
      }
    }).catch((err) => console.error("Error fetching castes:", err));
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
    const parentNameVal = formData.father_name || formData.parentName || formData.guardian_name || formData.parent_name || "";
    const parentPhoneVal = formData.parentPhone || formData.guardian_phone || formData.parent_phone || "";

    if (editingStudent) {
      updateStudentRequest({
        id: editingStudent.id,
        name: formData.name,
        email: formData.email !== undefined ? formData.email : undefined,
        phone: formData.phone,
        class_id: formData.class_id,
        division_master_id: formData.division_master_id,
        class: formData.class_name || formData.class,
        section: formData.division_name || formData.section,
        rollNumber: formData.roll_no || formData.rollNumber,
        roll_no: formData.roll_no || formData.rollNumber,
        parentName: parentNameVal,
        guardian_name: parentNameVal,
        parentPhone: parentPhoneVal,
        guardian_phone: parentPhoneVal,
        address: formData.address,
        dateOfBirth: formData.dob || formData.dateOfBirth,
        dob: formData.dob || formData.dateOfBirth,
        gender: formData.gender || "male",
        bloodGroup: formData.blood_group || formData.bloodGroup,
        blood_group: formData.blood_group || formData.bloodGroup,
        admissionDate: formData.admission_date || formData.admissionDate,
        admission_date: formData.admission_date || formData.admissionDate,

        // New Admission Form & Caste Columns
        caste_master_id: formData.caste_master_id,
        casteMasterId: formData.caste_master_id,
        caste_category: formData.caste_category,
        casteCategory: formData.caste_category,
        registration_no: formData.registration_no,
        registrationNo: formData.registration_no,
        academic_year: formData.academic_year,
        academicYear: formData.academic_year,
        aadhar_no: formData.aadhar_no,
        aadharNo: formData.aadhar_no,
        medium: formData.medium,
        father_name: formData.father_name || parentNameVal,
        fatherName: formData.father_name || parentNameVal,
        father_occupation: formData.father_occupation,
        fatherOccupation: formData.father_occupation,
        father_qualification: formData.father_qualification,
        fatherQualification: formData.father_qualification,
        mother_name: formData.mother_name,
        motherName: formData.mother_name,
        mother_occupation: formData.mother_occupation,
        motherOccupation: formData.mother_occupation,
        mother_qualification: formData.mother_qualification,
        motherQualification: formData.mother_qualification,
        whatsapp_no: formData.whatsapp_no,
        whatsappNo: formData.whatsapp_no,
        scholar_no: formData.scholar_no,
        scholarNo: formData.scholar_no,
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
        parentName: parentNameVal,
        guardian_name: parentNameVal,
        parentPhone: parentPhoneVal,
        guardian_phone: parentPhoneVal,
        address: formData.address || "",
        dateOfBirth: formData.dateOfBirth || formData.dob || "",
        dob: formData.dateOfBirth || formData.dob || "",
        gender: formData.gender || "male",
        bloodGroup: formData.bloodGroup || formData.blood_group || "O+",
        blood_group: formData.bloodGroup || formData.blood_group || "O+",
        admissionDate: formData.admissionDate || formData.admission_date || new Date().toISOString().split("T")[0],
        admission_date: formData.admissionDate || formData.admission_date || new Date().toISOString().split("T")[0],

        // New Admission Form & Caste Columns
        caste_master_id: formData.caste_master_id || null,
        casteMasterId: formData.caste_master_id || null,
        caste_category: formData.caste_category || "",
        casteCategory: formData.caste_category || "",
        registration_no: formData.registration_no || "",
        registrationNo: formData.registration_no || "",
        academic_year: formData.academic_year || "",
        academicYear: formData.academic_year || "",
        aadhar_no: formData.aadhar_no || "",
        aadharNo: formData.aadhar_no || "",
        medium: formData.medium || "English",
        father_name: formData.father_name || parentNameVal,
        fatherName: formData.father_name || parentNameVal,
        father_occupation: formData.father_occupation || "",
        fatherOccupation: formData.father_occupation || "",
        father_qualification: formData.father_qualification || "",
        fatherQualification: formData.father_qualification || "",
        mother_name: formData.mother_name || "",
        motherName: formData.mother_name || "",
        mother_occupation: formData.mother_occupation || "",
        motherOccupation: formData.mother_occupation || "",
        mother_qualification: formData.mother_qualification || "",
        motherQualification: formData.mother_qualification || "",
        whatsapp_no: formData.whatsapp_no || "",
        whatsappNo: formData.whatsapp_no || "",
        scholar_no: formData.scholar_no || "",
        scholarNo: formData.scholar_no || "",
      };
      createStudentRequest(newStudent);
    }
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

  const handleExportExcel = async () => {
    try {
      const exportData = await studentService.exportStudents({
        search: searchQuery,
        classId: selectedClass,
        sectionId: selectedSection,
      });

      const listToExport = exportData && exportData.length > 0 ? exportData : students;

      const data = listToExport.map((s: any) => ({
        "Roll No": s.roll_no || "",
        "Name": s.name || "",
        "Email": s.email || "",
        "Phone": s.phone || "",
        "Class": s.class_name || s.section ? `${s.class_name || ""} ${s.division_name || s.section || ""}`.trim() : "",
        "Gender": s.gender || "",
        "Guardian Name": s.guardian_name || s.parent_name || "",
        "Guardian Phone": s.guardian_phone || s.parent_phone || "",
        "Blood Group": s.blood_group || "",
        "Address": s.address || "",
        "Admission Date": s.admission_date || "",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "students_data.xlsx");
    } catch (err) {
      toast.error("Failed to export students data");
    }
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
      castes={castes}
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
      handleExportExcel={handleExportExcel}
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

