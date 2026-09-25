import React from "react";
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
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import { MONTH_GRID_ITEMS } from "./types";

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
          <div className="space-y-4 p-5 bg-card border-2 border-primary/20 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">
                  1
                </span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData &&
                    setFormData({ ...formData, studentId: "", studentName: "", rollNumber: "" })
                  }
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
            className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${
              !isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""
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

            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />{" "}
                  {editingFee ? "Single Fee Record Edit Mode" : "Multi-Fee Bundle Mode"}
                </span>
                <span className="text-muted-foreground font-medium">
                  {editingFee
                    ? `Editing ${editingFee.feeType || "fee"} entry`
                    : "Select fee types to issue or pay together"}
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-foreground">
                  {editingFee ? "Target Fee Component & Amount" : "Fee Components Checklist & Amounts"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {displayedComponents.map((typeObj) => {
                    const items = formData.selectedFeeItems || [];
                    const foundItem = items.find(
                      (i: any) => String(i.feeType).toLowerCase() === typeObj.id.toLowerCase()
                    );
                    const isChecked = editingFee ? true : foundItem ? foundItem.selected : false;
                    const currentAmt = editingFee
                      ? formData.amount !== undefined
                        ? formData.amount
                        : ""
                      : foundItem
                      ? foundItem.amount
                      : "";
                    const autoAmt = lookupFeeAmount(formData.class || "", typeObj.id);
                    const IconComp = typeObj.icon || DollarSign;

                    return (
                      <div
                        key={typeObj.id}
                        className={`p-2.5 rounded-xl border-2 flex items-center gap-3 transition-all ${
                          isChecked
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
                        className={`py-2 px-1 rounded-xl text-xs font-black flex flex-col items-center justify-center transition-all ${
                          isSelected
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
          </div>

          {/* STEP 3: Payment Status & Remarks */}
          <div
            className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${
              !isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""
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
                        className={`flex-1 py-2 rounded-lg text-xs font-black capitalize transition-all ${
                          isSelected ? `${st.color} shadow-sm border-2` : "text-muted-foreground hover:text-foreground"
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
