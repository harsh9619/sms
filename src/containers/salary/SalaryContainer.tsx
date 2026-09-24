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
import { generateSalarySummaryReport } from "../../lib/reportUtils";
import salaryService, { StaffSalaryStructureItem } from "../../Services/salary.service";
import type { SalaryRecord } from "../../types";

const mapStateToProps = (state: AppState) => ({
  allSalaries: state.salaries.salaries,
  meta: state.salaries.meta,
  teachers: state.teachers.teachers,
  loading: state.salaries.loading,
  error: state.salaries.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchSalariesRequest: (payload?: any) => dispatch(fetchSalariesRequest(payload)),
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
  meta,
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
  const schoolId = activeSchool?.id || "1";

  const [activeSubTab, setActiveSubTab] = useState<"registries" | "structures">("registries");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Staff Salary Structures State
  const [salaryStructures, setSalaryStructures] = useState<StaffSalaryStructureItem[]>([]);
  const [showStructModal, setShowStructModal] = useState(false);
  const [editingStruct, setEditingStruct] = useState<StaffSalaryStructureItem | null>(null);
  const [structFormData, setStructFormData] = useState<any>({});

  // Generate Monthly Payroll State
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [isGenerating, setIsGenerating] = useState(false);

  // Payslip detail modal
  const [selectedPayslip, setSelectedPayslip] = useState<SalaryRecord | null>(null);

  // Add/Edit Salary Record Modal
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryRecord | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  const fetchSalaryStructures = useCallback(async () => {
    try {
      const data = await salaryService.getSalaryStructures(schoolId);
      if (Array.isArray(data)) {
        setSalaryStructures(data);
      }
    } catch (err) {
      console.error("Failed to fetch salary structures:", err);
    }
  }, [schoolId]);

  useEffect(() => {
    const params: any = {
      schoolId,
      page,
      limit,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    };
    if (isMySalary || user?.role === "teacher") {
      params.teacherId = user?.id;
    }
    fetchSalariesRequest(params);
  }, [fetchSalariesRequest, schoolId, page, limit, searchQuery, statusFilter, isMySalary, user]);

  useEffect(() => {
    fetchTeachersRequest();
    fetchSalaryStructures();
  }, [fetchTeachersRequest, fetchSalaryStructures]);

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

  // Add / Edit Salary Record Handlers
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

  // Staff Salary Structure Handlers
  const handleOpenAddStructModal = useCallback(() => {
    setEditingStruct(null);
    setStructFormData({
      teacherId: "",
      basicSalary: "",
      hra: "",
      da: "",
      otherAllowance: "",
      pfDeduction: "",
      taxDeduction: "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      isActive: true,
    });
    setShowStructModal(true);
  }, []);

  const handleOpenEditStructModal = useCallback((item: StaffSalaryStructureItem) => {
    setEditingStruct(item);
    setStructFormData({ ...item });
    setShowStructModal(true);
  }, []);

  const handleSaveStruct = useCallback(async () => {
    if (!structFormData.teacherId || !structFormData.basicSalary) {
      toast.error("Please select a Teacher and enter Basic Salary!");
      return;
    }
    try {
      await salaryService.saveSalaryStructure(schoolId, {
        ...structFormData,
        id: editingStruct?.id,
        basicSalary: Number(structFormData.basicSalary || 0),
        hra: Number(structFormData.hra || 0),
        da: Number(structFormData.da || 0),
        otherAllowance: Number(structFormData.otherAllowance || 0),
        pfDeduction: Number(structFormData.pfDeduction || 0),
        taxDeduction: Number(structFormData.taxDeduction || 0),
      });
      toast.success(editingStruct ? "Staff salary structure updated" : "Staff salary structure saved");
      setShowStructModal(false);
      fetchSalaryStructures();
    } catch (err) {
      toast.error("Failed to save staff salary structure");
    }
  }, [schoolId, structFormData, editingStruct, fetchSalaryStructures]);

  const handleDeleteStruct = useCallback(
    async (id: string) => {
      if (window.confirm("Delete this staff salary structure setup?")) {
        try {
          await salaryService.deleteSalaryStructure(schoolId, id);
          toast.info("Staff salary structure deleted");
          fetchSalaryStructures();
        } catch (err) {
          toast.error("Failed to delete salary structure");
        }
      }
    },
    [schoolId, fetchSalaryStructures]
  );

  // Generate Monthly Payroll Handler
  const handleGeneratePayroll = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await salaryService.generateMonthlyPayroll(schoolId, payrollMonth, payrollYear);
      toast.success(res.message || "Monthly payroll generated successfully!");
      const now = new Date();
      setPayrollMonth(now.getMonth() + 1);
      setPayrollYear(now.getFullYear());
      setShowPayrollModal(false);
      fetchSalariesRequest();
    } catch (err) {
      toast.error("Failed to generate monthly payroll");
    } finally {
      setIsGenerating(false);
    }
  }, [schoolId, payrollMonth, payrollYear, fetchSalariesRequest]);

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
      salaryStructures={salaryStructures}
      teachers={teachers}
      loading={loading}
      error={error}
      page={page}
      setPage={setPage}
      limit={limit}
      setLimit={setLimit}
      meta={meta}
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
      activeSubTab={activeSubTab}
      setActiveSubTab={setActiveSubTab}
      showStructModal={showStructModal}
      setShowStructModal={setShowStructModal}
      editingStruct={editingStruct}
      structFormData={structFormData}
      setStructFormData={setStructFormData}
      handleSaveStruct={handleSaveStruct}
      handleDeleteStruct={handleDeleteStruct}
      handleOpenAddStructModal={handleOpenAddStructModal}
      handleOpenEditStructModal={handleOpenEditStructModal}
      showPayrollModal={showPayrollModal}
      setShowPayrollModal={setShowPayrollModal}
      payrollMonth={payrollMonth}
      setPayrollMonth={setPayrollMonth}
      payrollYear={payrollYear}
      setPayrollYear={setPayrollYear}
      handleGeneratePayroll={handleGeneratePayroll}
      isGenerating={isGenerating}
    />
  );
}

export const SalaryContainer = connector(SalaryContainerContent);
export default SalaryContainer;
