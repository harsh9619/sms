import React, { useMemo } from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Plus,
  Edit,
  Filter,
  Calendar,
  Sparkles,
  Receipt,
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import { MONTH_GRID_ITEMS } from "./types";
import {
  DEFAULT_FEE_TYPES,
  parseFeeRemarks,
  type FeeBreakupItem,
} from "../../../constants/fee";

interface AddEditFeeModalProps {
  showAddEditModal: boolean;
  setShowAddEditModal: (show: boolean) => void;
  editingFee?: FeeRecord | null;
  formData: any;
  setFormData?: (data: any) => void;
  formError?: string | null;
  handleSaveFee?: () => void;

  // Student selection props
  modalFilteredStudents: any[];
  modalDisplayedStudents: any[];
  modalSelectedClass: string;
  setModalSelectedClass: (cls: string) => void;
  modalSelectedDiv: string;
  setModalSelectedDiv: (div: string) => void;
  modalStudentSearch: string;
  setModalStudentSearch: (search: string) => void;
  availableModalClasses: string[];
  availableModalDivisions: string[];
  handleStudentSelect: (stId: string) => void;

  // Multi-fee selection props
  displayedComponents: any[];
  lookupFeeAmount: (className: string, feeType: string) => number;
  handleToggleMultiFeeItem: (feeType: string) => void;
  handleUpdateMultiFeeAmount: (feeType: string, amount: string) => void;
  multiFeeTotalSum: number;
}

