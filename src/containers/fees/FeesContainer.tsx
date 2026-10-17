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
} from "../../saga";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { generateFeeSummaryReport } from "../../lib/reportUtils";
import feeService, {
  ClassFeeStructureItem,
  FeePaymentScheduleItem,
  SchoolFeeSettings,
  FeeStatsResponse,
} from "../../Services/fee.service";
import { FeesHeader } from "../../components/modules/fees/FeesHeader";
import { FeeInvoicesContainer } from "./subcontainers/FeeInvoicesContainer";
import { FeeSchedulesContainer } from "./subcontainers/FeeSchedulesContainer";
import { FeeStructuresContainer } from "./subcontainers/FeeStructuresContainer";
import { FeeAnalyticsContainer } from "./subcontainers/FeeAnalyticsContainer";
import { GenerateInvoicesModalContainer } from "./subcontainers/GenerateInvoicesModalContainer";

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
  error,
  fetchFeesRequest,
  fetchStudentsRequest,
  fetchClassesRequest,
  isMyFees = false,
}: FeesContainerProps) {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const schoolId = activeSchool?.id || "1";

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<"invoices" | "schedules" | "structures" | "analytics">("invoices");

  // Filter State passed between Header and Invoices
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Shared Fee Structures, Schedules & Settings
  const [classFeeStructures, setClassFeeStructures] = useState<ClassFeeStructureItem[]>([]);
  const [feeSchedules, setFeeSchedules] = useState<FeePaymentScheduleItem[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolFeeSettings | null>(null);
  const [feeStats, setFeeStats] = useState<FeeStatsResponse | null>(null);

  // Trigger counters for Header buttons
  const [addModalTrigger, setAddModalTrigger] = useState(0);
  const [addStructModalTrigger, setAddStructModalTrigger] = useState(0);

  // Auto Generate Invoices Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePreset, setGeneratePreset] = useState<any>(null);

  // Initial fetches
  useEffect(() => {
    fetchStudentsRequest();
    fetchClassesRequest();
  }, [fetchStudentsRequest, fetchClassesRequest]);

  // Load structures & schedules for dropdowns/modals
  useEffect(() => {
    const loadSharedMetadata = async () => {
      try {
        const [structs, schedules, settings, stats] = await Promise.all([
          feeService.getClassFeeStructures(schoolId).catch(() => []),
          feeService.getFeeSchedules(schoolId).catch(() => []),
          feeService.getSchoolFeeSettings(schoolId).catch(() => null),
          feeService.getFeeStats(schoolId).catch(() => null),
        ]);
        if (Array.isArray(structs)) setClassFeeStructures(structs);
        if (Array.isArray(schedules)) setFeeSchedules(schedules);
        if (settings) setSchoolSettings(settings);
        if (stats) setFeeStats(stats);
      } catch (err) {
        console.error("Failed to load shared fee data:", err);
      }
    };
    loadSharedMetadata();
  }, [schoolId]);

  // Quick stat card click in Header
  const handleHeaderStatusFilter = useCallback((val: string) => {
    setStatusFilter(val);
    if (activeSubTab !== "invoices") {
      setActiveSubTab("invoices");
    }
  }, [activeSubTab]);

  // Header "Add Fee Entry" button
  const handleHeaderAddModal = useCallback(() => {
    if (activeSubTab !== "invoices") {
      setActiveSubTab("invoices");
    }
    setAddModalTrigger((prev) => prev + 1);
  }, [activeSubTab]);

  // Header "Configure Class Fee" button
  const handleHeaderAddStructModal = useCallback(() => {
    if (activeSubTab !== "structures") {
      setActiveSubTab("structures");
    }
    setAddStructModalTrigger((prev) => prev + 1);
  }, [activeSubTab]);

  // Launch Generate Invoices Modal with a preset (e.g. from FeeSchedulesTab)
  const handleOpenGenerateWithPreset = useCallback((preset?: any) => {
    setGeneratePreset(preset || null);
    setShowGenerateModal(true);
  }, []);

  // On successful invoice generation
  const handleGenerateSuccess = useCallback(() => {
    setActiveSubTab("invoices");
    setStatusFilter("all");
    fetchFeesRequest({ schoolId, page: 1, limit: 50 });
    feeService.getFeeStats(schoolId).then((data) => {
      if (data) setFeeStats(data);
    });
  }, [schoolId, fetchFeesRequest]);

  // Header stats summary calculations
  const headerStats = useMemo(() => {
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    const todayStr = new Date().toISOString().split("T")[0];
    allFees.forEach((f) => {
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
      totalCount: meta ? meta.total : allFees.length,
      paidCount,
      pendingCount,
      overdueCount,
    };
  }, [allFees, meta]);

  // Export Excel Report
  const handleExportExcel = useCallback(() => {
    try {
      const data = allFees.map((f) => ({
        "Student Name": f.studentName || "",
        "Roll No": f.rollNumber || "",
        Class: f.class || "",
        Section: f.section || "",
        "Fee Type": f.feeType || "",
        "Amount (₹)": f.amount || 0,
        Month: f.month || "",
        Installment: f.installmentName || "",
        "Session Cycle": f.sessionStart || "",
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
  }, [allFees]);

  // Export Summary Report
  const handleExportSummary = useCallback(() => {
    if (allFees.length > 0) {
      generateFeeSummaryReport(allFees);
    } else {
      toast.warn("No fee records to export summary");
    }
  }, [allFees]);

  // Refresh stats after payments / changes
  const handleFeeUpdated = useCallback(() => {
    feeService.getFeeStats(schoolId).then((data) => {
      if (data) setFeeStats(data);
    });
  }, [schoolId]);

  return (
    <div className="p-3 sm:p-4 md:p-6 mx-auto space-y-4 sm:space-y-6 animate-fade-in max-w-[1600px]">
      {/* Top Header & Tab Navigation Bar */}
      <FeesHeader
        isMyFees={isMyFees}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        error={error}
        stats={headerStats}
        handleExportExcel={handleExportExcel}
        handleExportSummary={handleExportSummary}
        handleOpenAddModal={handleHeaderAddModal}
        handleOpenAddStructModal={handleHeaderAddStructModal}
        setShowGenerateModal={setShowGenerateModal}
        statusFilter={statusFilter}
        setStatusFilter={handleHeaderStatusFilter}
      />

      {/* Tab 1: Invoices & Financial Ledger */}
      {activeSubTab === "invoices" && (
        <FeeInvoicesContainer
          isMyFees={isMyFees}
          schoolId={schoolId}
          classFeeStructures={classFeeStructures}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          showAddModalTrigger={addModalTrigger}
          onFeeUpdated={handleFeeUpdated}
        />
      )}

      {/* Tab 2: Payment Schedules Master (V2) */}
      {activeSubTab === "schedules" && !isMyFees && (
        <FeeSchedulesContainer
          schoolId={schoolId}
          onOpenGenerateInvoices={handleOpenGenerateWithPreset}
          onSchedulesUpdated={setFeeSchedules}
          onSettingsUpdated={setSchoolSettings}
        />
      )}

      {/* Tab 3: Class Fee Structures */}
      {activeSubTab === "structures" && !isMyFees && (
        <FeeStructuresContainer
          schoolId={schoolId}
          classes={classes}
          showAddStructModalTrigger={addStructModalTrigger}
          setShowGenerateModal={setShowGenerateModal}
          onStructuresUpdated={setClassFeeStructures}
        />
      )}

      {/* Tab 4: Financial Analytics */}
      {activeSubTab === "analytics" && !isMyFees && (
        <FeeAnalyticsContainer
          schoolId={schoolId}
          feeStats={feeStats}
          onStatsUpdated={setFeeStats}
          onNavigateToInvoices={(targetStatus) => {
            if (targetStatus) setStatusFilter(targetStatus);
            setActiveSubTab("invoices");
          }}
        />
      )}

      {/* Shared Auto Generate Invoices Modal Wizard */}
      <GenerateInvoicesModalContainer
        showGenerateModal={showGenerateModal}
        setShowGenerateModal={setShowGenerateModal}
        schoolId={schoolId}
        classes={classes}
        students={students}
        classFeeStructures={classFeeStructures}
        feeSchedules={feeSchedules}
        preset={generatePreset}
        defaultSessionStart={schoolSettings?.feeSessionStart || "april"}
        defaultFormat={schoolSettings?.feeFrequency || "monthly"}
        onSuccess={handleGenerateSuccess}
      />
    </div>
  );
}

export const FeesContainer = connector(FeesContainerContent);
export default FeesContainer;
