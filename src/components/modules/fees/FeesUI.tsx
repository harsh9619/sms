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
  User,
  GraduationCap,
  Filter,
  RefreshCw,
  Calendar,
  FileText,
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import { formatOnlyDate } from "../../../lib/utils";
import type { ClassFeeStructureItem } from "../../../Services/fee.service";

export interface FeesUIProps {
  fees: FeeRecord[];
  classFeeStructures?: ClassFeeStructureItem[];
  classes?: any[];
  students?: any[];
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
  students = [],
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

  // Class, Division, and Student selection logic for Add/Edit Fee Modal
  const [modalSelectedClass, setModalSelectedClass] = React.useState<string>("all");
  const [modalSelectedDiv, setModalSelectedDiv] = React.useState<string>("all");
  const [modalStudentSearch, setModalStudentSearch] = React.useState<string>("");

  React.useEffect(() => {
    if (showAddEditModal) {
      setModalStudentSearch("");
      if (editingFee && editingFee.class) {
        const classParts = editingFee.class.split("-");
        setModalSelectedClass(classParts[0] || "all");
        setModalSelectedDiv(classParts[1] || editingFee.section || "all");
      } else {
        setModalSelectedClass("all");
        setModalSelectedDiv("all");
      }
    }
  }, [showAddEditModal, editingFee]);

