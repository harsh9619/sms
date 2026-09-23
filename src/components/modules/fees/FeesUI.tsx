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
  Receipt,
  CreditCard,
  X,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Layers,
  Sparkles,
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import type { ClassFeeStructureItem } from "../../../Services/fee.service";

export interface FeesUIProps {
  fees: FeeRecord[];
  classFeeStructures?: ClassFeeStructureItem[];
  classes?: any[];
  loading?: boolean;
  error?: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  feeTypeFilter?: string;
  setFeeTypeFilter?: (val: string) => void;
  isMyFees?: boolean;
  payingFee?: FeeRecord | null;
  setPayingFee?: (fee: FeeRecord | null) => void;
  paymentMethod?: string;
  setPaymentMethod?: (method: string) => void;
  processing?: boolean;
  handlePay?: () => void;

  // Add/Edit Student Fee Modal
  showAddEditModal?: boolean;
  setShowAddEditModal?: (show: boolean) => void;
  editingFee?: FeeRecord | null;
  formData?: any;
  setFormData?: (data: any) => void;
  formError?: string | null;
  handleSaveFee?: () => void;
  handleDeleteFee?: (id: string) => void;
  handleOpenAddModal?: () => void;
  handleOpenEditModal?: (fee: FeeRecord) => void;
  handleExportExcel?: () => void;
  handleExportSummary?: () => void;

  // Sub-Tab Switcher
  activeSubTab?: "invoices" | "structures";
  setActiveSubTab?: (tab: "invoices" | "structures") => void;

  // Class Fee Structure Actions
  showStructModal?: boolean;
  setShowStructModal?: (show: boolean) => void;
  editingStruct?: ClassFeeStructureItem | null;
  structFormData?: any;
  setStructFormData?: (data: any) => void;
  handleSaveStruct?: () => void;
  handleDeleteStruct?: (id: string) => void;
  handleOpenAddStructModal?: () => void;
  handleOpenEditStructModal?: (item: ClassFeeStructureItem) => void;

  // Auto Generate Invoices Modal
  showGenerateModal?: boolean;
  setShowGenerateModal?: (show: boolean) => void;
  generateClassId?: string;
  setGenerateClassId?: (val: string) => void;
  generateDueDate?: string;
  setGenerateDueDate?: (val: string) => void;
  handleGenerateInvoices?: () => void;
  isGenerating?: boolean;
}

