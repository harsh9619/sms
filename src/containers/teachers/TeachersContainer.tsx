import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { Dispatch } from "redux";
import { AppState } from "../../saga/rootReducer";
import { Teacher } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import {
  fetchTeachersRequest,
  createTeacherRequest,
  updateTeacherRequest,
  deleteTeacherRequest,
} from "../../saga";
import {
  TeachersContainerProps,
  CreateTeacherRequestPayload,
  UpdateTeacherRequestPayload,
  DeleteTeacherRequestPayload,
  FetchTeacherRequestPayload,
} from "../../saga/teachers/types";
import { TeachersUI } from "../../components/modules/teachers/TeachersUI";
import * as XLSX from "xlsx";

function TeachersContainerContent(props: TeachersContainerProps) {
  const {
    teachers,
    meta,
    loading,
    fetchTeacherSuccess,
    fetchTeacherMsg,
    addEditTeacherSuccess,
    addEditTeacherMsg,
    deleteTeacherSuccess,
    deleteTeacherMsg,
    fetchTeachersRequest,
    createTeacherRequest,
    updateTeacherRequest,
    deleteTeacherRequest,
  } = props;

  const { activeSchool } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({});
  const [formError, setFormError] = useState<any>({});

  useEffect(() => {
    fetchTeachersRequest({
      page,
      limit,
      search: searchQuery,
    });
  }, [fetchTeachersRequest, page, limit, searchQuery, activeSchool]);

  useEffect(() => {
    if (addEditTeacherSuccess || deleteTeacherSuccess) {
      fetchTeachersRequest({
        page,
        limit,
        search: searchQuery,
      });
      setShowModal(false);
      setEditingTeacher(null);
      setFormData({});
    } else if (addEditTeacherSuccess === false && addEditTeacherMsg) {
      toast.error(addEditTeacherMsg);
      setFormError((prev: any) => ({
        ...prev,
        email: addEditTeacherMsg,
      }));
    } else if (deleteTeacherSuccess === false && deleteTeacherMsg) {
      toast.error(deleteTeacherMsg);
    }
  }, [addEditTeacherSuccess, addEditTeacherMsg, deleteTeacherSuccess, deleteTeacherMsg]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleLimitChange = (val: number) => {
    setLimit(val);
    setPage(1);
  };

  const getInitials = (name: string) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "TC";

  const handleSave = () => {
    if (editingTeacher) {
      updateTeacherRequest({
        id: editingTeacher.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        department: formData.department,
        qualification: formData.qualification,
        experience: formData.experience,
        address: formData.address,
        salary: formData.salary ? Number(formData.salary) : undefined,
      });
    } else {
      const newTeacher: any = {
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        subject: formData.subject || "",
        department: formData.department || "",
        qualification: formData.qualification || "",
        experience: formData.experience || "",
        address: formData.address || "",
        salary: formData.salary ? Number(formData.salary) : undefined,
      };
      createTeacherRequest(newTeacher);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      deleteTeacherRequest({ id });
    }
  };

  const handleOpenAddModal = () => {
    setEditingTeacher(null);
    setFormData({});
    setFormError({});
    setShowModal(true);
  };

  const handleOpenEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData(teacher);
    setFormError({});
    setShowModal(true);
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
      meta={meta}
      loading={loading}
      error={formError}
      searchQuery={searchQuery}
      setSearchQuery={handleSearchChange}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={handleLimitChange}
      showModal={showModal}
      setShowModal={setShowModal}
      showDetail={showDetail}
      setShowDetail={setShowDetail}
      editingTeacher={editingTeacher}
      formData={formData}
      setFormData={setFormData}
      getInitials={getInitials}
      handleSave={handleSave}
      handleDelete={handleDelete}
      handleOpenAddModal={handleOpenAddModal}
      handleOpenEditModal={handleOpenEditModal}
      handleExportExcel={handleExportExcel}
    />
  );
}

const mapStateToProps = (state: AppState) => ({
  teachers: state.teachers.teachers,
  meta: state.teachers.meta,
  loading: state.teachers.loading,
  fetchTeacherSuccess: state.teachers.fetchTeacherSuccess,
  fetchTeacherMsg: state.teachers.fetchTeacherMsg,
  addEditTeacherSuccess: state.teachers.addEditTeacherSuccess,
  addEditTeacherMsg: state.teachers.addEditTeacherMsg,
  deleteTeacherSuccess: state.teachers.deleteTeacherSuccess,
  deleteTeacherMsg: state.teachers.deleteTeacherMsg,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchTeachersRequest: (payload?: FetchTeacherRequestPayload) =>
    dispatch(fetchTeachersRequest(payload)),
  createTeacherRequest: (payload: CreateTeacherRequestPayload) =>
    dispatch(createTeacherRequest(payload)),
  updateTeacherRequest: (payload: UpdateTeacherRequestPayload) =>
    dispatch(updateTeacherRequest(payload)),
  deleteTeacherRequest: (payload: DeleteTeacherRequestPayload) =>
    dispatch(deleteTeacherRequest(payload)),
});

const mapper = connect(mapStateToProps, mapDispatchToProps);

export const TeachersContainer = mapper(TeachersContainerContent);
export default TeachersContainer;