export const AddEditFeeModal: React.FC<AddEditFeeModalProps> = ({
  showAddEditModal,
  setShowAddEditModal,
  editingFee,
  formData,
  setFormData,
  formError,
  handleSaveFee,
  modalFilteredStudents,
  modalDisplayedStudents,
  modalSelectedClass,
  setModalSelectedClass,
  modalSelectedDiv,
  setModalSelectedDiv,
  modalStudentSearch,
  setModalStudentSearch,
  availableModalClasses,
  availableModalDivisions,
  handleStudentSelect,
  displayedComponents,
  lookupFeeAmount,
  handleToggleMultiFeeItem,
  handleUpdateMultiFeeAmount,
  multiFeeTotalSum,
}) => {
  // Memoized remark parsing & amount breakup computation for edit mode
  const remarkParsed = useMemo(() => {
    const rawRemarks = formData?.remarks || editingFee?.remarks || "";
    return parseFeeRemarks(rawRemarks);
  }, [formData?.remarks, editingFee?.remarks]);

  const activeBreakupItems = useMemo<FeeBreakupItem[]>(() => {
    if (!formData) return [];
    // 1. If explicit amountBreakup is already on formData
    if (Array.isArray(formData.amountBreakup) && formData.amountBreakup.length > 0) {
      return formData.amountBreakup;
    }
    // 2. If parsed from remark
    if (remarkParsed.breakup && remarkParsed.breakup.length > 0) {
      return remarkParsed.breakup;
    }
    // 3. If selectedFeeItems has selected items with amount > 0
    const selectedItemsWithAmt = (formData.selectedFeeItems || []).filter(
      (i: any) => i.selected && Number(i.amount) > 0
    );
    if (selectedItemsWithAmt.length > 0) {
      return selectedItemsWithAmt.map((i: any) => ({
        name: i.label || `${String(i.feeType).toUpperCase()} Fee`,
        amount: Number(i.amount),
        raw: `${i.label || i.feeType}: ₹${i.amount}`,
      }));
    }
    // 4. Fallback to single target fee component & amount
    if (Number(formData.amount) > 0) {
      const typeLabel =
        DEFAULT_FEE_TYPES.find((t) => t.id === formData.feeType)?.label ||
        (formData.feeType
          ? `${formData.feeType.charAt(0).toUpperCase() + formData.feeType.slice(1)} Fee`
          : "Fee");
      return [
        {
          name: typeLabel,
          amount: Number(formData.amount),
          raw: `${typeLabel} (₹${formData.amount})`,
        },
      ];
    }
    return [];
  }, [formData?.amountBreakup, remarkParsed.breakup, formData?.selectedFeeItems, formData?.amount, formData?.feeType]);

  const breakupTotal = useMemo(() => {
    return activeBreakupItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [activeBreakupItems]);

  if (!showAddEditModal) return null;

  const isSelectionComplete = Boolean(formData.studentId);

  return (
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
                {editingFee
                  ? "Update fee details, payment status or settlement date"
                  : "Select a student from database and issue a fee invoice"}
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
          <div className="space-y-2 p-5 bg-card border-2 border-primary/20 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                  1
                </span>
                <label className="text-xs font-black text-foreground uppercase tracking-wider">
                  Student Selection
                </label>
              </div>
              {modalFilteredStudents.length > 50 && (
                <span className="text-[11px] text-amber-600 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                  Showing 50 of {modalFilteredStudents.length} matching students
                </span>
              )}
            </div>

            {/* Selected Student Card */}
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
                      <span>
                        Roll No: <strong className="text-foreground">{formData.rollNumber || "N/A"}</strong>
                      </span>
                      <span>
                        Class:{" "}
                        <strong className="text-foreground">
                          {formData.class || "N/A"} {formData.section || ""}
                        </strong>
                      </span>
                      {formData.studentId && (
                        <span>
                          ID: <strong className="text-foreground">#{formData.studentId}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData &&
                    setFormData({ ...formData, studentId: "", studentName: "", rollNumber: "" })
                  }
                  className="text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-white h-9 px-3 font-bold"
                >
                  <X className="h-3.5 w-3.5 mr-1" /> Change Student
                </Button> */}
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
                    <span className="text-[10px] text-muted-foreground font-normal">
                      Type to filter list
                    </span>
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
                    <option value="">
                      -- 👇 Click to Select Student ({modalDisplayedStudents.length} available) --
                    </option>
                    {modalDisplayedStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name || st.user?.name} (Admission No: {st.registration_no || "N/A"}) —{" "}
                        {st.class_name || st.class || "-"} {st.division_name || st.section || ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Fee Category & Amount */}
          <div
            className={`space-y-2 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${!isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""
              }`}
          >
            {!isSelectionComplete && (
              <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  Please select Class Grade, Division, and Student in Step 1 to unlock fee category & amount.
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                  2
                </span>
                <label className="text-xs font-black text-foreground uppercase tracking-wider">
                  Fee Category & Amount
                </label>
              </div>
            </div>

            {editingFee ? (
              /* ========================================================
                 EDIT MODE: Target Fee Component & Amount
                 (Billing Months Selection is hidden; derived from remark)
                 ======================================================== */
              <div className="space-y-4 animate-fade-in">
                {/* Mode Info Banner */}
                {/* Billing Coverage Period (Extracted from Remark) */}
                {/* <div className="p-3.5 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> Billing Coverage Period
                    </label>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-muted text-muted-foreground border">
                      Retrieved from Remark
                    </Badge>
                  </div>
                  <div className="p-2.5 bg-background rounded-xl border border-border/60 text-xs font-bold text-foreground flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate">
                        {formData.billingMonthsFromRemark || formData.remarks || `Billing Cycle (${formData.month || "Current"})`}
                      </span>
                    </div>
                    {formData.month && (
                      <span className="text-[11px] text-muted-foreground font-semibold shrink-0 ml-2 bg-muted px-2 py-0.5 rounded-md">
                        {formData.month}
                      </span>
                    )}
                  </div>
                </div> */}


                {/* Target Fee Component & Target Amount 2-Column Row */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> */}
                {/* 1. Target Fee Component */}
                {/* <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-primary" /> Target Fee Component <span className="text-destructive">*</span>
                    </label>
                    <select
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                      value={formData.feeType || "tuition"}
                      onChange={(e) => {
                        const newType = e.target.value;
                        const autoAmt = lookupFeeAmount(formData.class || "", newType);
                        const updatedItems = (formData.selectedFeeItems || []).map((item: any) => ({
                          ...item,
                          selected: item.feeType === newType,
                          amount: item.feeType === newType ? (autoAmt > 0 ? String(autoAmt) : formData.amount) : item.amount,
                        }));
                        if (setFormData) {
                          setFormData({
                            ...formData,
                            feeType: newType,
                            amount: autoAmt > 0 ? String(autoAmt) : formData.amount,
                            selectedFeeItems: updatedItems,
                          });
                        }
                      }}
                    >
                      {DEFAULT_FEE_TYPES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                      {formData.feeType && !DEFAULT_FEE_TYPES.some((t) => t.id === formData.feeType) && (
                        <option value={formData.feeType}>
                          {formData.feeType.charAt(0).toUpperCase() + formData.feeType.slice(1)} Fee
                        </option>
                      )}
                    </select>
                  </div> */}

                {/* 2. Target Fee Amount */}
                {/* <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-primary" /> Target Fee Amount <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        value={formData.amount !== undefined ? formData.amount : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updatedItems = (formData.selectedFeeItems || []).map((item: any) =>
                            item.feeType === (formData.feeType || "tuition") ? { ...item, amount: val, selected: true } : item
                          );
                          if (setFormData) {
                            setFormData({
                              ...formData,
                              amount: val,
                              selectedFeeItems: updatedItems,
                            });
                          }
                          handleUpdateMultiFeeAmount(formData.feeType || "tuition", val);
                        }}
                        placeholder="Enter fee amount"
                        className="pl-8 text-sm font-black h-10"
                      />
                    </div>
                  </div> */}
                {/* </div> */}

                {/* Amount Breakup Section (Retrieved from Remark) */}
                <div className="p-4 bg-muted/20 border-2 border-border/80 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <label className="text-xs font-black text-foreground flex items-center gap-1.5">
                          Fee Amount Breakup
                        </label>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Itemized fee components & rates retrieved from remarks
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold bg-background text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                      >
                        {activeBreakupItems.length} {activeBreakupItems.length === 1 ? "Component" : "Components"}
                      </Badge>
                    </div>
                  </div>

                  {/* Component Breakup Items Grid / List */}
                  {activeBreakupItems.length > 0 ? (
                    <div className="space-y-1.5">
                      {activeBreakupItems.map((item, idx) => {
                        const isMatchingTarget =
                          (formData.feeType &&
                            item.name.toLowerCase().includes(formData.feeType.toLowerCase())) ||
                          activeBreakupItems.length === 1;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              // If user clicks an item, select this component & amount
                              const matchedType = DEFAULT_FEE_TYPES.find((t) =>
                                item.name.toLowerCase().includes(t.id.toLowerCase())
                              );
                              if (setFormData) {
                                const newType = matchedType ? matchedType.id : formData.feeType;
                                const newAmt = String(item.amount);
                                const updatedItems = (formData.selectedFeeItems || []).map((si: any) =>
                                  si.feeType === newType ? { ...si, amount: newAmt, selected: true } : si
                                );
                                setFormData({
                                  ...formData,
                                  feeType: newType,
                                  amount: newAmt,
                                  selectedFeeItems: updatedItems,
                                });
                                handleUpdateMultiFeeAmount(newType || "tuition", newAmt);
                              }
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${isMatchingTarget
                              ? "bg-primary/10 border-primary/50 shadow-2xs"
                              : "bg-background border-border/70 hover:border-border hover:bg-muted/40"
                              }`}
                            title="Click to select this component as target"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${isMatchingTarget ? "bg-primary" : "bg-emerald-500"
                                  }`}
                              />
                              <span className="font-bold text-foreground truncate">
                                {item.name}
                              </span>
                              {item.multiplier && (
                                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground shrink-0">
                                  {item.multiplier}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="font-black text-sm text-foreground">
                                ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-background rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                      No component breakup found in remarks.
                    </div>
                  )}

                  {/* Breakup Summary Footer */}
                  <div className="pt-2 border-t border-border/70 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-bold uppercase tracking-wider text-[11px]">
                      Total
                    </span>
                    <div className="flex items-center gap-2">
                      {Number(formData.amount || 0) !== breakupTotal && breakupTotal > 0 && (
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          Invoice: ₹{Number(formData.amount || 0).toLocaleString("en-IN")} •
                        </span>
                      )}
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{Number(breakupTotal || formData.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Raw Remarks Reference */}
                  {/* {formData.remarks && (
                    <div className="pt-1.5 border-t border-border/40 text-[11px] text-muted-foreground font-medium truncate">
                      <span className="font-bold text-foreground">Raw Remark:</span> {formData.remarks}
                    </div>
                  )} */}
                </div>



                {/* Billing Month Key & Due Date */}
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> Billing Month
                    </label>
                    <Input
                      type="month"
                      value={formData.month || new Date().toISOString().slice(0, 7)}
                      onChange={(e) =>
                        setFormData && setFormData({ ...formData, month: e.target.value })
                      }
                      className="h-10 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> Due Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.dueDate || ""}
                      onChange={(e) =>
                        setFormData && setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="h-10 text-xs font-bold"
                    />
                  </div>
                </div> */}
              </div>
            ) : (
              /* ========================================================
                 ADD MODE: Multi-Fee Bundle & Billing Months Selection
                 ======================================================== */
              <div className="space-y-4 animate-fade-in">
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Multi-Fee Bundle Mode
                  </span>
                  <span className="text-muted-foreground font-medium">
                    Select fee types to issue or pay together
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-foreground">
                    Fee Components Checklist & Amounts
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {displayedComponents.map((typeObj) => {
                      const items = formData.selectedFeeItems || [];
                      const foundItem = items.find(
                        (i: any) => String(i.feeType).toLowerCase() === typeObj.id.toLowerCase()
                      );
                      const isChecked = foundItem ? foundItem.selected : false;
                      const currentAmt = foundItem ? foundItem.amount : "";
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
                            disabled={!isSelectionComplete}
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
                                handleUpdateMultiFeeAmount(typeObj.id, e.target.value);
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

                {/* Multi-Month Billing Period Selection */}
                <div className="space-y-3 pt-2 border-t border-border/60">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> Billing Months Selection{" "}
                      <span className="text-destructive">*</span>
                    </label>

                    {/* Presets: Q1, Q2, Q3, Q4 */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-semibold">Presets:</span>
                      <button
                        type="button"
                        disabled={!isSelectionComplete}
                        onClick={() => {
                          const yr = new Date().getFullYear();
                          setFormData &&
                            setFormData({
                              ...formData,
                              selectedMonths: [`${yr}-04`, `${yr}-05`, `${yr}-06`],
                              month: `${yr}-04`,
                            });
                        }}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Q1 (Apr-Jun)
                      </button>
                      <button
                        type="button"
                        disabled={!isSelectionComplete}
                        onClick={() => {
                          const yr = new Date().getFullYear();
                          setFormData &&
                            setFormData({
                              ...formData,
                              selectedMonths: [`${yr}-07`, `${yr}-08`, `${yr}-09`],
                              month: `${yr}-07`,
                            });
                        }}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Q2 (Jul-Sep)
                      </button>
                      <button
                        type="button"
                        disabled={!isSelectionComplete}
                        onClick={() => {
                          const yr = new Date().getFullYear();
                          setFormData &&
                            setFormData({
                              ...formData,
                              selectedMonths: [`${yr}-10`, `${yr}-11`, `${yr}-12`],
                              month: `${yr}-10`,
                            });
                        }}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Q3 (Oct-Dec)
                      </button>
                      <button
                        type="button"
                        disabled={!isSelectionComplete}
                        onClick={() => {
                          const yr = new Date().getFullYear() + 1;
                          setFormData &&
                            setFormData({
                              ...formData,
                              selectedMonths: [`${yr}-01`, `${yr}-02`, `${yr}-03`],
                              month: `${yr}-01`,
                            });
                        }}
                        className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Q4 (Jan-Mar)
                      </button>
                    </div>
                  </div>

                  {/* Interactive Month Selection Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-2.5 bg-muted/30 border border-border/80 rounded-2xl">
                    {MONTH_GRID_ITEMS.map((m) => {
                      const baseYear = new Date().getFullYear();
                      const isJanFebMar = ["01", "02", "03"].includes(m.value);
                      const monthYear = isJanFebMar ? baseYear + 1 : baseYear;
                      const fullMonthStr = `${monthYear}-${m.value}`;

                      const selectedMonthsArr: string[] = formData.selectedMonths || [
                        formData.month || new Date().toISOString().slice(0, 7),
                      ];
                      const isSelected = selectedMonthsArr.includes(fullMonthStr);

                      return (
                        <button
                          key={m.value}
                          type="button"
                          disabled={!isSelectionComplete}
                          onClick={() => {
                            if (!setFormData) return;
                            let nextMonths: string[];
                            if (isSelected) {
                              nextMonths = selectedMonthsArr.filter((item) => item !== fullMonthStr);
                              if (nextMonths.length === 0) nextMonths = [fullMonthStr];
                            } else {
                              nextMonths = [...selectedMonthsArr, fullMonthStr];
                            }
                            setFormData({
                              ...formData,
                              selectedMonths: nextMonths,
                              month: nextMonths[0],
                            });
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center transition-all ${isSelected
                            ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                            : "bg-background text-muted-foreground hover:bg-muted/80 border border-border/60"
                            }`}
                        >
                          <span>{m.label}</span>
                          <span className="text-[9px] font-normal opacity-80">{monthYear}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs pt-1">
                    <span className="text-muted-foreground font-semibold">
                      Selected:{" "}
                      <strong className="text-primary font-bold">
                        {formData.selectedMonths?.length || 1} Month(s)
                      </strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-extrabold text-foreground shrink-0">Due Date:</label>
                      <Input
                        type="date"
                        disabled={!isSelectionComplete}
                        value={formData.dueDate || ""}
                        onChange={(e) =>
                          setFormData && setFormData({ ...formData, dueDate: e.target.value })
                        }
                        className="h-8 text-xs font-bold w-36"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Payment Status & Remarks */}
          <div
            className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${!isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""
              }`}
          >
            <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                3
              </span>
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
                    {
                      id: "pending",
                      label: "Pending",
                      color: "text-amber-600 bg-amber-500/15 border-amber-500/40",
                    },
                    {
                      id: "paid",
                      label: "Paid",
                      color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/40",
                    },
                    {
                      id: "overdue",
                      label: "Overdue",
                      color: "text-rose-600 bg-rose-500/15 border-rose-500/40",
                    },
                  ].map((st) => {
                    const isSelected = (formData.status || "Paid") === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        disabled={!isSelectionComplete}
                        onClick={() => setFormData && setFormData({ ...formData, status: st.id })}
                        className={`flex-1 py-2 rounded-lg text-xs font-black capitalize transition-all ${isSelected ? `${st.color} shadow-sm border-2` : "text-muted-foreground hover:text-foreground"
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
                  <label className="text-xs font-extrabold text-emerald-600">
                    Date Payment Was Received
                  </label>
                  <Input
                    type="date"
                    disabled={!isSelectionComplete}
                    value={formData.paidDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, paidDate: e.target.value })
                    }
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-foreground">Remarks / Notes</label>
                  <Input
                    disabled={!isSelectionComplete}
                    value={formData.remarks || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, remarks: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData && setFormData({ ...formData, remarks: e.target.value })
                  }
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
  );
};