export function FeesUI({
  fees,
  classFeeStructures = [],
  classes = [],
  loading = false,
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  feeTypeFilter = "all",
  setFeeTypeFilter,
  isMyFees = false,
  payingFee = null,
  setPayingFee,
  paymentMethod = "credit_card",
  setPaymentMethod,
  processing = false,
  handlePay,
  showAddEditModal = false,
  setShowAddEditModal,
  editingFee = null,
  formData = {},
  setFormData,
  formError,
  handleSaveFee,
  handleDeleteFee,
  handleOpenAddModal,
  handleOpenEditModal,
  handleExportExcel,
  handleExportSummary,
  activeSubTab = "invoices",
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
  showGenerateModal = false,
  setShowGenerateModal,
  generateClassId = "",
  setGenerateClassId,
  generateDueDate = "",
  setGenerateDueDate,
  handleGenerateInvoices,
  isGenerating = false,
}: FeesUIProps) {
  // Stats calculations
  const stats = React.useMemo(() => {
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    fees.forEach((f) => {
      const amt = Number(f.amount || 0);
      totalAmount += amt;
      if (f.status === "paid") {
        paidAmount += amt;
        paidCount++;
      } else if (f.status === "overdue") {
        overdueAmount += amt;
        overdueCount++;
      } else {
        pendingAmount += amt;
        pendingCount++;
      }
    });

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      totalCount: fees.length,
      paidCount,
      pendingCount,
      overdueCount,
    };
  }, [fees]);

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "pending") return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            {isMyFees ? "My Fees" : "Fee Management & Ledgers"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMyFees
              ? "View your school fees, invoices and payment transaction history"
              : "Manage student billing, class-wise fee structures, collections, and financial receipts"}
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
          {!isMyFees && activeSubTab === "invoices" && handleOpenAddModal && (
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Fee Entry
            </Button>
          )}
          {!isMyFees && activeSubTab === "structures" && handleOpenAddStructModal && (
            <Button size="sm" onClick={handleOpenAddStructModal}>
              <Plus className="h-4 w-4 mr-2" /> Configure Class Fee
            </Button>
          )}
          {!isMyFees && activeSubTab === "structures" && setShowGenerateModal && (
            <Button size="sm" variant="secondary" onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> Auto-Generate Invoices
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
      {!isMyFees && setActiveSubTab && (
        <div className="flex gap-2 border-b border-border/60 pb-1 text-left">
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Student Fee Invoices & Ledgers
          </button>
          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "structures"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Class-Wise Fee Structures
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {activeSubTab === "invoices" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <Card className="hover-lift">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Total Fee Billing</p>
              <p className="text-2xl font-black text-foreground mt-1.5">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalCount} Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-success">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Amount Settled (Paid)</p>
              <p className="text-2xl font-black text-success mt-1.5">
                ₹{stats.paidAmount.toLocaleString()}
              </p>
              <p className="text-xs text-success mt-1">{stats.paidCount} Paid Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-warning">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Amount Outstanding</p>
              <p className="text-2xl font-black text-warning mt-1.5">
                ₹{stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-warning mt-1">{stats.pendingCount} Pending Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-destructive">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Overdue Invoices</p>
              <p className="text-2xl font-black text-destructive mt-1.5">
                ₹{stats.overdueAmount.toLocaleString()}
              </p>
              <p className="text-xs text-destructive mt-1">{stats.overdueCount} Overdue Invoices</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- INVOICES TAB CONTENT --- */}
      {activeSubTab === "invoices" && (
        <>
          {/* Filters & Controls */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder={
                      isMyFees
                        ? "Search by fee type or remarks..."
                        : "Search by student name or roll number..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  {setFeeTypeFilter && (
                    <select
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={feeTypeFilter}
                      onChange={(e) => setFeeTypeFilter(e.target.value)}
                    >
                      <option value="all">All Fee Types</option>
                      <option value="tuition">Tuition Fee</option>
                      <option value="transport">Transport Fee</option>
                      <option value="exam">Exam Fee</option>
                      <option value="library">Library Fee</option>
                      <option value="sports">Sports Fee</option>
                    </select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="text-left">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Fee Invoices Ledger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs">Loading fee records...</p>
                </div>
              ) : (
                <div className="overflow-x-auto text-left">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                        {!isMyFees && <th className="px-6 py-3.5 text-left">Student Name</th>}
                        {!isMyFees && <th className="px-6 py-3.5 text-left">Roll No</th>}
                        <th className="px-6 py-3.5 text-left">Fee Type</th>
                        <th className="px-6 py-3.5 text-left">Amount</th>
                        <th className="px-6 py-3.5 text-left">Due Date</th>
                        <th className="px-6 py-3.5 text-left">Payment Date</th>
                        <th className="px-6 py-3.5 text-left">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((fee) => (
                        <tr key={fee.id} className="border-b hover:bg-muted/10 transition-colors">
                          {!isMyFees && (
                            <td className="px-6 py-4 font-bold text-foreground">
                              {fee.studentName || "N/A"}
                              {fee.class && (
                                <span className="text-xs text-muted-foreground font-normal block">
                                  Class {fee.class} {fee.section || ""}
                                </span>
                              )}
                            </td>
                          )}
                          {!isMyFees && (
                            <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                              {fee.rollNumber || "-"}
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className="font-bold text-foreground capitalize">{fee.feeType}</span>
                            {fee.remarks && (
                              <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                {fee.remarks}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 font-bold">₹{Number(fee.amount).toLocaleString()}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                            {fee.dueDate}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                            {fee.paidDate || "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(fee.status)}
                              <Badge variant={getStatusBadgeVariant(fee.status)}>
                                {fee.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isMyFees && fee.status !== "paid" && setPayingFee && (
                                <Button
                                  size="sm"
                                  className="h-8 font-semibold"
                                  onClick={() => setPayingFee(fee)}
                                >
                                  Pay Now
                                </Button>
                              )}
                              {isMyFees && fee.status === "paid" && (
                                <span className="text-xs text-success font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" /> Settled
                                </span>
                              )}
                              {!isMyFees && (
                                <>
                                  {handleOpenEditModal && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenEditModal(fee)}
                                      className="hover:text-primary h-8 w-8"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {handleDeleteFee && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteFee(fee.id)}
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
                      ))}
                    </tbody>
                  </table>
                  {fees.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground/60 font-medium">
                      No fee records found matching criteria.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* --- CLASS FEE STRUCTURES TAB CONTENT --- */}
      {activeSubTab === "structures" && (
        <Card>
          <CardHeader className="text-left flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Class-Wise Master Fee Structures
            </CardTitle>
            {setShowGenerateModal && (
              <Button size="sm" variant="outline" onClick={() => setShowGenerateModal(true)}>
                <Sparkles className="h-4 w-4 mr-2 text-primary" /> Auto-Generate Invoices
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto text-left">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <th className="px-6 py-3.5 text-left">Class Grade</th>
                    <th className="px-6 py-3.5 text-left">Fee Component Name</th>
                    <th className="px-6 py-3.5 text-left">Fee Type</th>
                    <th className="px-6 py-3.5 text-left">Amount (₹)</th>
                    <th className="px-6 py-3.5 text-left">Frequency</th>
                    <th className="px-6 py-3.5 text-left">Due Day</th>
                    <th className="px-6 py-3.5 text-left">Mandatory</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classFeeStructures.map((struct) => (
                    <tr key={struct.id} className="border-b hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-bold text-foreground">
                        {struct.className || `Class ${struct.classMasterId}`}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {struct.feeName}
                        {struct.description && (
                          <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                            {struct.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize">
                        <Badge variant="secondary">{struct.feeType}</Badge>
                      </td>
                      <td className="px-6 py-4 font-black">₹{Number(struct.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 capitalize text-xs font-semibold text-muted-foreground">
                        {struct.frequency}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                        Day {struct.dueDay} of month
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={struct.isMandatory ? "success" : "warning"}>
                          {struct.isMandatory ? "Mandatory" : "Optional"}
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
              {classFeeStructures.length === 0 && (
                <div className="text-center py-16 text-muted-foreground/60 font-medium">
                  No class fee structures configured yet. Click "Configure Class Fee" to add components.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mock Payment Gateway Modal Dialog */}
      {payingFee && setPayingFee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => !processing && setPayingFee(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Mock Payment Checkout
              </h3>
              {!processing && (
                <button
                  onClick={() => setPayingFee(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">Payment For</p>
                <p className="text-sm font-bold capitalize">{payingFee.feeType} Fee</p>
                <p className="text-xl font-black text-primary mt-1">
                  ₹{Number(payingFee.amount).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod && setPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="wallet">Mobile Wallet</option>
                </select>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                🚨 This is a mock sandbox integration. No actual currency will be debited or
                processed.
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setPayingFee(null)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button onClick={handlePay} disabled={processing}>
                {processing
                  ? "Processing..."
                  : `Authorize ₹${Number(payingFee.amount).toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Fee Modal */}
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
                {editingFee ? "Edit Fee Entry" : "Create New Fee Entry"}
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
                  <label className="text-xs font-semibold text-muted-foreground">Student Name</label>
                  <Input
                    value={formData.studentName || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, studentName: e.target.value })
                    }
                    placeholder="Enter student name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Roll Number</label>
                  <Input
                    value={formData.rollNumber || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, rollNumber: e.target.value })
                    }
                    placeholder="e.g. 101"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Fee Type</label>
                  <Input
                    value={formData.feeType || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, feeType: e.target.value })
                    }
                    placeholder="tuition / transport / exam"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.amount || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, dueDate: e.target.value })
                    }
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
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Remarks / Description</label>
                <Input
                  value={formData.remarks || ""}
                  onChange={(e) =>
                    setFormData && setFormData({ ...formData, remarks: e.target.value })
                  }
                  placeholder="Optional remarks"
                />
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFee}>
                {editingFee ? "Update Fee" : "Create Fee"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Fee Structure Modal */}
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
                <Layers className="h-5 w-5 text-primary" />
                {editingStruct ? "Edit Class Fee Structure" : "Configure Class Fee Component"}
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
                  <label className="text-xs font-semibold text-muted-foreground">Class Grade Level</label>
                  <select
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={structFormData.classMasterId || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, classMasterId: e.target.value })
                    }
                  >
                    <option value="">Select Class Grade</option>
                    <option value="1">LKG</option>
                    <option value="2">UKG</option>
                    <option value="3">Class 1</option>
                    <option value="4">Class 2</option>
                    <option value="5">Class 3</option>
                    <option value="6">Class 4</option>
                    <option value="7">Class 5</option>
                    <option value="8">Class 6</option>
                    <option value="9">Class 7</option>
                    <option value="10">Class 8</option>
                    <option value="11">Class 9</option>
                    <option value="12">Class 10</option>
                    <option value="13">Class 11</option>
                    <option value="14">Class 12</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Component Name</label>
                  <Input
                    value={structFormData.feeName || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, feeName: e.target.value })
                    }
                    placeholder="e.g. Monthly Tuition Fee"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Fee Type</label>
                  <select
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={structFormData.feeType || "tuition"}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, feeType: e.target.value })
                    }
                  >
                    <option value="tuition">Tuition Fee</option>
                    <option value="transport">Transport Fee</option>
                    <option value="exam">Exam Fee</option>
                    <option value="library">Library Fee</option>
                    <option value="sports">Sports Fee</option>
                    <option value="other">Other Component</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Amount (₹)</label>
                  <Input
                    type="number"
                    value={structFormData.amount || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, amount: e.target.value })
                    }
                    placeholder="e.g. 5000"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Billing Frequency</label>
                  <select
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={structFormData.frequency || "monthly"}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, frequency: e.target.value })
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annually">Annually</option>
                    <option value="one_time">One Time</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Due Day of Month</label>
                  <Input
                    type="number"
                    value={structFormData.dueDay || 10}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, dueDay: e.target.value })
                    }
                    placeholder="Day (1-31)"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <Input
                  value={structFormData.description || ""}
                  onChange={(e) =>
                    setStructFormData &&
                    setStructFormData({ ...structFormData, description: e.target.value })
                  }
                  placeholder="Optional details"
                />
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowStructModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveStruct}>
                {editingStruct ? "Update Structure" : "Save Structure"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Generate Invoices Modal */}
      {showGenerateModal && setShowGenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-spin" />
                Auto-Generate Class Fee Invoices
              </h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              <p className="text-xs text-muted-foreground">
                Select a Class Grade. The system will look up all configured fee components for that class and generate fee invoices for every enrolled student.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select Class Grade</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={generateClassId}
                  onChange={(e) => setGenerateClassId && setGenerateClassId(e.target.value)}
                >
                  <option value="">Select Class Grade</option>
                  <option value="1">LKG</option>
                  <option value="2">UKG</option>
                  <option value="3">Class 1</option>
                  <option value="4">Class 2</option>
                  <option value="5">Class 3</option>
                  <option value="6">Class 4</option>
                  <option value="7">Class 5</option>
                  <option value="8">Class 6</option>
                  <option value="9">Class 7</option>
                  <option value="10">Class 8</option>
                  <option value="11">Class 9</option>
                  <option value="12">Class 10</option>
                  <option value="13">Class 11</option>
                  <option value="14">Class 12</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Invoice Due Date</label>
                <Input
                  type="date"
                  value={generateDueDate}
                  onChange={(e) => setGenerateDueDate && setGenerateDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setShowGenerateModal(false)} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={handleGenerateInvoices} disabled={isGenerating || !generateClassId}>
                {isGenerating ? "Generating..." : "Generate Student Invoices"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeesUI;
