import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  Calendar,
  Receipt,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { SalaryRecord } from "../../../types";
import salaryService, { StaffSalaryStructureItem } from "../../../Services/salary.service";

export interface SalaryUIProps {
  salaries: SalaryRecord[];
  salaryStructures?: StaffSalaryStructureItem[];
  teachers?: any[];
  loading?: boolean;
  error?: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  isMySalary?: boolean;
  selectedPayslip?: SalaryRecord | null;
  setSelectedPayslip?: (sal: SalaryRecord | null) => void;

  // Add/Edit Salary Record Modal
  showAddEditModal?: boolean;
  setShowAddEditModal?: (show: boolean) => void;
  editingSalary?: SalaryRecord | null;
  formData?: any;
  setFormData?: (data: any) => void;
  formError?: string | null;
  handleSaveSalary?: () => void;
  handleDeleteSalary?: (id: string) => void;
  handleOpenAddModal?: () => void;
  handleOpenEditModal?: (sal: SalaryRecord) => void;
  handleExportExcel?: () => void;
  handleExportSummary?: () => void;
  userName?: string;

  // Sub-Tab Switcher
  activeSubTab?: "registries" | "structures";
  setActiveSubTab?: (tab: "registries" | "structures") => void;

  // Staff Salary Structure Actions
  showStructModal?: boolean;
  setShowStructModal?: (show: boolean) => void;
  editingStruct?: StaffSalaryStructureItem | null;
  structFormData?: any;
  setStructFormData?: (data: any) => void;
  handleSaveStruct?: () => void;
  handleDeleteStruct?: (id: string) => void;
  handleOpenAddStructModal?: () => void;
  handleOpenEditStructModal?: (item: StaffSalaryStructureItem) => void;

