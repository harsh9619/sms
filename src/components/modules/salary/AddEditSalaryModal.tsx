import React from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import {
  DollarSign,
  Users,
  Calendar,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  X,
} from "lucide-react";
import type { SalaryRecord } from "../../../types";
import { StaffSalaryStructureItem } from "../../../Services/salary.service";

interface AddEditSalaryModalProps {
  showAddEditModal: boolean;
  setShowAddEditModal: (show: boolean) => void;
  editingSalary?: SalaryRecord | null;
  formData: any;
  setFormData?: (data: any) => void;
  formError?: string | null;
  handleSaveSalary?: () => void;
  teachers?: any[];
  salaryStructures?: StaffSalaryStructureItem[];
  filteredTeachersForModal: any[];
  handleSelectTeacherInModal: (teacher: any) => void;
  selectedTeacher: any;
  selectedTeacherStructure: StaffSalaryStructureItem | undefined;
  autoPrefillStatus: { type: string; message: string } | null;
  setAutoPrefillStatus: (status: any) => void;
}

export const AddEditSalaryModal: React.FC<AddEditSalaryModalProps> = ({
  showAddEditModal,
  setShowAddEditModal,
  editingSalary,
  formData,
  setFormData,
  formError,
  handleSaveSalary,
  teachers = [],
  salaryStructures = [],
  filteredTeachersForModal,
  handleSelectTeacherInModal,
  selectedTeacher,
  selectedTeacherStructure,
  autoPrefillStatus,
  setAutoPrefillStatus,
}) => {
  if (!showAddEditModal) return null;

  const liveBase = Number(formData.baseSalary || 0);
  const liveAllowances = Number(formData.allowances || 0);
  const liveDeductions = Number(formData.deductions || 0);
  const liveGross = liveBase + liveAllowances;
  const liveNet = liveGross - liveDeductions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in text-left"
      onClick={() => setShowAddEditModal(false)}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {editingSalary ? "Edit Payroll Entry" : "Add Payroll Entry"}
          </h3>
          <button
            onClick={() => setShowAddEditModal(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          {formError && (
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-lg font-medium">
              {formError}
            </div>
          )}

          <div className="space-y-4">
            {/* Step 1: Staff Selection */}
            <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <Users className="h-4 w-4 text-primary" /> 1. Select Staff Member
                </label>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
                  value={formData.teacherId || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const teacherObj = teachers.find((t: any) => String(t.id) === String(selectedId));
                    if (teacherObj) {
                      handleSelectTeacherInModal(teacherObj);
                    } else if (selectedId === "") {
                      setFormData && setFormData({ ...formData, teacherId: "", teacherName: "" });
                      setAutoPrefillStatus(null);
                    }
                  }}
                >
                  <option value="">-- Choose Staff Member --</option>
                  {filteredTeachersForModal.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Staff Member Details Card */}
              {selectedTeacher && (
                <div className="p-3 bg-card border border-primary/30 rounded-xl space-y-2 mt-2 shadow-sm animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm border border-primary/20">
                        {selectedTeacher.name ? selectedTeacher.name.charAt(0).toUpperCase() : "T"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                          {selectedTeacher.name}
                          {(selectedTeacher.department || selectedTeacher.subject) && (
                            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              {selectedTeacher.department || selectedTeacher.subject}
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-muted-foreground font-medium flex flex-wrap items-center gap-x-2">
                          {selectedTeacher.email && <span>Email: {selectedTeacher.email}</span>}
                          {selectedTeacher.phone && <span>• Phone: {selectedTeacher.phone}</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedTeacherStructure ? (
                    <div className="grid grid-cols-4 gap-1.5 text-[10px] bg-muted/40 p-2 rounded-lg font-medium text-center border border-border/40 mt-1">
                      <div>
                        <span className="text-muted-foreground block">Basic Salary</span>
                        <span className="font-bold text-foreground">
                          ₹{Number(selectedTeacherStructure.basicSalary).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Allowances</span>
                        <span className="font-bold text-success">
                          +₹
                          {(
                            Number(selectedTeacherStructure.hra || 0) +
                            Number(selectedTeacherStructure.da || 0) +
                            Number(selectedTeacherStructure.otherAllowance || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Deductions</span>
                        <span className="font-bold text-destructive">
                          -₹
                          {(
                            Number(selectedTeacherStructure.pfDeduction || 0) +
                            Number(selectedTeacherStructure.taxDeduction || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Net Monthly</span>
                        <span className="font-black text-primary">
                          ₹{Number(selectedTeacherStructure.netSalary || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded text-center font-medium">
                      No salary structure pre-configured for {selectedTeacher.name}. Basic figures can be entered manually.
                    </p>
                  )}
                </div>
              )}

              {/* Auto Prefill Status Banner */}
              {autoPrefillStatus && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2 transition-all mt-2 ${
                    autoPrefillStatus.type === "success"
                      ? "bg-success/10 text-success border border-success/30"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {autoPrefillStatus.type === "success" ? (
                      <Sparkles className="h-4 w-4 shrink-0 text-success animate-bounce" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                    )}
                    <span>{autoPrefillStatus.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Pay Period & Designation */}
            <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="h-4 w-4 text-primary" /> 2. Pay Period & Subject
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Month</label>
                  <select
                    className="w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none"
                    value={formData.month || "May"}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, month: e.target.value })
                    }
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Year</label>
                  <Input
                    type="number"
                    className="h-9 text-xs font-semibold"
                    value={formData.year || new Date().getFullYear()}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, year: e.target.value })
                    }
                    placeholder="2024"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Subject / Designation</label>
                  <Input
                    className="h-9 text-xs font-semibold"
                    value={formData.subject || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="e.g. Mathematics"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Financial Components */}
            <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                <DollarSign className="h-4 w-4 text-primary" /> 3. Salary Breakup Components
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Base Salary (₹)</label>
                  <Input
                    type="number"
                    className="h-9 text-xs font-bold"
                    value={formData.baseSalary || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, baseSalary: e.target.value })
                    }
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-success flex items-center gap-1">
                    + Allowances / HRA (₹)
                  </label>
                  <Input
                    type="number"
                    className="h-9 text-xs font-bold text-success border-success/40"
                    value={formData.allowances || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, allowances: e.target.value })
                    }
                    placeholder="12000"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-destructive flex items-center gap-1">
                    - Deductions / PF (₹)
                  </label>
                  <Input
                    type="number"
                    className="h-9 text-xs font-bold text-destructive border-destructive/40"
                    value={formData.deductions || ""}
                    onChange={(e) =>
                      setFormData && setFormData({ ...formData, deductions: e.target.value })
                    }
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Status Selector & Live Net Pay Preview */}
            <div className="space-y-2 bg-card/60 p-3.5 rounded-xl border border-border/60 shadow-sm">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <Receipt className="h-4 w-4 text-primary" /> 4. Disbursal Status & Net Pay
                </label>
              </div>

              <div className="flex gap-2">
                {[
                  {
                    id: "pending",
                    label: "Pending",
                    icon: AlertCircle,
                    color: "hover:bg-warning/20 border-warning text-warning",
                  },
                  {
                    id: "processing",
                    label: "Processing",
                    icon: Clock,
                    color: "hover:bg-info/20 border-info text-info",
                  },
                  {
                    id: "paid",
                    label: "Paid",
                    icon: CheckCircle2,
                    color: "hover:bg-success/20 border-success text-success",
                  },
                ].map((st) => {
                  const Icon = st.icon;
                  const isSelected = (formData.status || "pending") === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData && setFormData({ ...formData, status: st.id })}
                      className={`flex-1 h-9 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? `${st.color} bg-muted/60 ring-2 ring-primary/40`
                          : "border-border text-muted-foreground hover:bg-muted/30"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {st.label}
                    </button>
                  );
                })}
              </div>

              {/* Live Net Salary Summary Card */}
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl space-y-1.5 mt-3">
                <div className="flex justify-between items-center text-[11px] font-semibold text-muted-foreground">
                  <span>
                    Gross: ₹{liveGross.toLocaleString()} (₹{liveBase.toLocaleString()} + ₹
                    {liveAllowances.toLocaleString()})
                  </span>
                  <span className="text-destructive">Deductions: -₹{liveDeductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 border-t border-primary/20">
                  <span className="font-bold text-xs uppercase text-foreground">
                    Estimated Net Disbursed Pay
                  </span>
                  <span className="text-xl font-black text-primary">₹{liveNet.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2.5">
          <Button variant="outline" onClick={() => setShowAddEditModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSalary}>
            {editingSalary ? "Update Salary" : "Create Salary"}
          </Button>
        </div>
      </div>
    </div>
  );
};
