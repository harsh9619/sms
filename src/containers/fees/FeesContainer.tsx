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

  // Class Fee Structures State
  const [classFeeStructures, setClassFeeStructures] = useState<ClassFeeStructureItem[]>([]);
  const [showStructModal, setShowStructModal] = useState(false);
  const [editingStruct, setEditingStruct] = useState<ClassFeeStructureItem | null>(null);
  const [structFormData, setStructFormData] = useState<any>({});

  // Auto Generate Invoices State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateClassId, setGenerateClassId] = useState("");
  const [generateDueDate, setGenerateDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [isGenerating, setIsGenerating] = useState(false);

  // Payment checkout state
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);

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
    };
    if (isMyFees || user?.role === "student") {
      if (studentProfile) {
        params.studentId = studentProfile.id;
      }
    }
    fetchFeesRequest(params);
  }, [fetchFeesRequest, schoolId, page, limit, searchQuery, statusFilter, feeTypeFilter, isMyFees, user, studentProfile]);

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
  const handlePay = useCallback(() => {
    if (!payingFee) return;
    setProcessing(true);
    setTimeout(() => {
      const payload = {
        ...payingFee,
        status: "paid",
        paidDate: new Date().toISOString().slice(0, 10),
        remarks: `Paid via Online Gateway (${paymentMethod})`,
      };

      updateFeeRequest({ id: payingFee.id, fee: payload });
      toast.success(`Payment of ₹${payingFee.amount} processed successfully!`);
      setProcessing(false);
      setPayingFee(null);
    }, 1200);
  }, [payingFee, paymentMethod, updateFeeRequest]);

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

  const handleSaveFee = useCallback(() => {
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

    // Multi-Fee Bundle creation mode (When adding NEW fee records)
    if (formData.isMultiFee && Array.isArray(formData.selectedFeeItems) && formData.selectedFeeItems.length > 0) {
      const activeItems = formData.selectedFeeItems.filter((item: any) => item.selected && Number(item.amount) > 0);
      if (activeItems.length === 0) {
        setFormError("Please select at least one fee component with an amount > 0.");
        return;
      }

      let count = 0;
      activeItems.forEach((item: any) => {
        const itemPayload = {
          studentId: formData.studentId,
          studentName: formData.studentName,
          rollNumber: formData.rollNumber || "",
          class: formData.class || "",
          feeType: item.feeType || "tuition",
          amount: Number(item.amount),
          dueDate: formData.dueDate || new Date().toISOString().slice(0, 10),
          status: formData.status || "pending",
          paidDate: formData.status === "paid" ? (formData.paidDate || new Date().toISOString().slice(0, 10)) : null,
          remarks: item.remarks || formData.remarks || "",
        };
        createFeeRequest(itemPayload);
        count++;
      });

      toast.success(`Successfully created ${count} fee records for ${formData.studentName}`);
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
      classMasterId: "7",
      feeName: "",
      feeType: "tuition",
      amount: "",
      frequency: "monthly",
      dueDay: 10,
      isMandatory: true,
      description: "",
    });
    setShowStructModal(true);
  }, []);

  const handleOpenEditStructModal = useCallback((item: ClassFeeStructureItem) => {
    setEditingStruct(item);
    setStructFormData({ ...item });
    setShowStructModal(true);
  }, []);

  const handleSaveStruct = useCallback(async () => {
    if (!structFormData.feeName || !structFormData.amount) {
      toast.error("Fee Name and Amount are required!");
      return;
    }
    try {
      await feeService.saveClassFeeStructure(schoolId, {
        ...structFormData,
        id: editingStruct?.id,
        amount: Number(structFormData.amount || 0),
        dueDay: Number(structFormData.dueDay || 10),
      });
      toast.success(editingStruct ? "Class fee structure updated" : "Class fee structure saved");
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
      const res = await feeService.generateClassInvoices(schoolId, generateClassId, generateDueDate);
      toast.success(res.message || "Generated invoices successfully!");
      setShowGenerateModal(false);
      fetchFeesRequest();
    } catch (err) {
      toast.error("Failed to generate class invoices");
    } finally {
      setIsGenerating(false);
    }
  }, [schoolId, generateClassId, generateDueDate, fetchFeesRequest]);

  const handleExportExcel = useCallback(() => {
    try {
      const data = fees.map((f) => ({
        "Student Name": f.studentName || "",
        "Roll No": f.rollNumber || "",
        Class: f.class || "",
        Section: f.section || "",
        "Fee Type": f.feeType || "",
        "Amount (₹)": f.amount || 0,
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
      isMyFees={isMyFees}
      payingFee={payingFee}
      setPayingFee={setPayingFee}
      paymentMethod={paymentMethod}
      setPaymentMethod={setPaymentMethod}
      processing={processing}
      handlePay={handlePay}
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
      handleGenerateInvoices={handleGenerateInvoices}
      isGenerating={isGenerating}
    />
  );
}

export const FeesContainer = connector(FeesContainerContent);
export default FeesContainer;