  // Server-side Pagination & Query Params
  page?: number;
  setPage?: (page: number) => void;
  limit?: number;
  setLimit?: (limit: number) => void;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Generate Monthly Payroll Modal
  showPayrollModal?: boolean;
  setShowPayrollModal?: (show: boolean) => void;
  payrollMonth?: number;
  setPayrollMonth?: (val: number) => void;
  payrollYear?: number;
  setPayrollYear?: (val: number) => void;
  handleGeneratePayroll?: () => void;
  isGenerating?: boolean;
}

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

  const totalSalariesCount = meta ? meta.total : salaries.length;
  const totalPages = meta ? meta.totalPages : Math.max(1, Math.ceil(totalSalariesCount / pageSize));

  const paginatedSalaries = React.useMemo(() => {
    if (meta) return salaries;
    const start = (currentPage - 1) * pageSize;
    return salaries.slice(start, start + pageSize);
  }, [salaries, currentPage, pageSize, meta]);

  // Pagination State for Salary Structures Table
  const [structPage, setStructPage] = React.useState(1);
  const [structPageSize, setStructPageSize] = React.useState(10);

  const handleClosePayrollModal = React.useCallback(() => {
    const now = new Date();
    if (setPayrollMonth) setPayrollMonth(now.getMonth() + 1);
    if (setPayrollYear) setPayrollYear(now.getFullYear());
    if (setShowPayrollModal) setShowPayrollModal(false);
  }, [setPayrollMonth, setPayrollYear, setShowPayrollModal]);

  const totalStructsCount = salaryStructures.length;
  const totalStructPages = Math.max(1, Math.ceil(totalStructsCount / structPageSize));

  const paginatedStructs = React.useMemo(() => {
    const start = (structPage - 1) * structPageSize;
    return salaryStructures.slice(start, start + structPageSize);
  }, [salaryStructures, structPage, structPageSize]);

  // Teacher selection & instant search for Add/Edit Modal (No debounce)
  const [modalTeacherSearch, setModalTeacherSearch] = React.useState("");
  const [autoPrefillStatus, setAutoPrefillStatus] = React.useState<{
    type: "success" | "warning" | null;
    message: string;
  } | null>(null);

  // Sync modal search state when modal opens/changes
  React.useEffect(() => {
    if (showAddEditModal) {
      // setModalTeacherSearch(formData.teacherName || "");
      setAutoPrefillStatus(null);
    }
  }, [showAddEditModal, formData.teacherName]);

  const filteredTeachersForModal = React.useMemo(() => {
    if (!modalTeacherSearch.trim()) return teachers;
    const q = modalTeacherSearch.toLowerCase();
    return teachers.filter(
      (t: any) =>
        (t.name || "").toLowerCase().includes(q) ||
        (t.subject || t.department || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q)
    );
  }, [teachers, modalTeacherSearch]);

  const selectedTeacher = React.useMemo(() => {
    if (!formData.teacherId && !formData.teacherName) return null;
    return (
      teachers.find(
        (t: any) =>
          String(t.id) === String(formData.teacherId) ||
          (t.name && formData.teacherName && t.name.toLowerCase() === formData.teacherName.toLowerCase())
      ) || null
    );
  }, [teachers, formData.teacherId, formData.teacherName]);

  const selectedTeacherStructure = React.useMemo(() => {
    if (!selectedTeacher && !formData.teacherId) return null;
    const tid = selectedTeacher ? String(selectedTeacher.id) : String(formData.teacherId);
    const tname = selectedTeacher ? selectedTeacher.name : formData.teacherName;

    return (
      salaryStructures.find(
        (s) =>
          String(s.teacherId) === tid ||
          (s.teacherName && tname && s.teacherName.toLowerCase() === tname.toLowerCase())
      ) || null
    );
  }, [salaryStructures, selectedTeacher, formData.teacherId, formData.teacherName]);

  const handleSelectTeacherInModal = (teacher: any) => {
    const teacherId = String(teacher.id || "");
    const teacherName = teacher.name || "";
    const subject = teacher.subject || teacher.department || formData.subject || "";

    // Search matching structure
    const struct = salaryStructures.find(
      (s) =>
        String(s.teacherId) === teacherId ||
        (s.teacherName && teacherName && s.teacherName.toLowerCase() === teacherName.toLowerCase())
    );

    if (struct) {
      const basic = Number(struct.basicSalary || 0);
      const allowances =
        Number(struct.hra || 0) + Number(struct.da || 0) + Number(struct.otherAllowance || 0);
      const deductions =
        Number(struct.pfDeduction || 0) + Number(struct.taxDeduction || 0);

      if (setFormData) {
        setFormData({
          ...formData,
          teacherId,
          teacherName,
          subject: subject || "Faculty",
          baseSalary: basic,
          allowances: allowances,
          deductions: deductions,
        });
      }
      setAutoPrefillStatus({
        type: "success",
        message: `Auto-prefilled from Staff Salary Structure (Base: ₹${basic.toLocaleString()}, Allowances: ₹${allowances.toLocaleString()}, Deductions: ₹${deductions.toLocaleString()})`,
      });
    } else {
      if (setFormData) {
        setFormData({
          ...formData,
          teacherId,
          teacherName,
          subject: subject || "Faculty",
          baseSalary: teacher.salary ? Number(teacher.salary) : formData.baseSalary || "",
        });
      }
      setAutoPrefillStatus({
        type: "warning",
        message: "No pre-configured salary structure found for this teacher. Amounts can be entered manually.",
      });
    }
    // setModalTeacherSearch(teacherName);
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "processing") return <Clock className="h-4 w-4 text-info" />;
    return <AlertCircle className="h-4 w-4 text-warning" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "processing") return "info";
    return "warning";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            {isMySalary ? "My Salary & Payslips" : "Payroll & Salary Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMySalary
              ? "Track your monthly earnings, allowances, tax deductions, and download payslips"
              : "Manage staff payroll, teacher base salaries, allowances, deductions, and monthly payslips"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {handleExportExcel && (
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
          )}
          {handleExportSummary && (
            <Button variant="outline" size="sm" onClick={handleExportSummary}>
              Summary Report
            </Button>
          )}
          {!isMySalary && activeSubTab === "registries" && handleOpenAddModal && (
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Payroll Entry
            </Button>
          )}
          {!isMySalary && activeSubTab === "structures" && handleOpenAddStructModal && (
            <Button size="sm" onClick={handleOpenAddStructModal}>
              <Plus className="h-4 w-4 mr-2" /> Configure Salary Structure
            </Button>
          )}
          {!isMySalary && activeSubTab === "structures" && setShowPayrollModal && (
            <Button size="sm" variant="secondary" onClick={() => setShowPayrollModal(true)}>
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> Generate Monthly Payroll
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Admin Sub-Tabs Switcher */}
      {!isMySalary && setActiveSubTab && (
        <div className="flex gap-2 border-b border-border/60 pb-1 text-left">
          <button
            onClick={() => setActiveSubTab("registries")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === "registries"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Receipt className="h-4 w-4" />
            Payroll Registries & Payslips
          </button>
          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === "structures"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Users className="h-4 w-4" />
            Staff Salary Structures
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {activeSubTab === "registries" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <Card className="hover-lift">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">
                {isMySalary ? "Total Net Earnings (YTD)" : "Total Net Payroll"}
              </p>
              <p className="text-2xl font-black text-success mt-1.5">
                ₹{stats.earned.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.paidCount} Paid Pay Periods
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-info">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Total Pay Records</p>
              <p className="text-2xl font-black text-foreground mt-1.5">{stats.totalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{stats.totalPayroll.toLocaleString()} Gross Value
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-warning">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Pending Approvals</p>
              <p className="text-2xl font-black text-warning mt-1.5">{stats.pendingCount}</p>
              <p className="text-xs text-warning mt-1">Awaiting Disbursal</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-primary">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">In Processing</p>
              <p className="text-2xl font-black text-primary mt-1.5">{stats.processingCount}</p>
              <p className="text-xs text-primary mt-1">Bank Processing</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- PAYROLL REGISTRIES TAB CONTENT --- */}
      {activeSubTab === "registries" && (
        <>
          {/* Filters & Controls */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder={
                      isMySalary
                        ? "Search by month, year, or subject..."
                        : "Search by teacher name or subject..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>

                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="text-left">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Payslip Registries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-left">
              {loading ? (
                <div className="text-center py-12">
                  <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs">Loading payroll registry...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                        {!isMySalary && <th className="px-6 py-3.5 text-left">Teacher Name</th>}
                        <th className="px-6 py-3.5 text-left">Period / Subject</th>
                        <th className="px-6 py-3.5 text-left">Basic Salary</th>
                        <th className="px-6 py-3.5 text-left">Allowances</th>
                        <th className="px-6 py-3.5 text-left">Deductions</th>
                        <th className="px-6 py-3.5 text-left">Net Salary</th>
                        <th className="px-6 py-3.5 text-left">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSalaries.map((s) => {
                        const net = (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0);
                        return (
                          <tr key={s.id} className="border-b hover:bg-muted/10 transition-colors">
                            {!isMySalary && (
                              <td className="px-6 py-4 font-bold text-foreground">
                                {s.teacherName || "Teacher"}
                                <div className="text-xs text-muted-foreground font-normal space-y-0.5 mt-0.5">
                                  {s.teacherEmail && <div>{s.teacherEmail}</div>}
                                  {s.teacherPhone && <div>Ph: {s.teacherPhone}</div>}
                                  {s.subject && <div className="text-primary font-medium">{s.subject}</div>}
                                </div>
                              </td>
                            )}
                            <td className="px-6 py-4 font-bold">
                              {s.month} {s.year}
                              {isMySalary && s.subject && (
                                <span className="text-xs text-muted-foreground font-normal block">
                                  {s.subject}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">₹{Number(s.baseSalary || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-success">
                              + ₹{Number(s.allowances || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-destructive">
                              - ₹{Number(s.deductions || 0).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 font-black text-foreground">
                              ₹{net.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(s.status)}
                                <Badge variant={getStatusBadgeVariant(s.status)}>
                                  {s.status}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {s?.status?.toLowerCase() === "paid" && <Button
                                  variant="ghost"
                                  size="icon"
                                  className="hover:text-primary h-8 w-8"
                                  onClick={() => salaryService.downloadSalarySlipPdf(s.id, s)}
                                  title="Download Salary Slip PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>}
                                {/* {setSelectedPayslip && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 font-semibold"
                                    onClick={() => setSelectedPayslip(s)}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" /> View Payslip
                                  </Button>
                                )} */}
                                {!isMySalary && s?.status?.toLowerCase() !== "paid" && (
                                  <>
                                    {handleOpenEditModal && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleOpenEditModal(s)}
                                        className="hover:text-primary h-8 w-8"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {handleDeleteSalary && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteSalary(s.id)}
                                        className="hover:text-destructive h-8 w-8"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {salaries.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground/60 font-medium">
                      No payroll logs recorded matching search criteria.
                    </div>
                  )}
                </div>
              )}

              {/* Salary Registries Pagination Toolbar */}
              {totalSalariesCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-t border-border/60 bg-card rounded-b-xl">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(1)}
                      title="First Page"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                              <Button
                                variant={currentPage === p ? "default" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0 text-xs font-semibold"
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </Button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      title="Last Page"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* --- STAFF SALARY STRUCTURES TAB CONTENT --- */}
      {activeSubTab === "structures" && (
        <Card>
          <CardHeader className="text-left flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Staff Salary Structure Setup
            </CardTitle>
            {setShowPayrollModal && (
              <Button size="sm" variant="outline" onClick={() => setShowPayrollModal(true)}>
                <Sparkles className="h-4 w-4 mr-2 text-primary" /> Generate Monthly Payroll
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto text-left">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <th className="px-6 py-3.5 text-left">Staff Member</th>
                    <th className="px-6 py-3.5 text-left">Basic Salary</th>
                    <th className="px-6 py-3.5 text-left">HRA / DA</th>
                    <th className="px-6 py-3.5 text-left">Allowances</th>
                    <th className="px-6 py-3.5 text-left">PF & Tax Deductions</th>
                    <th className="px-6 py-3.5 text-left">Gross Pay</th>
                    <th className="px-6 py-3.5 text-left">Net Monthly Pay</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStructs.map((struct) => (
                    <tr key={struct.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">
                        {struct.teacherName || "Staff Member"}
                        <div className="text-xs text-muted-foreground font-normal space-y-0.5 mt-0.5">
                          {struct.email && <div>{struct.email}</div>}
                          {struct.phone && <div>Ph: {struct.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">₹{Number(struct.basicSalary).toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-success">
                        + ₹{(Number(struct.hra || 0) + Number(struct.da || 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-success">
                        + ₹{Number(struct.otherAllowance || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-destructive">
                        - ₹{(Number(struct.pfDeduction || 0) + Number(struct.taxDeduction || 0)).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold">₹{Number(struct.grossSalary || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 font-black text-primary">₹{Number(struct.netSalary || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge variant={struct.isActive ? "success" : "secondary"}>
                          {struct.isActive ? "Active Structure" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {handleOpenEditStructModal && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditStructModal(struct)}
                              className="hover:text-primary h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {handleDeleteStruct && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteStruct(struct.id)}
                              className="hover:text-destructive h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salaryStructures.length === 0 && (
                <div className="text-center py-16 text-muted-foreground/60 font-medium">
                  No staff salary structures configured yet. Click "Configure Salary Structure" to add one.
                </div>
              )}
            </div>

            {/* Salary Structures Pagination Toolbar */}
            {totalStructsCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-t border-border/60 bg-card rounded-b-xl">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={structPage <= 1}
                    onClick={() => setStructPage(1)}
                    title="First Page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    disabled={structPage <= 1}
                    onClick={() => setStructPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalStructPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalStructPages || Math.abs(p - structPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                            <Button
                              variant={structPage === p ? "default" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0 text-xs font-semibold"
                              onClick={() => setStructPage(p)}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    disabled={structPage >= totalStructPages}
                    onClick={() => setStructPage((p) => Math.min(totalStructPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={structPage >= totalStructPages}
                    onClick={() => setStructPage(totalStructPages)}
                    title="Last Page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Payslip Receipt Modal */}
      {selectedPayslip && setSelectedPayslip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPayslip(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Payslip Statement Receipt
              </h3>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-bold text-foreground">
                    {selectedPayslip.teacherName || userName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedPayslip.subject || "Faculty"} Teacher
                  </p>
                  {selectedPayslip.teacherEmail && (
                    <p className="text-[11px] text-muted-foreground">Email: {selectedPayslip.teacherEmail}</p>
                  )}
                  {selectedPayslip.teacherPhone && (
                    <p className="text-[11px] text-muted-foreground">Phone: {selectedPayslip.teacherPhone}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted-foreground">Pay Period</span>
                  <p className="font-black text-primary">
                    {selectedPayslip.month} {selectedPayslip.year}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="text-foreground">
                    ₹{Number(selectedPayslip.baseSalary || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-success">
                  <span>Allowances & HRA</span>
                  <span>+ ₹{Number(selectedPayslip.allowances || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-destructive">
                  <span>Tax & PF Deductions</span>
                  <span>- ₹{Number(selectedPayslip.deductions || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl flex justify-between items-center mt-6 border border-border/40">
                <span className="font-bold text-foreground text-xs uppercase">
                  Net Amount Credited
                </span>
                <span className="text-lg font-black text-primary">
                  ₹
                  {(
                    (selectedPayslip.baseSalary || 0) +
                    (selectedPayslip.allowances || 0) -
                    (selectedPayslip.deductions || 0)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-3 justify-center pt-6 border-t border-border/40 text-xs text-muted-foreground font-semibold">
                <Badge variant={getStatusBadgeVariant(selectedPayslip.status)} className="py-1 px-3">
                  Status: {selectedPayslip.status.toUpperCase()}
                </Badge>
                {selectedPayslip.paidDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Paid on {selectedPayslip.paidDate}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end">
              <Button onClick={() => setSelectedPayslip(null)}>Close Payslip</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Salary Record Modal */}
      {showAddEditModal && setShowAddEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {editingSalary ? "Edit Payroll Entry" : "Add Payroll Entry"}
              </h3>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {formError && (
                <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                {/* Step 1: Staff Selection */}
                <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                      <Users className="h-4 w-4 text-primary" /> 1. Select Staff Member
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Instant Registered Teacher Select Dropdown */}
                    <select
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
                      value={formData.teacherId || ""}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const teacherObj = teachers.find((t: any) => String(t.id) === String(selectedId));
                        if (teacherObj) {
                          handleSelectTeacherInModal(teacherObj);
                        } else if (selectedId === "") {
                          setFormData && setFormData({ ...formData, teacherId: "", teacherName: "" });
                          // setModalTeacherSearch("");
                          setAutoPrefillStatus(null);
                        }
                      }}
                    >
                      <option value="">-- Choose Staff Member --</option>
                      {filteredTeachersForModal.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    {/* Instant Filter Input */}
                    {/* <div className="relative">
                      <Input
                        value={modalTeacherSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setModalTeacherSearch(val);
                          setFormData && setFormData({ ...formData, teacherName: val });

                          const matchedTeacher = teachers.find(
                            (t: any) => t.name && t.name.toLowerCase() === val.toLowerCase()
                          );
                          if (matchedTeacher) {
                            handleSelectTeacherInModal(matchedTeacher);
                          }
                        }}
                        placeholder="Filter list by name or email..."
                        icon={<Search className="h-4 w-4 text-muted-foreground" />}
                      />
                    </div> */}
                  </div>

                  {/* Selected Staff Member Details Card */}
                  {selectedTeacher && (
                    <div className="p-3 bg-card border border-primary/30 rounded-xl space-y-2 mt-2 shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm border border-primary/20">
                            {selectedTeacher.name ? selectedTeacher.name.charAt(0).toUpperCase() : "T"}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              {selectedTeacher.name}
                              {(selectedTeacher.department || selectedTeacher.subject) && (
                                <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                  {selectedTeacher.department || selectedTeacher.subject}
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-muted-foreground font-medium flex flex-wrap items-center gap-x-2">
                              {selectedTeacher.email && <span>Email: {selectedTeacher.email}</span>}
                              {selectedTeacher.phone && <span>• Phone: {selectedTeacher.phone}</span>}
                            </p>
                          </div>
                        </div>


                      </div>

                      {selectedTeacherStructure ? (
                        <div className="grid grid-cols-4 gap-1.5 text-[10px] bg-muted/40 p-2 rounded-lg font-medium text-center border border-border/40 mt-1">
                          <div>
                            <span className="text-muted-foreground block">Basic Salary</span>
                            <span className="font-bold text-foreground">₹{Number(selectedTeacherStructure.basicSalary).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Allowances</span>
                            <span className="font-bold text-success">+₹{(Number(selectedTeacherStructure.hra || 0) + Number(selectedTeacherStructure.da || 0) + Number(selectedTeacherStructure.otherAllowance || 0)).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Deductions</span>
                            <span className="font-bold text-destructive">-₹{(Number(selectedTeacherStructure.pfDeduction || 0) + Number(selectedTeacherStructure.taxDeduction || 0)).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Net Monthly</span>
                            <span className="font-black text-primary">₹{Number(selectedTeacherStructure.netSalary || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded text-center font-medium">
                          No salary structure pre-configured for {selectedTeacher.name}. Basic figures can be entered manually.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Auto Prefill Status Banner */}
                  {autoPrefillStatus && (
                    <div
                      className={`p-2.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2 transition-all mt-2 ${autoPrefillStatus.type === "success"
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        {autoPrefillStatus.type === "success" ? (
                          <Sparkles className="h-4 w-4 shrink-0 text-success animate-bounce" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <span>{autoPrefillStatus.message}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Pay Period & Designation */}
                <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="h-4 w-4 text-primary" /> 2. Pay Period & Subject
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Month</label>
                      <select
                        className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                        value={formData.month || "May"}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, month: e.target.value })
                        }
                      >
                        {[
                          "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"
                        ].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Year</label>
                      <Input
                        type="number"
                        className="h-9 text-xs font-semibold"
                        value={formData.year || new Date().getFullYear()}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, year: e.target.value })
                        }
                        placeholder="2024"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Subject / Designation</label>
                      <Input
                        className="h-9 text-xs font-semibold"
                        value={formData.subject || ""}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, subject: e.target.value })
                        }
                        placeholder="e.g. Mathematics"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 3: Financial Components */}
                <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <DollarSign className="h-4 w-4 text-primary" /> 3. Salary Breakup Components
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Base Salary (₹)</label>
                      <Input
                        type="number"
                        className="h-9 text-xs font-bold"
                        value={formData.baseSalary || ""}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, baseSalary: e.target.value })
                        }
                        placeholder="50000"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-success flex items-center gap-1">
                        + Allowances / HRA (₹)
                      </label>
                      <Input
                        type="number"
                        className="h-9 text-xs font-bold text-success border-success/40"
                        value={formData.allowances || ""}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, allowances: e.target.value })
                        }
                        placeholder="12000"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                        - Deductions / PF (₹)
                      </label>
                      <Input
                        type="number"
                        className="h-9 text-xs font-bold text-destructive border-destructive/40"
                        value={formData.deductions || ""}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, deductions: e.target.value })
                        }
                        placeholder="5000"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Status Selector & Live Net Pay Preview */}
                <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                      <Receipt className="h-4 w-4 text-primary" /> 4. Disbursal Status & Net Pay
                    </label>
                  </div>

                  <div className="flex gap-2">
                    {[
                      { id: "pending", label: "Pending", icon: AlertCircle, color: "hover:bg-warning/20 border-warning text-warning" },
                      { id: "processing", label: "Processing", icon: Clock, color: "hover:bg-info/20 border-info text-info" },
                      { id: "paid", label: "Paid", icon: CheckCircle2, color: "hover:bg-success/20 border-success text-success" },
                    ].map((st) => {
                      const Icon = st.icon;
                      const isSelected = (formData.status || "pending") === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setFormData && setFormData({ ...formData, status: st.id })}
                          className={`flex-1 h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${isSelected
                            ? `${st.color} bg-muted/60 ring-2 ring-primary/40`
                            : "border-border text-muted-foreground hover:bg-muted/30"
                            }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {st.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Net Salary Summary Card */}
                  {(() => {
                    const liveBase = Number(formData.baseSalary || 0);
                    const liveAllowances = Number(formData.allowances || 0);
                    const liveDeductions = Number(formData.deductions || 0);
                    const liveGross = liveBase + liveAllowances;
                    const liveNet = liveGross - liveDeductions;

                    return (
                      <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl space-y-1.5 mt-3">
                        <div className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground">
                          <span>Gross: ₹{liveGross.toLocaleString()} (₹{liveBase.toLocaleString()} + ₹{liveAllowances.toLocaleString()})</span>
                          <span className="text-destructive">Deductions: -₹{liveDeductions.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1.5 border-t border-primary/20">
                          <span className="font-bold text-xs uppercase text-foreground">
                            Estimated Net Disbursed Pay
                          </span>
                          <span className="text-xl font-black text-primary">₹{liveNet.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSalary}>
                {editingSalary ? "Update Salary" : "Create Salary"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Staff Salary Structure Modal */}
      {showStructModal && setShowStructModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowStructModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                {editingStruct ? "Edit Salary Structure" : "Configure Staff Salary Structure"}
              </h3>
              <button
                onClick={() => setShowStructModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Staff / Teacher</label>
                  <select
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={structFormData.teacherId || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, teacherId: e.target.value })
                    }
                  >
                    <option value="">Select Staff Member</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Basic Salary (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.basicSalary || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, basicSalary: e.target.value })
                    }
                    placeholder="e.g. 50000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">HRA (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.hra || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, hra: e.target.value })
                    }
                    placeholder="e.g. 12500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">DA (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.da || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, da: e.target.value })
                    }
                    placeholder="e.g. 5000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Other Allowance (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.otherAllowance || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, otherAllowance: e.target.value })
                    }
                    placeholder="e.g. 2000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">PF Deduction (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.pfDeduction || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, pfDeduction: e.target.value })
                    }
                    placeholder="e.g. 6000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">TDS / Tax Deduction (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.taxDeduction || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, taxDeduction: e.target.value })
                    }
                    placeholder="e.g. 2500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Effective Date</label>
                  <Input
                    type="date"
                    value={structFormData.effectiveFrom || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, effectiveFrom: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowStructModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStruct}>
                {editingStruct ? "Update Salary Setup" : "Save Salary Setup"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Monthly Payroll Modal */}
      {showPayrollModal && setShowPayrollModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleClosePayrollModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Generate Monthly Staff Payroll
              </h3>
              <button
                onClick={handleClosePayrollModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {/* Pay Period Month & Year Picker */}
              <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border/50">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar className="h-4 w-4 text-primary" /> Select Pay Period
                </label>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Month</label>
                    <select
                      className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                      value={payrollMonth}
                      onChange={(e) => setPayrollMonth && setPayrollMonth(Number(e.target.value))}
                    >
                      {[
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ].map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground">Year</label>
                    <Input
                      type="number"
                      className="h-9 text-xs font-bold"
                      value={payrollYear}
                      onChange={(e) => setPayrollYear && setPayrollYear(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Active Staff Structures & Payroll Estimate Card */}
              {(() => {
                const activeCount = salaryStructures.filter((s) => s.isActive).length;
                const totalCount = salaryStructures.length;
                const estimatedPayroll = salaryStructures.reduce(
                  (acc, s) => acc + Number(s.netSalary || 0),
                  0
                );
                const monthNames = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                const selectedMonthName = monthNames[(payrollMonth || 1) - 1] || "Selected Month";

                return (
                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-primary" /> Target Period
                        </span>
                        <Badge variant="primary" className="text-[10px] font-bold">
                          {selectedMonthName} {payrollYear}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Monthly staff payslips will be automatically created for all active staff salary structures.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="p-3 bg-card border border-border/60 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wide">
                          Active Structures
                        </span>
                        <span className="text-base font-black text-foreground">
                          {activeCount > 0 ? activeCount : totalCount} Staff
                        </span>
                        <span className="text-[10px] text-success block font-medium">Ready for generation</span>
                      </div>

                      <div className="p-3 bg-card border border-border/60 rounded-xl space-y-0.5 shadow-sm">
                        <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wide">
                          Est. Net Payroll
                        </span>
                        <span className="text-base font-black text-primary">
                          ₹{estimatedPayroll.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-medium">Net monthly total</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={handleClosePayrollModal} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGeneratePayroll} disabled={isGenerating} className="gap-2 font-bold">
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin text-primary-foreground" />
                    Generating Payroll...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Disburse Monthly Payroll
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryUI;
