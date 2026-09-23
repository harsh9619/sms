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
} from "lucide-react";
import type { SalaryRecord } from "../../../types";

export interface SalaryUIProps {
  salaries: SalaryRecord[];
  loading?: boolean;
  error?: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  isMySalary?: boolean;
  selectedPayslip?: SalaryRecord | null;
  setSelectedPayslip?: (sal: SalaryRecord | null) => void;
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
}

export function SalaryUI({
  salaries,
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
      totalCount: salaries.length,
      totalPayroll,
    };
  }, [salaries]);

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
              : "Manage staff payroll, teacher base salaries, allowances, deductions, and payslips"}
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
          {!isMySalary && handleOpenAddModal && (
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Payroll Entry
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Summary Cards */}
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
                  {salaries.map((s) => {
                    const net = (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0);
                    return (
                      <tr key={s.id} className="border-b hover:bg-muted/10 transition-colors">
                        {!isMySalary && (
                          <td className="px-6 py-4 font-bold text-foreground">
                            {s.teacherName || "Teacher"}
                            {s.subject && (
                              <span className="text-xs text-muted-foreground font-normal block">
                                {s.subject}
                              </span>
                            )}
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
                            {setSelectedPayslip && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 font-semibold"
                                onClick={() => setSelectedPayslip(s)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" /> View Payslip
                              </Button>
                            )}
                            {!isMySalary && (
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
        </CardContent>
      </Card>

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

      {/* Add / Edit Salary Modal */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Teacher Name</label>
                  <Input
                    value={formData.teacherName || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, teacherName: e.target.value })
                    }
                    placeholder="Enter teacher name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Subject / Designation</label>
                  <Input
                    value={formData.subject || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="e.g. Mathematics"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Base Salary (₹)</label>
                  <Input
                    type="number"
                    value={formData.baseSalary || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, baseSalary: e.target.value })
                    }
                    placeholder="Base amount"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Allowances (₹)</label>
                  <Input
                    type="number"
                    value={formData.allowances || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, allowances: e.target.value })
                    }
                    placeholder="Allowances / HRA"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Deductions (₹)</label>
                  <Input
                    type="number"
                    value={formData.deductions || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, deductions: e.target.value })
                    }
                    placeholder="Deductions / PF"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Month</label>
                  <Input
                    value={formData.month || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, month: e.target.value })
                    }
                    placeholder="e.g. May"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Year</label>
                  <Input
                    type="number"
                    value={formData.year || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, year: e.target.value })
                    }
                    placeholder="e.g. 2024"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <select
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.status || "pending"}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="paid">Paid</option>
                  </select>
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
    </div>
  );
}

export default SalaryUI;
