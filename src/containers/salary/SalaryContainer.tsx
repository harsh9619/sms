import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { AppState } from "../../saga/rootReducer";
import {
  fetchSalariesRequest,
  fetchTeachersRequest,
  createSalaryRequest,
  updateSalaryRequest,
  deleteSalaryRequest,
} from "../../saga";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { SalaryUI } from "../../components/modules/salary/SalaryUI";
import { generateSalaryReport, generateSalarySummaryReport } from "../../lib/reportUtils";
import type { SalaryRecord } from "../../types";

const mapStateToProps = (state: AppState) => ({
  allSalaries: state.salaries.salaries,
  teachers: state.teachers.teachers,
  loading: state.salaries.loading,
  error: state.salaries.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchSalariesRequest: () => dispatch(fetchSalariesRequest()),
  fetchTeachersRequest: () => dispatch(fetchTeachersRequest()),
  createSalaryRequest: (salary: any) => dispatch(createSalaryRequest(salary)),
  updateSalaryRequest: (payload: { id: string; salary?: any; sal?: any }) =>
    dispatch(updateSalaryRequest(payload)),
  deleteSalaryRequest: (id: string) => dispatch(deleteSalaryRequest(id)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export interface SalaryContainerProps extends PropsFromRedux {
  isMySalary?: boolean;
}

function SalaryContainerContent({
  allSalaries,
  teachers,
  loading,
  error,
  fetchSalariesRequest,
  fetchTeachersRequest,
  createSalaryRequest,
  updateSalaryRequest,
  deleteSalaryRequest,
  isMySalary = false,
}: SalaryContainerProps) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Payslip detail modal
  const [selectedPayslip, setSelectedPayslip] = useState<SalaryRecord | null>(null);

  // Add/Edit modal state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalariesRequest();
    fetchTeachersRequest();
  }, [fetchSalariesRequest, fetchTeachersRequest, activeSchool]);

  // Role & search filtered salaries
  const salaries = useMemo(() => {
    let list = allSalaries;

    if (isMySalary || user?.role === "teacher") {
      list = list.filter(
        (s: any) =>
          s.teacherId === user?.id ||
          (s.teacherName && user?.name && s.teacherName.toLowerCase() === user.name.toLowerCase())
      );
    }

    return list.filter((s) => {
      const matchesSearch =
        (s.teacherName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.month || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.year || "").includes(searchQuery);

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allSalaries, isMySalary, user, searchQuery, statusFilter]);

  // Add / Edit handlers
  const handleOpenAddModal = useCallback(() => {
    const now = new Date();
    setEditingSalary(null);
    setFormData({
      teacherName: "",
      subject: "",
      baseSalary: "",
      allowances: "",
      deductions: "",
      month: now.toLocaleString("default", { month: "long" }),
      year: now.getFullYear(),
      status: "pending",
    });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleOpenEditModal = useCallback((sal: SalaryRecord) => {
    setEditingSalary(sal);
    setFormData({ ...sal });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleSaveSalary = useCallback(() => {
    setFormError(null);
    if (!formData.teacherName || !formData.baseSalary) {
      setFormError("Teacher Name and Base Salary are required fields.");
      return;
    }

    const payload = {
      ...formData,
      baseSalary: Number(formData.baseSalary || 0),
      allowances: Number(formData.allowances || 0),
      deductions: Number(formData.deductions || 0),
      year: Number(formData.year || new Date().getFullYear()),
    };

    if (editingSalary) {
      updateSalaryRequest({ id: editingSalary.id, salary: payload });
      toast.success("Salary record updated successfully");
    } else {
      createSalaryRequest(payload);
      toast.success("Salary record created successfully");
    }

    setShowAddEditModal(false);
    setEditingSalary(null);
    setFormData({});
  }, [formData, editingSalary, createSalaryRequest, updateSalaryRequest]);

  const handleDeleteSalary = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this salary record?")) {
        deleteSalaryRequest(id);
        toast.info("Salary record deleted");
      }
    },
    [deleteSalaryRequest]
  );

  const handleExportExcel = useCallback(() => {
    try {
      const data = salaries.map((s) => ({
        "Teacher Name": s.teacherName || "",
        Subject: s.subject || "",
        Month: s.month || "",
        Year: s.year || "",
        "Base Salary (₹)": s.baseSalary || 0,
        "Allowances (₹)": s.allowances || 0,
        "Deductions (₹)": s.deductions || 0,
        "Net Salary (₹)": (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0),
        Status: s.status || "",
        "Paid Date": s.paidDate || "-",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Salary Registry");
      XLSX.writeFile(wb, `Salary_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      toast.error("Failed to export Excel report");
    }
  }, [salaries]);

  const handleExportSummary = useCallback(() => {
    if (salaries.length > 0) {
      generateSalarySummaryReport(salaries);
    } else {
      toast.warn("No salary records to export summary");
    }
  }, [salaries]);

  return (
    <SalaryUI
      salaries={salaries}
      loading={loading}
      error={error}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      isMySalary={isMySalary}
      selectedPayslip={selectedPayslip}
      setSelectedPayslip={setSelectedPayslip}
      showAddEditModal={showAddEditModal}
      setShowAddEditModal={setShowAddEditModal}
      editingSalary={editingSalary}
      formData={formData}
      setFormData={setFormData}
      formError={formError}
      handleSaveSalary={handleSaveSalary}
      handleDeleteSalary={handleDeleteSalary}
      handleOpenAddModal={handleOpenAddModal}
      handleOpenEditModal={handleOpenEditModal}
      handleExportExcel={handleExportExcel}
      handleExportSummary={handleExportSummary}
      userName={user?.name || "Faculty Member"}
    />
  );
}

export const SalaryContainer = connector(SalaryContainerContent);
export default SalaryContainer;