  const availableModalClasses = React.useMemo(() => {
    const classMap = new Map<string, string>();
    classes.forEach((c) => {
      const name = c.name || c.className;
      if (name) classMap.set(String(name), String(name));
    });
    students.forEach((s) => {
      const name = s.class_name || s.class;
      if (name) classMap.set(String(name), String(name));
    });
    return Array.from(classMap.values()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes, students]);

  const availableModalDivisions = React.useMemo(() => {
    const divSet = new Set<string>();
    if (modalSelectedClass !== "all") {
      classes
        .filter((c) => (c.name || c.className) === modalSelectedClass)
        .forEach((c) => {
          if (c.section) divSet.add(c.section);
          if (c.division) divSet.add(c.division);
          if (c.divisions && Array.isArray(c.divisions)) {
            c.divisions.forEach((d: any) => d.name && divSet.add(d.name));
          }
        });
      students
        .filter((s) => (s.class_name || s.class) === modalSelectedClass)
        .forEach((s) => {
          const div = s.division_name || s.section;
          if (div) divSet.add(div);
        });
    } else {
      students.forEach((s) => {
        const div = s.division_name || s.section;
        if (div) divSet.add(div);
      });
    }
    return Array.from(divSet).sort();
  }, [classes, students, modalSelectedClass]);

  const modalFilteredStudents = React.useMemo(() => {
    const query = modalStudentSearch.toLowerCase().trim();
    return students.filter((s) => {
      const sClass = s.class_name || s.class || "";
      const sDiv = s.division_name || s.section || "";
      const sName = (s.name || s.user?.name || "").toLowerCase();
      const sRoll = String(s.roll_no || s.rollNumber || "").toLowerCase();
      const sReg = String(s.registration_no || "").toLowerCase();

      const matchesClass =
        modalSelectedClass === "all" ||
        sClass.toLowerCase() === modalSelectedClass.toLowerCase() ||
        String(s.class_id) === modalSelectedClass;

      const matchesDiv =
        modalSelectedDiv === "all" ||
        sDiv.toLowerCase() === modalSelectedDiv.toLowerCase();

      const matchesSearch =
        !query ||
        sName.includes(query) ||
        sRoll.includes(query) ||
        sReg.includes(query);

      return matchesClass && matchesDiv && matchesSearch;
    });
  }, [students, modalSelectedClass, modalSelectedDiv, modalStudentSearch]);

  // DOM Slicing: limit rendered options to max 50 to ensure 0 UI lag with 5,000+ students
  const modalDisplayedStudents = React.useMemo(() => {
    const topSlice = modalFilteredStudents.slice(0, 50);
    if (formData?.studentId && !topSlice.some((s) => String(s.id) === String(formData.studentId))) {
      const selectedObj = students.find((s) => String(s.id) === String(formData.studentId));
      if (selectedObj) {
        return [selectedObj, ...topSlice];
      }
    }
    return topSlice;
  }, [modalFilteredStudents, formData?.studentId, students]);

  const lookupFeeAmount = React.useCallback(
    (className: string, feeType: string) => {
      if (!classFeeStructures || classFeeStructures.length === 0) return 0;
      const targetClassStr = (className || "").toLowerCase().replace(/class|\s|-/g, "");
      const targetType = (feeType || "").toLowerCase();

      const found = classFeeStructures.find((struct) => {
        const structClassStr = (struct.className || "").toLowerCase().replace(/class|\s|-/g, "");
        const structType = (struct.feeType || "").toLowerCase();

        const classMatches =
          structClassStr === targetClassStr ||
          (structClassStr && targetClassStr.includes(structClassStr)) ||
          (struct.classMasterId && targetClassStr.includes(String(struct.classMasterId)));
        return classMatches && structType === targetType;
      });

      return found ? Number(found.amount || 0) : 0;
    },
    [classFeeStructures]
  );

  const isSelectionComplete = React.useMemo(() => {
    const hasClass = (modalSelectedClass !== "all" && Boolean(modalSelectedClass)) || Boolean(formData?.class);
    const hasDiv = (modalSelectedDiv !== "all" && Boolean(modalSelectedDiv)) || Boolean(formData?.section);
    const hasStudent = Boolean(formData?.studentId);
    return hasClass && hasDiv && hasStudent;
  }, [modalSelectedClass, modalSelectedDiv, formData?.class, formData?.section, formData?.studentId]);

  const availableFeeComponents = React.useMemo(() => {
    const baseTypes = [
      { id: "tuition", label: "Tuition Fee", icon: GraduationCap },
      { id: "exam", label: "Exam Fee", icon: FileText },
      { id: "transport", label: "Transport Fee", icon: CreditCard },
      { id: "library", label: "Library Fee", icon: Layers },
      { id: "sports", label: "Sports Fee", icon: Sparkles },
      { id: "other", label: "Other Fee", icon: DollarSign },
    ];

    const list = [...baseTypes];

    if (classFeeStructures && classFeeStructures.length > 0) {
      classFeeStructures.forEach((struct) => {
        const typeId = (struct.feeType || "").toLowerCase().trim();
        if (typeId && !list.some((b) => b.id === typeId)) {
          list.push({
            id: typeId,
            label: struct.feeName || `${typeId.charAt(0).toUpperCase() + typeId.slice(1)} Fee`,
            icon: DollarSign,
          });
        }
      });
    }

    if (formData?.feeType) {
      const typeId = String(formData.feeType).toLowerCase().trim();
      if (typeId && !list.some((b) => b.id === typeId)) {
        list.push({
          id: typeId,
          label: `${typeId.charAt(0).toUpperCase() + typeId.slice(1)} Fee`,
          icon: DollarSign,
        });
      }
    }

    if (Array.isArray(formData?.selectedFeeItems)) {
      formData.selectedFeeItems.forEach((item: any) => {
        const typeId = String(item.feeType || "").toLowerCase().trim();
        if (typeId && !list.some((b) => b.id === typeId)) {
          list.push({
            id: typeId,
            label: item.label || `${typeId.charAt(0).toUpperCase() + typeId.slice(1)} Fee`,
            icon: DollarSign,
          });
        }
      });
    }

    return list;
  }, [classFeeStructures, formData?.feeType, formData?.selectedFeeItems]);

  const displayedComponents = React.useMemo(() => {
    if (editingFee) {
      const editType = String(editingFee.feeType || formData?.feeType || "tuition").toLowerCase().trim();
      const found = availableFeeComponents.filter((comp) => comp.id.toLowerCase() === editType);
      if (found.length > 0) return found;
      return [
        {
          id: editType,
          label: `${editType.charAt(0).toUpperCase() + editType.slice(1)} Fee`,
          icon: DollarSign,
        },
      ];
    }
    return availableFeeComponents;
  }, [editingFee, availableFeeComponents, formData?.feeType]);

  const handleStudentSelect = (studentId: string) => {
    if (!setFormData) return;
    const selected = students.find((s) => String(s.id) === String(studentId));
    if (selected) {
      const sName = selected.name || (selected.user ? selected.user.name : "");
      const sRoll = selected.roll_no || selected.rollNumber || "";
      const sClass = selected.class_name || selected.class || "";
      const sSection = selected.division_name || selected.section || "";

      if (sClass && (modalSelectedClass === "all" || !modalSelectedClass)) {
        setModalSelectedClass(sClass);
      }
      if (sSection && (modalSelectedDiv === "all" || !modalSelectedDiv)) {
        setModalSelectedDiv(sSection);
      }

      const currentFeeType = formData.feeType || "tuition";
      const autoAmt = lookupFeeAmount(sClass, currentFeeType);

      const initialSelectedFeeItems = availableFeeComponents.map((item) => {
        const structAmt = lookupFeeAmount(sClass, item.id);
        return {
          feeType: item.id,
          label: item.label,
          amount: structAmt > 0 ? String(structAmt) : (item.id === currentFeeType && formData.amount ? String(formData.amount) : ""),
          selected: structAmt > 0 || item.id === currentFeeType,
        };
      });

      setFormData({
        ...formData,
        studentId: String(selected.id),
        studentName: sName,
        rollNumber: sRoll,
        class: sClass,
        section: sSection,
        amount: autoAmt > 0 ? String(autoAmt) : (formData.amount || ""),
        selectedFeeItems: initialSelectedFeeItems,
      });
    } else {
      setFormData({
        ...formData,
        studentId: "",
        studentName: "",
        rollNumber: "",
      });
    }
  };

  const handleFeeTypeChange = (newType: string) => {
    if (!setFormData) return;
    const sClass = formData.class || modalSelectedClass || "";
    const autoAmt = lookupFeeAmount(sClass, newType);
    setFormData({
      ...formData,
      feeType: newType,
      amount: autoAmt > 0 ? String(autoAmt) : (formData.amount || ""),
    });
  };

  const handleToggleMultiFeeItem = (feeType: string) => {
    if (!setFormData) return;
    const items = formData.selectedFeeItems || [];
    const updated = items.map((item: any) =>
      item.feeType === feeType ? { ...item, selected: !item.selected } : item
    );
    const activeItems = updated.filter((item: any) => item.selected);
    const primary = activeItems.find((item: any) => item.feeType === (formData.feeType || feeType)) || activeItems[0];
    setFormData({
      ...formData,
      selectedFeeItems: updated,
      feeType: primary ? primary.feeType : formData.feeType,
      amount: primary ? primary.amount : formData.amount,
    });
  };

  const handleUpdateMultiFeeAmount = (feeType: string, newAmount: string) => {
    if (!setFormData) return;
    const items = formData.selectedFeeItems || [];
    const updated = items.map((item: any) =>
      item.feeType === feeType ? { ...item, amount: newAmount } : item
    );
    const isTargetMain = (formData.feeType || "tuition") === feeType;
    setFormData({
      ...formData,
      selectedFeeItems: updated,
      amount: isTargetMain ? newAmount : formData.amount,
    });
  };

  const multiFeeTotalSum = React.useMemo(() => {
    if (!formData.selectedFeeItems || !Array.isArray(formData.selectedFeeItems)) return 0;
    return formData.selectedFeeItems.reduce((sum: number, item: any) => {
      if (item.selected && item.amount) {
        return sum + Number(item.amount || 0);
      }
      return sum;
    }, 0);
  }, [formData.selectedFeeItems]);

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
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === "invoices"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Receipt className="h-4 w-4" />
            Student Fee Invoices & Ledgers
          </button>
          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === "structures"
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
                                  {fee.class} {fee.section || ""}
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
                            {formatOnlyDate(fee.dueDate)}
                          </td>
                          <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                            {formatOnlyDate(fee.paidDate)}

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl m-4 overflow-hidden animate-scale-in text-left flex flex-col max-h-[92vh] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground tracking-tight flex items-center gap-2">
                    {editingFee ? "Edit Student Fee Entry" : "Create New Student Fee Entry"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {editingFee ? "Update fee details, payment status or settlement date" : "Select a student from database and issue a fee invoice"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-6 text-sm overflow-y-auto">
              {formError && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive/40 text-destructive text-xs rounded-2xl font-bold flex items-center gap-3 animate-bounce">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-extrabold text-sm">Validation Required</p>
                    <p className="font-medium text-xs opacity-90">{formError}</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Student Selection */}
              <div className="space-y-4 p-5 bg-card border-2 border-primary/20 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">1</span>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider">
                      Student Selection (Database Lookup)
                    </label>
                  </div>
                  {modalFilteredStudents.length > 50 && (
                    <span className="text-[11px] text-amber-600 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                      Showing 50 of {modalFilteredStudents.length} matching students
                    </span>
                  )}
                </div>

                {/* Selected Student Card (If student is already selected) */}
                {formData.studentId ? (
                  <div className="p-4 bg-primary/10 border-2 border-primary/40 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-md">
                        {(formData.studentName || "S")[0].toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-foreground text-base">{formData.studentName}</p>
                          <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Student Selected
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-semibold">
                          <span>Roll No: <strong className="text-foreground">{formData.rollNumber || "N/A"}</strong></span>
                          <span>Class: <strong className="text-foreground">{formData.class || "N/A"} {formData.section || ""}</strong></span>
                          {formData.studentId && <span>ID: <strong className="text-foreground">#{formData.studentId}</strong></span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData && setFormData({ ...formData, studentId: "", studentName: "", rollNumber: "" })}
                      className="text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-white h-9 px-3 font-bold"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Change Student
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Class & Division Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                          <Filter className="h-3.5 w-3.5 text-primary" /> Filter Class Grade
                        </label>
                        <select
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                          value={modalSelectedClass}
                          onChange={(e) => {
                            setModalSelectedClass(e.target.value);
                            setModalSelectedDiv("all");
                          }}
                        >
                          <option value="all">All Classes</option>
                          {availableModalClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                          <Filter className="h-3.5 w-3.5 text-primary" /> Filter Division
                        </label>
                        <select
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                          value={modalSelectedDiv}
                          onChange={(e) => setModalSelectedDiv(e.target.value)}
                        >
                          <option value="all">All Divisions</option>
                          {availableModalDivisions.map((div) => (
                            <option key={div} value={div}>
                              Div {div}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Search Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                        <span>Search Student by Name or Admission No</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Type to filter list</span>
                      </label>
                      <Input
                        placeholder="Type student name, admission no, or roll no..."
                        value={modalStudentSearch}
                        onChange={(e) => setModalStudentSearch(e.target.value)}
                        icon={<Search className="h-4 w-4 text-primary" />}
                      />
                    </div>

                    {/* Student Selection Dropdown List */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-primary flex items-center gap-1">
                        Select Student Dropdown <span className="text-destructive">*</span>
                      </label>
                      <select
                        className="w-full h-11 rounded-xl border-2 border-primary/50 bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer"
                        value={formData.studentId || ""}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                      >
                        <option value="">-- 👇 Click to Select Student ({modalDisplayedStudents.length} available) --</option>
                        {modalDisplayedStudents.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name || st.user?.name} (Admission No: {st.registration_no || "N/A"}) — {st.class_name || st.class || "-"} {st.division_name || st.section || ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Fee Category & Amount */}
              <div className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${!isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""}`}>
                {!isSelectionComplete && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Please select Class Grade, Division, and Student in Step 1 to unlock fee category & amount.</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">2</span>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider">
                      Fee Category & Amount
                    </label>
                  </div>

                  {/* Mode Switch Toggle Pill */}

                </div>



                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> {editingFee ? "Single Fee Record Edit Mode" : "Multi-Fee Bundle Mode"}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {editingFee ? `Editing ${editingFee.feeType || "fee"} entry` : "Select fee types to issue or pay together"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-foreground">
                      {editingFee ? "Target Fee Component & Amount" : "Fee Components Checklist & Amounts"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {displayedComponents.map((typeObj) => {
                        const items = formData.selectedFeeItems || [];
                        const foundItem = items.find((i: any) => String(i.feeType).toLowerCase() === typeObj.id.toLowerCase());
                        const isChecked = editingFee ? true : (foundItem ? foundItem.selected : false);
                        const currentAmt = editingFee ? (formData.amount !== undefined ? formData.amount : "") : (foundItem ? foundItem.amount : "");
                        const autoAmt = lookupFeeAmount(formData.class || "", typeObj.id);
                        const IconComp = typeObj.icon || DollarSign;

                        return (
                          <div
                            key={typeObj.id}
                            className={`p-2.5 rounded-xl border-2 flex items-center gap-3 transition-all ${isChecked
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 bg-background opacity-75"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={Boolean(editingFee) || !isSelectionComplete}
                              onChange={() => handleToggleMultiFeeItem(typeObj.id)}
                              className="h-4 w-4 rounded accent-primary cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex-1 min-w-0 flex items-center gap-1.5">
                              <IconComp className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-xs font-extrabold truncate">{typeObj.label}</span>
                            </div>
                            <div className="relative w-24">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                disabled={!isChecked || !isSelectionComplete}
                                value={currentAmt}
                                placeholder={autoAmt > 0 ? String(autoAmt) : "0"}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (editingFee) {
                                    setFormData && setFormData({ ...formData, amount: val });
                                    handleUpdateMultiFeeAmount(typeObj.id, val);
                                  } else {
                                    handleUpdateMultiFeeAmount(typeObj.id, val);
                                  }
                                }}
                                className="w-full h-8 pl-5 pr-2 rounded-lg border border-input bg-background font-bold text-xs focus:ring-1 focus:ring-primary outline-none disabled:bg-muted/50 disabled:opacity-50"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Bundle Sum Banner */}
                  <div className="p-3.5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                          Combined Bundle Total
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Multiple fee invoices will be created in one submission
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{multiFeeTotalSum.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Due Date Picker for Multi-Fee */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-extrabold text-foreground">
                      Invoice Due Date for All Items <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="date"
                      disabled={!isSelectionComplete}
                      value={formData.dueDate || ""}
                      onChange={(e) => setFormData && setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

              </div>

              {/* STEP 3: Payment Status & Remarks */}
              <div className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${!isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""}`}>
                <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">3</span>
                  <label className="text-xs font-black text-foreground uppercase tracking-wider">
                    Payment Status & Settlement
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Toggle Pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-foreground">Payment Status</label>
                    <div className="flex rounded-xl border-2 border-input p-1 bg-background gap-1">
                      {[
                        { id: "pending", label: "Pending", color: "text-amber-600 bg-amber-500/15 border-amber-500/40" },
                        { id: "paid", label: "Paid", color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/40" },
                        { id: "overdue", label: "Overdue", color: "text-rose-600 bg-rose-500/15 border-rose-500/40" },
                      ].map((st) => {
                        const isSelected = (formData.status || "Paid") === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            disabled={!isSelectionComplete}
                            onClick={() => setFormData && setFormData({ ...formData, status: st.id })}
                            className={`flex-1 py-2 rounded-lg text-xs font-black capitalize transition-all ${isSelected
                              ? `${st.color} shadow-sm border-2`
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Settlement Date (Only if Paid) */}
                  {formData.status === "paid" ? (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-xs font-extrabold text-emerald-600">Date Payment Was Received</label>
                      <Input
                        type="date"
                        disabled={!isSelectionComplete}
                        value={formData.paidDate || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFormData && setFormData({ ...formData, paidDate: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-foreground">Remarks / Notes</label>
                      <Input
                        disabled={!isSelectionComplete}
                        value={formData.remarks || ""}
                        onChange={(e) => setFormData && setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Optional remarks"
                      />
                    </div>
                  )}
                </div>

                {formData.status === "paid" && (
                  <div className="space-y-2 animate-fade-in pt-1">
                    <label className="text-xs font-extrabold text-foreground">Remarks / Description</label>
                    <Input
                      disabled={!isSelectionComplete}
                      value={formData.remarks || ""}
                      onChange={(e) => setFormData && setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Optional remarks or receipt voucher notes"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
              <span className="text-xs text-muted-foreground font-extrabold hidden sm:inline">
                {isSelectionComplete
                  ? `Ready to submit fee entry for ${formData.studentName}`
                  : "Please select Class, Division, and Student to unlock fee creation"}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <Button variant="outline" onClick={() => setShowAddEditModal(false)} className="font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFee}
                  disabled={!isSelectionComplete}
                  className="font-black px-5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingFee ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" /> Update Fee Record
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" /> Create Fee Record
                    </>
                  )}
                </Button>
              </div>
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
