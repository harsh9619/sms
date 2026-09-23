import React, { useState, useEffect, useMemo, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { Dispatch } from "redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { AppState } from "../../saga/rootReducer";
import {
  fetchFeesRequest,
  fetchStudentsRequest,
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
  students: state.students.students,
  loading: state.fees.loading,
  error: state.fees.error,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  fetchFeesRequest: () => dispatch(fetchFeesRequest()),
  fetchStudentsRequest: () => dispatch(fetchStudentsRequest()),
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
  students,
  loading,
  error,
  fetchFeesRequest,
  fetchStudentsRequest,
  createFeeRequest,
  updateFeeRequest,
  deleteFeeRequest,
  isMyFees = false,
}: FeesContainerProps) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const schoolId = activeSchool?.id || "1";

  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "structures">("invoices");

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

  useEffect(() => {
    fetchFeesRequest();
    fetchStudentsRequest();
    fetchClassFeeStructures();
  }, [fetchFeesRequest, fetchStudentsRequest, fetchClassFeeStructures]);

  const studentProfile = useMemo(() => {
    if (user?.role === "student") {
      return students.find((s: any) => s.email === user.email) || null;
    }
    return null;
  }, [students, user]);

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
      studentName: "",
      rollNumber: "",
      feeType: "tuition",
      amount: "",
      dueDate: new Date().toISOString().slice(0, 10),
      status: "pending",
      remarks: "",
    });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleOpenEditModal = useCallback((fee: FeeRecord) => {
    setEditingFee(fee);
    setFormData({ ...fee });
    setFormError(null);
    setShowAddEditModal(true);
  }, []);

  const handleSaveFee = useCallback(() => {
    setFormError(null);
    if (!formData.studentName || !formData.amount) {
      setFormError("Student Name and Amount are required fields.");
      return;
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount || 0),
    };

    if (editingFee) {
      updateFeeRequest({ id: editingFee.id, fee: payload });
      toast.success("Fee record updated successfully");
    } else {
      createFeeRequest(payload);
      toast.success("Fee record created successfully");
    }

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
      classFeeStructures={classFeeStructures}
      loading={loading}
      error={error}
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
