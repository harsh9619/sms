import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { AppState } from "../../saga/rootReducer";
import {
  fetchFeesRequest,
  fetchStudentsRequest,
  fetchClassesRequest,
  createFeeRequest,
  updateFeeRequest,
  deleteFeeRequest,
} from "../../saga";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { FeesUI } from "../../components/modules/fees/FeesUI";
import { generateFeeSummaryReport } from "../../lib/reportUtils";
import feeService, { ClassFeeStructureItem } from "../../Services/fee.service";
import type { FeeRecord } from "../../types";

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

export interface FeesContainerProps extends PropsFromRedux {
  isMyFees?: boolean;
}

function FeesContainerContent({
  allFees,
  meta,
  students,
  classes,
  loading,
  error,
  fetchFeesRequest,
  fetchStudentsRequest,
  fetchClassesRequest,
  createFeeRequest,
  updateFeeRequest,
  deleteFeeRequest,
  isMyFees = false,
}: FeesContainerProps) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const schoolId = activeSchool?.id || "1";

  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "structures">("invoices");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>("all");
  const [monthFilter, setMonthFilter] = useState<string>("all");

  // Class Fee Structures State
  const [classFeeStructures, setClassFeeStructures] = useState<ClassFeeStructureItem[]>([]);
  const [showStructModal, setShowStructModal] = useState(false);
  const [editingStruct, setEditingStruct] = useState<ClassFeeStructureItem | null>(null);
  const [structFormData, setStructFormData] = useState<any>({});

  // Auto Generate Invoices State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateClassId, setGenerateClassId] = useState("");
  const [generateDueDate, setGenerateDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isGenerating, setIsGenerating] = useState(false);

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

  const fetchClassFeeStructures = useCallback(async () => {
    try {
      const data = await feeService.getClassFeeStructures(schoolId);
      if (Array.isArray(data)) {
        setClassFeeStructures(data);
      }
    } catch (err) {
      console.error("Failed to fetch class fee structures:", err);
    }
  }, [schoolId]);

  const studentProfile = useMemo(() => {
    if (user?.role === "student") {
      return students.find((s: any) => s.email === user.email) || null;
    }
    return null;
  }, [students, user]);

  useEffect(() => {
    const params: any = {
      schoolId,
      page,
      limit,
      search: searchQuery || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      feeType: feeTypeFilter !== "all" ? feeTypeFilter : undefined,
      month: monthFilter !== "all" ? monthFilter : undefined,
    };
    if (isMyFees || user?.role === "student") {
      if (studentProfile) {
        params.studentId = studentProfile.id;
      }
    }
    fetchFeesRequest(params);
  }, [fetchFeesRequest, schoolId, page, limit, searchQuery, statusFilter, feeTypeFilter, monthFilter, isMyFees, user, studentProfile]);

  useEffect(() => {
    fetchStudentsRequest();
    fetchClassesRequest();
    fetchClassFeeStructures();
  }, [fetchStudentsRequest, fetchClassesRequest, fetchClassFeeStructures]);

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

      const matchesStatus = statusFilter === "all" || fee.status === statusFilter;
      const matchesType = feeTypeFilter === "all" || fee.feeType === feeTypeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allFees, isMyFees, user, studentProfile, searchQuery, statusFilter, feeTypeFilter]);

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
        fetchFeesRequest();
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
  }, [payingFee, paymentMethod, allFees, schoolId, fetchFeesRequest]);

  // Add / Edit Student Fee handlers
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
      selectedFeeItems: [
        { feeType: "tuition", label: "Tuition Fee", amount: "", selected: true },
        { feeType: "exam", label: "Exam Fee", amount: "", selected: false },
        { feeType: "transport", label: "Transport Fee", amount: "", selected: false },
        { feeType: "library", label: "Library Fee", amount: "", selected: false },
        { feeType: "sports", label: "Sports Fee", amount: "", selected: false },
        { feeType: "other", label: "Other Fee", amount: "", selected: false },
      ],
    });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleOpenEditModal = useCallback((fee: FeeRecord) => {
    const defaultFeeTypes = [
      { id: "tuition", label: "Tuition Fee" },
      { id: "exam", label: "Exam Fee" },
      { id: "transport", label: "Transport Fee" },
      { id: "library", label: "Library Fee" },
      { id: "sports", label: "Sports Fee" },
      { id: "other", label: "Other Fee" },
    ];

    const currentFeeType = (fee.feeType || "tuition").toLowerCase();
    const currentAmount = fee.amount !== undefined && fee.amount !== null ? String(fee.amount) : "";

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

    setEditingFee(fee);
    setFormData({
      ...fee,
      dueDate: formattedDueDate,
      paidDate: formattedPaidDate,
      feeType: currentFeeType,
      amount: currentAmount,
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
      return;
    }

    // Multi-Fee and Multi-Month Bundle creation mode (When adding NEW fee records)
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
        fetchFeesRequest();

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

    setShowAddEditModal(false);
    setEditingFee(null);
    setFormData({});
  }, [formData, editingFee, createFeeRequest, updateFeeRequest]);

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
        feeType: f.feeType || f.type || "tuition",
        label: (f.feeType || f.type || "tuition").toUpperCase() + " FEE",
        amount: Number(f.amount || 0),
        remarks: f.remarks || "",
      })),
      totalAmount,
    });
  }, [allFees]);

  const handleDeleteFee = useCallback(
    (id: string) => {
      if (window.confirm("Are you sure you want to delete this fee record?")) {
        deleteFeeRequest(id);
        toast.info("Fee record deleted");
      }
    },
    [deleteFeeRequest]
  );

  // Class Fee Structure Handlers
  const handleOpenAddStructModal = useCallback(() => {
    setEditingStruct(null);
    setStructFormData({
      classMasterId: "3",
      classMasterIds: ["3", "4"], // Default Class 1 and Class 2 selected
      feeName: "",
      feeType: "tuition",
      amount: "",
      frequency: "monthly",
      dueDay: 10,
      month: "all",
      isMandatory: true,
      description: "",
    });
    setShowStructModal(true);
  }, []);

  const handleOpenEditStructModal = useCallback((item: ClassFeeStructureItem) => {
    setEditingStruct(item);
    setStructFormData({
      ...item,
      classMasterIds: [String(item.classMasterId)],
    });
    setShowStructModal(true);
  }, []);

  const handleSaveStruct = useCallback(async () => {
    if (!structFormData.feeName || !structFormData.amount) {
      toast.error("Fee Name and Amount are required!");
      return;
    }

    const selectedIds = (structFormData.classMasterIds && structFormData.classMasterIds.length > 0)
      ? structFormData.classMasterIds
      : (structFormData.classMasterId ? [String(structFormData.classMasterId)] : []);

    if (selectedIds.length === 0) {
      toast.error("Please select at least one Class Grade!");
      return;
    }

    try {
      if (editingStruct) {
        await feeService.saveClassFeeStructure(schoolId, {
          ...structFormData,
          id: editingStruct.id,
          classMasterId: selectedIds[0],
          amount: Number(structFormData.amount || 0),
          dueDay: Number(structFormData.dueDay || 10),
        });
        toast.success("Class fee structure updated");
      } else {
        await feeService.saveClassFeeStructure(schoolId, {
          ...structFormData,
          classMasterIds: selectedIds.map(Number),
          classMasterId: selectedIds[0],
          amount: Number(structFormData.amount || 0),
          dueDay: Number(structFormData.dueDay || 10),
        });
        toast.success(`Class fee structure created for ${selectedIds.length} class(es)`);
      }
      setShowStructModal(false);
      fetchClassFeeStructures();
    } catch (err) {
      toast.error("Failed to save class fee structure");
    }
  }, [schoolId, structFormData, editingStruct, fetchClassFeeStructures]);

  const handleDeleteStruct = useCallback(
    async (id: string) => {
      if (window.confirm("Delete this class fee component?")) {
        try {
          await feeService.deleteClassFeeStructure(schoolId, id);
          toast.info("Class fee structure component deleted");
          fetchClassFeeStructures();
        } catch (err) {
          toast.error("Failed to delete component");
        }
      }
    },
    [schoolId, fetchClassFeeStructures]
  );

  // Auto Generate Invoices Handler
  const handleGenerateInvoices = useCallback(async () => {
    if (!generateClassId) {
      toast.error("Please select a Class Grade first");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await feeService.generateClassInvoices(schoolId, generateClassId, generateDueDate, generateMonth);
      toast.success(res.message || "Generated invoices successfully!");
      setGenerateClassId("");
      setGenerateDueDate("");
      setShowGenerateModal(false);
      fetchFeesRequest();
    } catch (err) {
      toast.error("Failed to generate class invoices");
    } finally {
      setIsGenerating(false);
    }
  }, [schoolId, generateClassId, generateDueDate, generateMonth, fetchFeesRequest]);

  const handleExportExcel = useCallback(() => {
    try {
      const data = fees.map((f) => ({
        "Student Name": f.studentName || "",
        "Roll No": f.rollNumber || "",
        Class: f.class || "",
        Section: f.section || "",
        "Fee Type": f.feeType || "",
        "Amount (₹)": f.amount || 0,
        Month: f.month || "",
        "Due Date": f.dueDate || "",
        "Paid Date": f.paidDate || "-",
        Status: f.status || "",
        Remarks: f.remarks || "",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Fees Ledger");
      XLSX.writeFile(wb, `Fee_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err) {
      toast.error("Failed to export Excel report");
    }
  }, [fees]);

  const handleExportSummary = useCallback(() => {
    if (fees.length > 0) {
      generateFeeSummaryReport(fees);
    } else {
      toast.warn("No fee records to export summary");
    }
  }, [fees]);

  return (
    <FeesUI
      fees={fees}
      students={students}
      classes={classes}
      classFeeStructures={classFeeStructures}
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
      feeTypeFilter={feeTypeFilter}
      setFeeTypeFilter={setFeeTypeFilter}
      monthFilter={monthFilter}
      setMonthFilter={setMonthFilter}
      isMyFees={isMyFees}
      payingFee={payingFee}
      setPayingFee={setPayingFee}
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      processing={processing}
      handlePay={handlePay}
      activeReceipt={activeReceipt}
      setActiveReceipt={setActiveReceipt}
      handleViewReceipt={handleViewReceipt}
      showAddEditModal={showAddEditModal}
      setShowAddEditModal={setShowAddEditModal}
      editingFee={editingFee}
      formData={formData}
      setFormData={setFormData}
      formError={formError}
      handleSaveFee={handleSaveFee}
      handleDeleteFee={handleDeleteFee}
      handleOpenAddModal={handleOpenAddModal}
      handleOpenEditModal={handleOpenEditModal}
      handleExportExcel={handleExportExcel}
      handleExportSummary={handleExportSummary}
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
      showGenerateModal={showGenerateModal}
      setShowGenerateModal={setShowGenerateModal}
      generateClassId={generateClassId}
      setGenerateClassId={setGenerateClassId}
      generateDueDate={generateDueDate}
      setGenerateDueDate={setGenerateDueDate}
      generateMonth={generateMonth}
      setGenerateMonth={setGenerateMonth}
      handleGenerateInvoices={handleGenerateInvoices}
      isGenerating={isGenerating}
    />
  );
}

export const FeesContainer = connector(FeesContainerContent);
export default FeesContainer;
