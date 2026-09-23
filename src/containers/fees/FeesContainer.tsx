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
import { generateFeeReport, generateFeeSummaryReport } from "../../lib/reportUtils";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>("all");

  // Payment modal state
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);

  // Add/Edit modal state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeesRequest();
    fetchStudentsRequest();
  }, [fetchFeesRequest, fetchStudentsRequest, activeSchool]);

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

  // Add / Edit handlers
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
    />
  );
}

export const FeesContainer = connector(FeesContainerContent);
export default FeesContainer;
