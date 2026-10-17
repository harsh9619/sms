import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import {
  GraduationCap,
  FileText,
  CreditCard,
  Layers,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { AppState } from "../../../saga/rootReducer";
import {
  fetchFeesRequest,
  createFeeRequest,
  updateFeeRequest,
  deleteFeeRequest,
  fetchStudentsRequest,
  fetchClassesRequest,
} from "../../../saga";
import { useAuth } from "../../../context/AuthContext";
import { useSchool } from "../../../context/SchoolContext";
import { generateFeeSummaryReport } from "../../../lib/reportUtils";
import feeService, { ClassFeeStructureItem } from "../../../Services/fee.service";
import type { FeeRecord } from "../../../types";
import { FeesToolbar } from "../../../components/modules/fees/FeesToolbar";
import { FeesTable } from "../../../components/modules/fees/FeesTable";
import { CheckoutModal } from "../../../components/modules/fees/CheckoutModal";
import { ReceiptModal } from "../../../components/modules/fees/ReceiptModal";
import { AddEditFeeModal } from "../../../components/modules/fees/AddEditFeeModal";
import {
  BASE_FEE_COMPONENTS,
  DEFAULT_FEE_TYPES,
  DEFAULT_SELECTED_FEE_ITEMS,
  DEFAULT_FEE_PAGE_LIMIT,
  parseFeeRemarks,
} from "../../../constants/fee";

const mapStateToProps = (state: AppState) => ({
  allFees: state.fees.fees,
  meta: state.fees.meta,
  students: state.students.students,
  classes: state.classes.classes,
  loading: state.fees.loading,
  error: state.fees.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchFeesRequest: (payload?: any) => dispatch(fetchFeesRequest(payload)),
  fetchStudentsRequest: (payload?: any) => dispatch(fetchStudentsRequest(payload)),
  fetchClassesRequest: () => dispatch(fetchClassesRequest()),
  createFeeRequest: (fee: any) => dispatch(createFeeRequest(fee)),
  updateFeeRequest: (payload: { id: string; fee: any }) => dispatch(updateFeeRequest(payload)),
  deleteFeeRequest: (id: string) => dispatch(deleteFeeRequest(id)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export interface FeeInvoicesContainerProps extends PropsFromRedux {
  isMyFees?: boolean;
  schoolId: string;
  classFeeStructures?: ClassFeeStructureItem[];
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  showAddModalTrigger?: number;
  onFeeUpdated?: () => void;
}

const isFeeMatchingStatus = (fee: any, filter: string) => {
  if (!filter || filter === "all") return true;
  const todayStr = new Date().toISOString().split("T")[0];
  const isPastDue =
    fee.isOverdue ||
    (fee.status === "pending" && Boolean(fee.dueDate && fee.dueDate < todayStr));

  if (filter === "paid") {
    return fee.status === "paid";
  }
  if (filter === "overdue") {
    return fee.status === "pending" && isPastDue;
  }
  if (filter === "pending") {
    return fee.status === "pending" && !isPastDue;
  }
  return fee.status === filter;
};

function FeeInvoicesContainerContent({
  allFees,
  meta,
  students,
  classes,
  loading,
  fetchFeesRequest,
  fetchStudentsRequest,
  fetchClassesRequest,
  createFeeRequest,
  updateFeeRequest,
  deleteFeeRequest,
  isMyFees = false,
  schoolId,
  classFeeStructures = [],
  statusFilter,
  setStatusFilter,
  showAddModalTrigger,
  onFeeUpdated,
}: FeeInvoicesContainerProps) {
  const { user } = useAuth();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_FEE_PAGE_LIMIT);
  const [searchQuery, setSearchQuery] = useState("");
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");
  const [sessionFilter, setSessionFilter] = useState<string>("all");
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("all");
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState<string>("all");

  // Payment checkout state
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);

  // Active Receipt Modal state
  const [activeReceipt, setActiveReceipt] = useState<any | null>(null);

  // Student Fee Entry Modal
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  // Modal Student selection state
  const [modalSelectedClass, setModalSelectedClass] = useState<string>("all");
  const [modalSelectedDiv, setModalSelectedDiv] = useState<string>("all");
  const [modalStudentSearch, setModalStudentSearch] = useState<string>("");

  const studentProfile = useMemo(() => {
    if (user?.role === "student") {
      return students.find((s: any) => s.email === user.email) || null;
    }
    return null;
  }, [students, user]);

  // Helper to get fee query parameters preserving current pagination and filters
  const getFetchParams = useCallback((targetPage = page) => {
    const params: any = {
      schoolId,
      page: targetPage,
      limit,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      feeType: feeTypeFilter !== "all" ? feeTypeFilter : undefined,
      month: monthFilter !== "all" ? monthFilter : undefined,
      sessionStart: sessionFilter !== "all" ? sessionFilter : undefined,
    };
    if (isMyFees || user?.role === "student") {
      if (studentProfile) {
        params.studentId = studentProfile.id;
      }
    }
    return params;
  }, [
    schoolId,
    page,
    limit,
    searchQuery,
    statusFilter,
    feeTypeFilter,
    monthFilter,
    sessionFilter,
    isMyFees,
    user,
    studentProfile,
  ]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    statusFilter,
    searchQuery,
    feeTypeFilter,
    monthFilter,
    sessionFilter,
    selectedClassFilter,
    selectedDivisionFilter,
  ]);

  // Fetch fees whenever query params change
  useEffect(() => {
    fetchFeesRequest(getFetchParams(page));
  }, [fetchFeesRequest, getFetchParams, page]);

  useEffect(() => {
    fetchStudentsRequest();
    fetchClassesRequest();
  }, [fetchStudentsRequest, fetchClassesRequest]);

  // Trigger add modal from parent (Header button)
  useEffect(() => {
    if (showAddModalTrigger && showAddModalTrigger > 0) {
      handleOpenAddModal();
    }
  }, [showAddModalTrigger]);

  // Role & search filtered fees
  const fees = useMemo(() => {
    let list = allFees;

    if (isMyFees || user?.role === "student") {
      if (studentProfile) {
        list = list.filter((f: any) => f.studentId === studentProfile.id);
      } else {
        list = list.filter((f: any) => f.studentName?.toLowerCase() === user?.name?.toLowerCase());
      }
    }

    return list.filter((fee) => {
      const matchesSearch =
        (fee.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fee.feeType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fee.rollNumber || "").includes(searchQuery) ||
        (fee.remarks || "").toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = isFeeMatchingStatus(fee, statusFilter);

      const matchesType = feeTypeFilter === "all" || fee.feeType === feeTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allFees, isMyFees, user, studentProfile, searchQuery, statusFilter, feeTypeFilter]);

  // Available classes for toolbar
  const availableClassesList = useMemo(() => {
    const classMap = new Map<string, string>();
    classes.forEach((c: any) => {
      const name = c.name || c.className;
      if (name) {
        const clean = String(name).split("-")[0].trim();
        classMap.set(clean, clean);
      }
    });
    students.forEach((s: any) => {
      const name = s.class_name || s.class;
      if (name) {
        const clean = String(name).split("-")[0].trim();
        classMap.set(clean, clean);
      }
    });
    fees.forEach((f) => {
      if (f.class) {
        const clean = String(f.class).split("-")[0].trim();
        classMap.set(clean, clean);
      }
    });
    return Array.from(classMap.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [classes, students, fees]);

  // Available divisions for toolbar
  const availableDivisionsList = useMemo(() => {
    const divSet = new Set<string>();

    classes.forEach((c: any) => {
      const cName = (c.name || c.className || "").split("-")[0].trim().toLowerCase();
      if (
        selectedClassFilter === "all" ||
        cName === selectedClassFilter.toLowerCase() ||
        (c.name || c.className || "").toLowerCase().includes(selectedClassFilter.toLowerCase())
      ) {
        if (c.section) divSet.add(String(c.section).trim());
        if (c.division) divSet.add(String(c.division).trim());
        if (c.divisions && Array.isArray(c.divisions)) {
          c.divisions.forEach((d: any) => d.name && divSet.add(String(d.name).trim()));
        }
      }
    });

    students.forEach((s: any) => {
      const sClass = (s.class_name || s.class || "").split("-")[0].trim().toLowerCase();
      if (
        selectedClassFilter === "all" ||
        sClass === selectedClassFilter.toLowerCase() ||
        (s.class_name || s.class || "").toLowerCase().includes(selectedClassFilter.toLowerCase())
      ) {
        const div = s.division_name || s.section;
        if (div) divSet.add(String(div).trim());
      }
    });

    fees.forEach((f) => {
      const fClass = (f.class || "").split("-")[0].trim().toLowerCase();
      if (
        selectedClassFilter === "all" ||
        fClass === selectedClassFilter.toLowerCase() ||
        (f.class || "").toLowerCase().includes(selectedClassFilter.toLowerCase())
      ) {
        if (f.section) divSet.add(String(f.section).trim());
        const parts = (f.class || "").split("-");
        if (parts.length > 1 && parts[1]) {
          divSet.add(parts[1].trim());
        }
      }
    });

    return Array.from(divSet).filter(Boolean).sort();
  }, [classes, students, fees, selectedClassFilter]);

  // Filtered fees based on class/division & month toolbar filters
  const filteredFees = useMemo(() => {
    return fees.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        (f.studentName && f.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.rollNumber && f.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.feeType && f.feeType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = isFeeMatchingStatus(f, statusFilter);
      const matchesType = feeTypeFilter === "all" || f.feeType === feeTypeFilter;
      const matchesMonth =
        monthFilter === "all" ||
        f.month === monthFilter ||
        Boolean(f.month && (f.month.endsWith("-" + monthFilter) || f.month.includes(monthFilter)));

      const fClass = (f.class || "").toLowerCase();
      const fSection = (f.section || "").toLowerCase();

      const matchesClass =
        selectedClassFilter === "all" ||
        fClass === selectedClassFilter.toLowerCase() ||
        fClass.startsWith(selectedClassFilter.toLowerCase() + "-") ||
        fClass.startsWith(selectedClassFilter.toLowerCase() + " ") ||
        fClass.includes(selectedClassFilter.toLowerCase());

      const matchesDivision =
        selectedDivisionFilter === "all" ||
        fSection === selectedDivisionFilter.toLowerCase() ||
        fClass.endsWith("-" + selectedDivisionFilter.toLowerCase()) ||
        fClass.endsWith(" " + selectedDivisionFilter.toLowerCase()) ||
        fClass.includes("-" + selectedDivisionFilter.toLowerCase());

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesMonth &&
        matchesClass &&
        matchesDivision
      );
    });
  }, [
    fees,
    searchQuery,
    statusFilter,
    feeTypeFilter,
    monthFilter,
    selectedClassFilter,
    selectedDivisionFilter,
  ]);

  // Pagination calculation
  const totalFeesCount = meta ? meta.total : filteredFees.length;
  const totalPages = meta ? meta.totalPages : Math.max(1, Math.ceil(totalFeesCount / limit));

  const paginatedFees = useMemo(() => {
    if (meta) return filteredFees;
    const start = (page - 1) * limit;
    return filteredFees.slice(start, start + limit);
  }, [filteredFees, page, limit, meta]);

  // Payment checkout items calculation
  const payingFeeItems = useMemo(() => {
    if (!payingFee) return [];
    if (Array.isArray((payingFee as any).feeIds) && (payingFee as any).feeIds.length > 0) {
      return fees.filter((f) => (payingFee as any).feeIds.map(String).includes(String(f.id)));
    }
    if (Array.isArray((payingFee as any).selectedMonths) && (payingFee as any).selectedMonths.length > 0) {
      return fees.filter(
        (f) =>
          String(f.studentId) === String(payingFee.studentId) &&
          (payingFee as any).selectedMonths.includes(f.month) &&
          f.status !== "paid"
      );
    }
    if ((payingFee as any).payAllPendingMonths) {
      return fees.filter(
        (f) =>
          String(f.studentId) === String(payingFee.studentId) &&
          f.status !== "paid"
      );
    }
    const matches = fees.filter(
      (f) =>
        String(f.studentId) === String(payingFee.studentId) &&
        (f.month === payingFee.month || !payingFee.month) &&
        f.status !== "paid"
    );
    return matches.length > 0 ? matches : [payingFee];
  }, [payingFee, fees]);

  const checkoutTotalAmount = useMemo(() => {
    return payingFeeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [payingFeeItems]);

  // Payment checkout handler
  const handlePay = useCallback(async () => {
    if (!payingFee) return;
    setProcessing(true);
    try {
      let itemsToPay: any[] = [];
      if (Array.isArray((payingFee as any).feeIds) && (payingFee as any).feeIds.length > 0) {
        itemsToPay = allFees.filter((f: any) => (payingFee as any).feeIds.map(String).includes(String(f.id)));
      } else if (Array.isArray((payingFee as any).selectedMonths) && (payingFee as any).selectedMonths.length > 0) {
        itemsToPay = allFees.filter(
          (f: any) =>
            String(f.studentId) === String(payingFee.studentId) &&
            (payingFee as any).selectedMonths.includes(f.month) &&
            f.status !== "paid"
        );
      } else if ((payingFee as any).payAllPendingMonths) {
        itemsToPay = allFees.filter(
          (f: any) =>
            String(f.studentId) === String(payingFee.studentId) &&
            f.status !== "paid"
        );
      } else {
        const relatedFees = allFees.filter(
          (f: any) =>
            String(f.studentId) === String(payingFee.studentId) &&
            (f.month === payingFee.month || !payingFee.month) &&
            f.status !== "paid"
        );
        itemsToPay = relatedFees.length > 0 ? relatedFees : [payingFee];
      }

      const feeIds = itemsToPay.map((item: any) => item.id);

      const methodLabel =
        paymentMethod === "credit_card"
          ? "Credit / Debit Card"
          : paymentMethod === "upi"
            ? "UPI / QR Code"
            : paymentMethod === "net_banking"
              ? "Net Banking"
              : "Mobile Wallet";

      const res = await feeService.payStudentFeeBundle(schoolId, {
        studentId: String(payingFee.studentId),
        feeIds,
        paymentMethod: methodLabel,
        remarks: `Paid via Online Gateway (${methodLabel})`,
      });

      if (res && res.receiptNumber) {
        toast.success(`Payment of ₹${res.totalAmount.toLocaleString()} processed! Receipt generated: ${res.receiptNumber}`);
        fetchFeesRequest(getFetchParams(page));
        if (onFeeUpdated) onFeeUpdated();
        setProcessing(false);
        setPayingFee(null);

        const receiptDetails = await feeService.getReceiptByNumber(res.receiptNumber);
        if (receiptDetails) {
          setActiveReceipt({
            receiptNo: receiptDetails.receiptNumber,
            studentId: receiptDetails.studentId,
            studentName: receiptDetails.studentName,
            rollNumber: receiptDetails.rollNumber,
            class: receiptDetails.class,
            month: receiptDetails.monthsCovered,
            paidDate: receiptDetails.paymentDate,
            paymentMethod: methodLabel,
            status: "paid",
            items: (receiptDetails.fees || []).map((f: any) => ({
              id: f.id,
              feeType: f.feeType || "tuition",
              label: `${(f.feeType || "tuition").toUpperCase()} FEE (${f.month || "N/A"})`,
              amount: Number(f.amount || 0),
              remarks: f.remarks || "",
            })),
            totalAmount: receiptDetails.totalAmount,
          });
        }
      }
    } catch (err) {
      console.error("Pay bundle error", err);
      toast.error("Failed to process fee payment.");
      setProcessing(false);
    }
  }, [payingFee, paymentMethod, allFees, schoolId, page, getFetchParams, fetchFeesRequest, onFeeUpdated]);

  // View Receipt Handler
  const handleViewReceipt = useCallback(async (fee: FeeRecord) => {
    if (fee.receiptNumber) {
      try {
        const receiptData = await feeService.getReceiptByNumber(fee.receiptNumber);
        if (receiptData) {
          setActiveReceipt({
            receiptNo: receiptData.receiptNumber,
            studentId: receiptData.studentId,
            studentName: receiptData.studentName,
            rollNumber: receiptData.rollNumber,
            class: receiptData.class,
            month: receiptData.monthsCovered,
            paidDate: receiptData.paymentDate,
            paymentMethod: receiptData.paymentMethod,
            status: "paid",
            items: (receiptData.fees || []).map((f: any) => ({
              id: f.id,
              feeType: f.feeType || "tuition",
              label: `${(f.feeType || "tuition").toUpperCase()} FEE (${f.month || "N/A"})`,
              amount: Number(f.amount || 0),
              remarks: f.remarks || "",
            })),
            totalAmount: receiptData.totalAmount,
          });
          return;
        }
      } catch (err) {
        console.warn("Could not fetch DB receipt by receipt number", err);
      }
    }

    const matchingFees = allFees.filter(
      (f: any) => String(f.studentId) === String(fee.studentId) && f.month === fee.month
    );
    const items = matchingFees.length > 0 ? matchingFees : [fee];
    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const isPaid = items.every((item) => item.status === "paid");
    const anyPaid = items.some((item) => item.status === "paid");

    setActiveReceipt({
      receiptNo: fee.receiptNumber || `REC-${new Date().getFullYear()}-${fee.id}`,
      studentId: fee.studentId,
      studentName: fee.studentName || "Student",
      rollNumber: fee.rollNumber || "",
      class: fee.class || "",
      month: fee.month || new Date().toISOString().slice(0, 7),
      dueDate: fee.dueDate,
      paidDate: fee.paidDate || undefined,
      paymentMethod: fee.remarks || "Online Gateway / Settlement",
      status: isPaid ? "paid" : anyPaid ? "partially_paid" : "pending",
      items: items.map((f) => ({
        id: f.id,
        feeType: f.feeType || (f as any).type || "tuition",
        label: (f.feeType || (f as any).type || "tuition").toUpperCase() + " FEE",
        amount: Number(f.amount || 0),
        remarks: f.remarks || "",
      })),
      totalAmount,
    });
  }, [allFees]);

  // Delete fee handler
  const handleDeleteFee = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this fee record?")) {
        deleteFeeRequest(id);
        toast.info("Fee record deleted");
        if (onFeeUpdated) onFeeUpdated();
      }
    },
    [deleteFeeRequest, onFeeUpdated]
  );

  // Add / Edit Modal setup
  const handleOpenAddModal = useCallback(() => {
    setEditingFee(null);
    setFormData({
      studentId: "",
      studentName: "",
      rollNumber: "",
      class: "",
      section: "",
      feeType: "tuition",
      amount: "",
      dueDate: new Date().toISOString().slice(0, 10),
      status: "pending",
      remarks: "",
      isMultiFee: true,
      selectedFeeItems: DEFAULT_SELECTED_FEE_ITEMS,
    });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleOpenEditModal = useCallback((fee: FeeRecord) => {
    const defaultFeeTypes = DEFAULT_FEE_TYPES;

    // Parse remarks to extract component type, amount, or billing months
    const parsed = parseFeeRemarks(fee.remarks);

    const currentFeeType = (parsed.componentType || fee.feeType || "tuition").toLowerCase();
    const currentAmount =
      fee.amount !== undefined && fee.amount !== null && Number(fee.amount) > 0
        ? String(fee.amount)
        : (parsed.extractedAmount || (fee.amount !== undefined ? String(fee.amount) : ""));

    const feeTypes = [...defaultFeeTypes];
    if (currentFeeType && !feeTypes.some((item) => item.id === currentFeeType)) {
      feeTypes.push({
        id: currentFeeType,
        label: `${currentFeeType.charAt(0).toUpperCase() + currentFeeType.slice(1)} Fee`,
      });
    }

    const initialSelectedFeeItems = feeTypes.map((item) => {
      const isCurrent = item.id === currentFeeType;
      return {
        feeType: item.id,
        label: item.label,
        amount: isCurrent ? currentAmount : "",
        selected: isCurrent,
      };
    });

    const formatDateStr = (dateVal?: any) => {
      if (!dateVal) return "";
      const str = String(dateVal);
      if (str.includes("T")) return str.slice(0, 10);
      try {
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      } catch {
        // ignore
      }
      return str.slice(0, 10);
    };

    const formattedDueDate = formatDateStr(fee.dueDate) || new Date().toISOString().slice(0, 10);
    const formattedPaidDate = formatDateStr(fee.paidDate) || (fee.status === "paid" ? new Date().toISOString().slice(0, 10) : "");

    // Get billing coverage months from remarks or fallback to fee.month
    const billingCoverage = parsed.coveredMonthsText || fee.month || "";

    setEditingFee(fee);
    setFormData({
      ...fee,
      dueDate: formattedDueDate,
      paidDate: formattedPaidDate,
      feeType: currentFeeType,
      amount: currentAmount,
      billingMonthsFromRemark: billingCoverage,
      amountBreakup: parsed.breakup,
      selectedFeeItems: initialSelectedFeeItems,
      isMultiFee: true,
    });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleSaveFee = useCallback(async () => {
    setFormError(null);

    if (!formData.studentId && !formData.studentName) {
      setFormError("Please select a student from the dropdown list.");
      return;
    }

    if (!formData.dueDate) {
      setFormError("Due date is required.");
      return;
    }

    // Editing mode: Update the single existing fee record
    if (editingFee) {
      let feeType = formData.feeType || "tuition";
      let amount = Number(formData.amount || 0);

      if (Array.isArray(formData.selectedFeeItems)) {
        const activeItem =
          formData.selectedFeeItems.find(
            (item: any) => item.feeType === feeType && item.selected
          ) || formData.selectedFeeItems.find((item: any) => item.selected);

        if (activeItem) {
          feeType = activeItem.feeType || feeType;
          amount = Number(activeItem.amount || amount);
        }
      }

      const payload = {
        ...formData,
        studentId: formData.studentId,
        studentName: formData.studentName,
        rollNumber: formData.rollNumber || "",
        class: formData.class || "",
        feeType: feeType,
        amount: amount,
        month: formData.month || new Date().toISOString().slice(0, 7),
        dueDate: formData.dueDate || new Date().toISOString().slice(0, 10),
        status: formData.status || "pending",
        paidDate: formData.status === "paid" ? (formData.paidDate || new Date().toISOString().slice(0, 10)) : null,
        remarks: formData.remarks || "",
      };

      updateFeeRequest({ id: editingFee.id, fee: payload });
      toast.success("Fee record updated successfully");
      setShowAddEditModal(false);
      setEditingFee(null);
      setFormData({});
      if (onFeeUpdated) onFeeUpdated();
      return;
    }

    // Multi-Fee and Multi-Month Bundle creation mode
    if (formData.isMultiFee && Array.isArray(formData.selectedFeeItems) && formData.selectedFeeItems.length > 0) {
      const activeItems = formData.selectedFeeItems.filter((item: any) => item.selected && Number(item.amount) > 0);
      if (activeItems.length === 0) {
        setFormError("Please select at least one fee component with an amount > 0.");
        return;
      }

      const monthsToProcess = (Array.isArray(formData.selectedMonths) && formData.selectedMonths.length > 0)
        ? formData.selectedMonths
        : [formData.month || new Date().toISOString().slice(0, 7)];

      const isPaid = formData.status === "paid";
      const paidDateStr = isPaid ? (formData.paidDate || new Date().toISOString().slice(0, 10)) : undefined;

      try {
        const res = await feeService.createFee({
          schoolId,
          studentId: formData.studentId,
          studentName: formData.studentName,
          rollNumber: formData.rollNumber || "",
          class: formData.class || "",
          dueDate: formData.dueDate || new Date().toISOString().slice(0, 10),
          status: formData.status || "pending",
          paidDate: paidDateStr,
          remarks: formData.remarks || "",
          paymentMethod: isPaid ? "Direct Cash / Settlement" : "Invoice Issued",
          selectedFeeItems: activeItems,
          selectedMonths: monthsToProcess,
        });

        toast.success(`Created fee entries for ${formData.studentName} under receipt ${res.receiptNumber || 'generated'}`);
        fetchFeesRequest(getFetchParams(page));
        if (onFeeUpdated) onFeeUpdated();

        if (res && res.receiptNumber) {
          const receiptDetails = await feeService.getReceiptByNumber(res.receiptNumber);
          if (receiptDetails) {
            setActiveReceipt({
              receiptNo: receiptDetails.receiptNumber,
              studentId: receiptDetails.studentId,
              studentName: receiptDetails.studentName,
              rollNumber: receiptDetails.rollNumber,
              class: receiptDetails.class,
              month: receiptDetails.monthsCovered,
              paidDate: receiptDetails.paymentDate,
              paymentMethod: receiptDetails.paymentMethod,
              status: formData.status || "pending",
              items: (receiptDetails.fees || []).map((f: any) => ({
                id: f.id,
                feeType: f.feeType || "tuition",
                label: `${(f.feeType || "tuition").toUpperCase()} FEE (${f.month || "N/A"})`,
                amount: Number(f.amount || 0),
                remarks: f.remarks || "",
              })),
              totalAmount: receiptDetails.totalAmount,
            });
          }
        }
      } catch (err) {
        console.error("Create fee error", err);
        toast.error("Failed to create fee entries.");
      }

      setShowAddEditModal(false);
      setEditingFee(null);
      setFormData({});
      return;
    }

    const payload = {
      ...formData,
      studentId: formData.studentId,
      studentName: formData.studentName,
      rollNumber: formData.rollNumber || "",
      class: formData.class || "",
      feeType: formData.feeType || "tuition",
      amount: Number(formData.amount || 0),
      month: formData.month || new Date().toISOString().slice(0, 7),
      dueDate: formData.dueDate || new Date().toISOString().slice(0, 10),
      status: formData.status || "pending",
      paidDate: formData.status === "paid" ? (formData.paidDate || new Date().toISOString().slice(0, 10)) : null,
      remarks: formData.remarks || "",
    };

    createFeeRequest(payload);
    toast.success("Fee record created successfully");
    if (onFeeUpdated) onFeeUpdated();

    setShowAddEditModal(false);
    setEditingFee(null);
    setFormData({});
  }, [formData, editingFee, createFeeRequest, updateFeeRequest, schoolId, page, getFetchParams, fetchFeesRequest, onFeeUpdated]);

  // Modal Student filter options
  useEffect(() => {
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

  const availableModalClasses = useMemo(() => {
    const classMap = new Map<string, string>();
    classes.forEach((c: any) => {
      const name = c.name || c.className;
      if (name) classMap.set(String(name), String(name));
    });
    students.forEach((s: any) => {
      const name = s.class_name || s.class;
      if (name) classMap.set(String(name), String(name));
    });
    return Array.from(classMap.values()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes, students]);

  const availableModalDivisions = useMemo(() => {
    const divSet = new Set<string>();
    if (modalSelectedClass !== "all") {
      classes
        .filter((c: any) => (c.name || c.className) === modalSelectedClass)
        .forEach((c: any) => {
          if (c.section) divSet.add(c.section);
          if (c.division) divSet.add(c.division);
          if (c.divisions && Array.isArray(c.divisions)) {
            c.divisions.forEach((d: any) => d.name && divSet.add(d.name));
          }
        });
      students
        .filter((s: any) => (s.class_name || s.class) === modalSelectedClass)
        .forEach((s: any) => {
          const div = s.division_name || s.section;
          if (div) divSet.add(div);
        });
    } else {
      students.forEach((s: any) => {
        const div = s.division_name || s.section;
        if (div) divSet.add(div);
      });
    }
    return Array.from(divSet).sort();
  }, [classes, students, modalSelectedClass]);

  const modalFilteredStudents = useMemo(() => {
    const query = modalStudentSearch.toLowerCase().trim();
    return students.filter((s: any) => {
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

  const modalDisplayedStudents = useMemo(() => {
    const topSlice = modalFilteredStudents.slice(0, 50);
    if (formData?.studentId && !topSlice.some((s: any) => String(s.id) === String(formData.studentId))) {
      const selectedObj = students.find((s: any) => String(s.id) === String(formData.studentId));
      if (selectedObj) {
        return [selectedObj, ...topSlice];
      }
    }
    return topSlice;
  }, [modalFilteredStudents, formData?.studentId, students]);

  const lookupFeeAmount = useCallback(
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

  const availableFeeComponents = useMemo(() => {
    const list = [...BASE_FEE_COMPONENTS];

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

  const displayedComponents = useMemo(() => {
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
    const selected = students.find((s: any) => String(s.id) === String(studentId));
    if (selected) {
      const sName = selected.name || selected.user?.name || (selected as any).studentName || "";
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

  const handleToggleMultiFeeItem = (feeType: string) => {
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

  const multiFeeTotalSum = useMemo(() => {
    if (!formData.selectedFeeItems || !Array.isArray(formData.selectedFeeItems)) return 0;
    const baseSum = formData.selectedFeeItems.reduce((sum: number, item: any) => {
      if (item.selected && item.amount) {
        return sum + Number(item.amount || 0);
      }
      return sum;
    }, 0);

    const monthMultiplier = (Array.isArray(formData.selectedMonths) && formData.selectedMonths.length > 0)
      ? formData.selectedMonths.length
      : 1;

    return baseSum * monthMultiplier;
  }, [formData.selectedFeeItems, formData.selectedMonths]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search & Filters Toolbar */}
      <FeesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        feeTypeFilter={feeTypeFilter}
        setFeeTypeFilter={setFeeTypeFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        sessionFilter={sessionFilter}
        setSessionFilter={setSessionFilter}
        selectedClassFilter={selectedClassFilter}
        setSelectedClassFilter={(val) => {
          setSelectedClassFilter(val);
          setSelectedDivisionFilter("all");
        }}
        selectedDivisionFilter={selectedDivisionFilter}
        setSelectedDivisionFilter={setSelectedDivisionFilter}
        availableClasses={availableClassesList}
        availableDivisions={availableDivisionsList}
        classes={classes}
        isMyFees={isMyFees}
        activeSubTab="invoices"
        filteredCount={filteredFees.length}
      />

      {/* Main Invoices Table */}
      <FeesTable
        fees={fees}
        loading={loading}
        isMyFees={isMyFees}
        totalFeesCount={totalFeesCount}
        paginatedFees={paginatedFees}
        currentPage={page}
        setCurrentPage={setPage}
        pageSize={limit}
        setPageSize={setLimit}
        totalPages={totalPages}
        handleViewReceipt={handleViewReceipt}
        setPayingFee={setPayingFee}
        handleOpenEditModal={handleOpenEditModal}
        handleDeleteFee={handleDeleteFee}
      />

      {/* Payment Gateway Checkout Modal */}
      {payingFee && (
        <CheckoutModal
          payingFee={payingFee}
          setPayingFee={setPayingFee}
          payingFeeItems={payingFeeItems}
          checkoutTotalAmount={checkoutTotalAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          processing={processing}
          handlePay={handlePay}
        />
      )}

      {/* Add / Edit Student Fee Modal */}
      {showAddEditModal && (
        <AddEditFeeModal
          showAddEditModal={showAddEditModal}
          setShowAddEditModal={setShowAddEditModal}
          editingFee={editingFee}
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          handleSaveFee={handleSaveFee}
          modalFilteredStudents={modalFilteredStudents}
          modalDisplayedStudents={modalDisplayedStudents}
          modalSelectedClass={modalSelectedClass}
          setModalSelectedClass={setModalSelectedClass}
          modalSelectedDiv={modalSelectedDiv}
          setModalSelectedDiv={setModalSelectedDiv}
          modalStudentSearch={modalStudentSearch}
          setModalStudentSearch={setModalStudentSearch}
          availableModalClasses={availableModalClasses}
          availableModalDivisions={availableModalDivisions}
          handleStudentSelect={handleStudentSelect}
          displayedComponents={displayedComponents}
          lookupFeeAmount={lookupFeeAmount}
          handleToggleMultiFeeItem={handleToggleMultiFeeItem}
          handleUpdateMultiFeeAmount={handleUpdateMultiFeeAmount}
          multiFeeTotalSum={multiFeeTotalSum}
        />
      )}

      {/* Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          activeReceipt={activeReceipt}
          setActiveReceipt={setActiveReceipt}
          fees={fees}
        />
      )}
    </div>
  );
}

export const FeeInvoicesContainer = connector(FeeInvoicesContainerContent);
export default FeeInvoicesContainer;
