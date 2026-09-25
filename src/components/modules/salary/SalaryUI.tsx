import React from "react";
import { SalaryUIProps } from "./types";
import { SalaryHeader } from "./SalaryHeader";
import { SalaryToolbar } from "./SalaryToolbar";
import { SalaryRecordsTable } from "./SalaryRecordsTable";
import { SalaryStructuresTable } from "./SalaryStructuresTable";
import { PayslipModal } from "./PayslipModal";
import { AddEditSalaryModal } from "./AddEditSalaryModal";
import { StaffSalaryStructureModal } from "./StaffSalaryStructureModal";
import { GeneratePayrollModal } from "./GeneratePayrollModal";
import { StaffSalaryStructureItem } from "../../../Services/salary.service";

export function SalaryUI({
  salaries,
  salaryStructures = [],
  teachers = [],
  loading = false,
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  isMySalary = false,
  selectedPayslip = null,
  setSelectedPayslip,
  showAddEditModal = false,
  setShowAddEditModal,
  editingSalary = null,
  formData = {},
  setFormData,
  formError,
  handleSaveSalary,
  handleDeleteSalary,
  handleOpenAddModal,
  handleOpenEditModal,
  handleExportExcel,
  handleExportSummary,
  userName = "Staff",
  activeSubTab = "registries",
  setActiveSubTab,
  showStructModal = false,
  setShowStructModal,
  editingStruct = null,
  structFormData = {},
  setStructFormData,
  handleSaveStruct,
  handleDeleteStruct,
  handleOpenAddStructModal,
  handleOpenEditStructModal,
  page: propsPage,
  setPage: setPropsPage,
  limit: propsLimit,
  setLimit: setPropsLimit,
  meta,
  showPayrollModal = false,
  setShowPayrollModal,
  payrollMonth = new Date().getMonth() + 1,
  setPayrollMonth,
  payrollYear = new Date().getFullYear(),
  setPayrollYear,
  handleGeneratePayroll,
  isGenerating = false,
}: SalaryUIProps) {
  // Stats calculation
  const stats = React.useMemo(() => {
    let earned = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let processingCount = 0;
    let totalPayroll = 0;

    salaries.forEach((s) => {
      const net = (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0);
      totalPayroll += net;
      if (s.status === "paid") {
        earned += net;
        paidCount++;
      } else if (s.status === "processing") {
        processingCount++;
      } else {
        pendingCount++;
      }
    });

    return {
      earned,
      paidCount,
      pendingCount,
      processingCount,
      totalCount: meta ? meta.total : salaries.length,
      totalPayroll,
    };
  }, [salaries, meta]);

  // Server or Client Pagination State for Salaries Table
  const [localPage, setLocalPage] = React.useState(1);
  const [localLimit, setLocalLimit] = React.useState(10);

  const currentPage = propsPage ?? localPage;
  const setCurrentPage = setPropsPage ?? setLocalPage;
  const pageSize = propsLimit ?? localLimit;
  const setPageSize = setPropsLimit ?? setLocalLimit;

  // Reset page when search/filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredSalaries = React.useMemo(() => {
    return salaries.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        (s.teacherName && s.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.subject && s.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.month && s.month.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [salaries, searchQuery, statusFilter]);

  const filteredSalaryStructures = React.useMemo(() => {
    return salaryStructures.filter((struct) => {
      const matchesSearch =
        !searchQuery ||
        (struct.teacherName && struct.teacherName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (struct.email && struct.email.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [salaryStructures, searchQuery]);

  const totalSalariesCount = meta ? meta.total : filteredSalaries.length;
  const totalPages = meta ? meta.totalPages : Math.max(1, Math.ceil(totalSalariesCount / pageSize));

  const paginatedSalaries = React.useMemo(() => {
    if (meta) return filteredSalaries;
    const start = (currentPage - 1) * pageSize;
    return filteredSalaries.slice(start, start + pageSize);
  }, [filteredSalaries, currentPage, pageSize, meta]);

  // Salary structures table pagination
  const [structPage, setStructPage] = React.useState(1);
  const [structPageSize, setStructPageSize] = React.useState(10);

  const totalStructsCount = filteredSalaryStructures.length;
  const totalStructPages = Math.max(1, Math.ceil(totalStructsCount / structPageSize));

  const paginatedStructs = React.useMemo(() => {
    const start = (structPage - 1) * structPageSize;
    return filteredSalaryStructures.slice(start, start + structPageSize);
  }, [filteredSalaryStructures, structPage, structPageSize]);

  const handleClosePayrollModal = React.useCallback(() => {
    if (setPayrollMonth) setPayrollMonth(new Date().getMonth() + 1);
    if (setPayrollYear) setPayrollYear(new Date().getFullYear());
    if (setShowPayrollModal) setShowPayrollModal(false);
  }, [setPayrollMonth, setPayrollYear, setShowPayrollModal]);

  const [autoPrefillStatus, setAutoPrefillStatus] = React.useState<{ type: string; message: string } | null>(null);

  const filteredTeachersForModal = React.useMemo(() => {
    return teachers;
  }, [teachers]);

  const selectedTeacher = React.useMemo(() => {
    if (!formData.teacherId) return null;
    return teachers.find((t: any) => String(t.id) === String(formData.teacherId)) || null;
  }, [formData.teacherId, teachers]);

  const selectedTeacherStructure = React.useMemo(() => {
    if (!formData.teacherId || !salaryStructures) return undefined;
    return salaryStructures.find((s) => String(s.teacherId) === String(formData.teacherId));
  }, [formData.teacherId, salaryStructures]);

  const handleSelectTeacherInModal = (teacher: any) => {
    if (!setFormData) return;
    const teacherId = String(teacher.id);
    const teacherName = teacher.name || "";
    const subject = teacher.department || teacher.subject || "";

    const foundStruct = salaryStructures?.find((s) => String(s.teacherId) === teacherId);

    if (foundStruct) {
      setFormData({
        ...formData,
        teacherId,
        teacherName,
        subject: subject || formData.subject,
        baseSalary: String(foundStruct.basicSalary || 0),
        allowances: String((Number(foundStruct.hra || 0) + Number(foundStruct.da || 0) + Number(foundStruct.otherAllowance || 0))),
        deductions: String((Number(foundStruct.pfDeduction || 0) + Number(foundStruct.taxDeduction || 0))),
      });
      setAutoPrefillStatus({
        type: "success",
        message: `Auto-filled figures from ${teacherName}'s configured salary structure!`,
      });
    } else {
      setFormData({
        ...formData,
        teacherId,
        teacherName,
        subject: subject || formData.subject,
      });
      setAutoPrefillStatus({
        type: "warning",
        message: `No salary structure configured for ${teacherName}. Please enter base salary & allowances manually.`,
      });
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header & Summary Cards */}
      <SalaryHeader
        isMySalary={isMySalary}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        error={error}
        stats={stats}
        handleExportExcel={handleExportExcel}
        handleExportSummary={handleExportSummary}
        handleOpenAddModal={handleOpenAddModal}
        handleOpenAddStructModal={handleOpenAddStructModal}
        setShowPayrollModal={setShowPayrollModal}
      />

      {/* Toolbar & Search */}
      <SalaryToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        activeSubTab={activeSubTab}
        filteredCount={activeSubTab === "registries" ? filteredSalaries.length : filteredSalaryStructures.length}
      />

      {/* Main Active Sub-Tab Table */}
      {activeSubTab === "registries" ? (
        <SalaryRecordsTable
          salaries={salaries}
          loading={loading}
          isMySalary={isMySalary}
          totalSalariesCount={totalSalariesCount}
          paginatedSalaries={paginatedSalaries}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          setSelectedPayslip={setSelectedPayslip}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteSalary={handleDeleteSalary}
        />
      ) : (
        <SalaryStructuresTable
          salaryStructures={salaryStructures}
          paginatedStructs={paginatedStructs}
          setShowPayrollModal={setShowPayrollModal}
          handleOpenEditStructModal={handleOpenEditStructModal}
          handleDeleteStruct={handleDeleteStruct}
          structPage={structPage}
          setStructPage={setStructPage}
          structTotalPages={totalStructPages}
          totalStructCount={totalStructsCount}
        />
      )}

      {/* Payslip Modal */}
      {selectedPayslip && setSelectedPayslip && (
        <PayslipModal
          selectedPayslip={selectedPayslip}
          setSelectedPayslip={setSelectedPayslip}
          userName={userName}
        />
      )}

      {/* Add / Edit Salary Record Modal */}
      {showAddEditModal && setShowAddEditModal && (
        <AddEditSalaryModal
          showAddEditModal={showAddEditModal}
          setShowAddEditModal={setShowAddEditModal}
          editingSalary={editingSalary}
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          handleSaveSalary={handleSaveSalary}
          teachers={teachers}
          salaryStructures={salaryStructures}
          filteredTeachersForModal={filteredTeachersForModal}
          handleSelectTeacherInModal={handleSelectTeacherInModal}
          selectedTeacher={selectedTeacher}
          selectedTeacherStructure={selectedTeacherStructure}
          autoPrefillStatus={autoPrefillStatus}
          setAutoPrefillStatus={setAutoPrefillStatus}
        />
      )}

      {/* Staff Salary Structure Modal */}
      {showStructModal && setShowStructModal && (
        <StaffSalaryStructureModal
          showStructModal={showStructModal}
          setShowStructModal={setShowStructModal}
          editingStruct={editingStruct}
          structFormData={structFormData}
          setStructFormData={setStructFormData}
          teachers={teachers}
          handleSaveStruct={handleSaveStruct}
        />
      )}

      {/* Generate Payroll Modal */}
      {showPayrollModal && setShowPayrollModal && (
        <GeneratePayrollModal
          showPayrollModal={showPayrollModal}
          setShowPayrollModal={setShowPayrollModal}
          payrollMonth={payrollMonth}
          setPayrollMonth={setPayrollMonth}
          payrollYear={payrollYear}
          setPayrollYear={setPayrollYear}
          handleGeneratePayroll={handleGeneratePayroll}
          isGenerating={isGenerating}
          salaryStructures={salaryStructures}
          handleClosePayrollModal={handleClosePayrollModal}
        />
      )}
    </div>
  );
}

export default SalaryUI;
