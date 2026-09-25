import React from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import {
  Layers,
  X,
  Zap,
  RefreshCw,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { ClassFeeStructureItem } from "../../../Services/fee.service";
import { ALL_CLASS_OPTIONS, FEE_PRESET_TEMPLATES, MONTH_GRID_ITEMS } from "./types";

interface ClassFeeStructureModalProps {
  showStructModal: boolean;
  setShowStructModal: (show: boolean) => void;
  editingStruct?: ClassFeeStructureItem | null;
  structFormData: any;
  setStructFormData?: (data: any) => void;
  selectedClassIds: string[];
  handleToggleClassId: (id: string) => void;
  handleQuickSelectClasses: (preset: "all" | "primary" | "secondary" | "none") => void;
  handleApplyPresetTemplate: (tpl: any) => void;
  handleSaveStruct?: () => void;
  summaryDetails: {
    totalAnnualStudent: number;
  };
}

export const ClassFeeStructureModal: React.FC<ClassFeeStructureModalProps> = ({
  showStructModal,
  setShowStructModal,
  editingStruct,
  structFormData,
  setStructFormData,
  selectedClassIds,
  handleToggleClassId,
  handleQuickSelectClasses,
  handleApplyPresetTemplate,
  handleSaveStruct,
  summaryDetails,
}) => {
  if (!showStructModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto"
      onClick={() => setShowStructModal(false)}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-scale-in text-left flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">
                {editingStruct ? "Edit Class Fee Component" : "Configure Class Fee Component"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define reusable class billing rules and apply them to target classes in seconds.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowStructModal(false)}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-6 text-sm overflow-y-auto flex-1">
          {/* STEP 1: Select Target Class(es) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center">
                  1
                </span>
                Target Class Grades
              </label>
              {!editingStruct && (
                <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/20">
                  {selectedClassIds.length} Class(es) Selected
                </Badge>
              )}
            </div>

            {editingStruct ? (
              <div className="space-y-1.5">
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={structFormData.classMasterId || ""}
                  onChange={(e) =>
                    setStructFormData &&
                    setStructFormData({
                      ...structFormData,
                      classMasterId: e.target.value,
                      classMasterIds: [e.target.value],
                    })
                  }
                >
                  <option value="">Select Class Grade</option>
                  {ALL_CLASS_OPTIONS.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-muted/20 p-3.5 rounded-xl border border-border/70 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground font-medium">
                    Choose which classes receive this fee structure component:
                  </p>
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickSelectClasses("all")}
                      className="px-2.5 py-1 font-bold rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectClasses("primary")}
                      className="px-2.5 py-1 font-medium rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    >
                      Class 1-5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectClasses("secondary")}
                      className="px-2.5 py-1 font-medium rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    >
                      Class 6-10
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectClasses("none")}
                      className="px-2.5 py-1 font-medium rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
                  {ALL_CLASS_OPTIONS.map((cls) => {
                    const isSelected = selectedClassIds.includes(cls.id);
                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => handleToggleClassId(cls.id)}
                        className={`items-center justify-between px-1.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <span>{cls.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Component Details & Pricing */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center">
                  2
                </span>
                Fee Details & Pricing
              </label>
              {!editingStruct && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Click a preset below to auto-fill
                </span>
              )}
            </div>

            {/* Quick Presets Bar */}
            {!editingStruct && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {FEE_PRESET_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPresetTemplate(tpl)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all"
                  >
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span>{tpl.name}</span>
                    <span className="text-[10px] font-bold opacity-80">₹{tpl.amount}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Component Name *</label>
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
                <label className="text-xs font-semibold text-muted-foreground">Fee Category Type</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={structFormData.feeType || "tuition"}
                  onChange={(e) =>
                    setStructFormData &&
                    setStructFormData({ ...structFormData, feeType: e.target.value })
                  }
                >
                  <option value="tuition">📚 Tuition Fee</option>
                  <option value="transport">🚌 Transport Fee</option>
                  <option value="exam">📝 Exam Fee</option>
                  <option value="library">📖 Library Fee</option>
                  <option value="lab">🔬 Science Lab Fee</option>
                  <option value="sports">🏆 Sports Fee</option>
                  <option value="hostel">🏢 Hostel Fee</option>
                  <option value="annual">🎉 Annual Charge</option>
                  <option value="computer">💻 Computer & IT Fee</option>
                  <option value="uniforms">👔 Uniform Charge</option>
                  <option value="other">📦 Other Component</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Amount (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">₹</span>
                  <Input
                    type="number"
                    className="pl-7 font-bold text-foreground"
                    value={structFormData.amount || ""}
                    onChange={(e) =>
                      setStructFormData &&
                      setStructFormData({ ...structFormData, amount: e.target.value })
                    }
                    placeholder="e.g. 3000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Billing Frequency</label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
                  value={structFormData.frequency || "monthly"}
                  onChange={(e) =>
                    setStructFormData &&
                    setStructFormData({ ...structFormData, frequency: e.target.value })
                  }
                >
                  <option value="monthly">Monthly Recurring (12x / yr)</option>
                  <option value="quarterly">Quarterly (4x / yr)</option>
                  <option value="annually">Annually (1x / yr)</option>
                  <option value="one_time">One Time Charge</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: Billing Schedule & Month Rules */}
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center">
                  3
                </span>
                Billing Month Schedule
              </label>
              <span className="text-[11px] text-muted-foreground">
                When does this fee generate on student accounts?
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setStructFormData && setStructFormData({ ...structFormData, month: "all" })}
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  structFormData.month === "all" || !structFormData.month
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-background border-input hover:border-primary/50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg mt-0.5 ${
                    structFormData.month === "all" || !structFormData.month
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <RefreshCw className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Every Month (Recurring)</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Generates in all monthly billing cycles (e.g. Tuition, Bus).
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setStructFormData &&
                  setStructFormData({
                    ...structFormData,
                    month: structFormData.month && structFormData.month !== "all" ? structFormData.month : "06",
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                  structFormData.month && structFormData.month !== "all"
                    ? "bg-primary/10 border-primary shadow-xs"
                    : "bg-background border-input hover:border-primary/50"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg mt-0.5 ${
                    structFormData.month && structFormData.month !== "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-foreground">Specific Month Only</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Generates only in a target month (e.g. June Exam Fee).
                  </div>
                </div>
              </button>
            </div>

            {structFormData.month && structFormData.month !== "all" && (
              <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border">
                <label className="text-[11px] font-semibold text-muted-foreground">Select Target Month:</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                  {MONTH_GRID_ITEMS.map((m) => {
                    const isMonthSelected = structFormData.month === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() =>
                          setStructFormData && setStructFormData({ ...structFormData, month: m.value })
                        }
                        className={`p-2 rounded-lg border text-center transition-all ${
                          isMonthSelected
                            ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                            : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                        }`}
                      >
                        <div className="text-xs">{m.label}</div>
                        {m.badge && (
                          <div
                            className={`text-[9px] mt-0.5 truncate ${
                              isMonthSelected ? "text-primary-foreground/90 font-medium" : "text-primary"
                            }`}
                          >
                            {m.badge}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
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

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description / Notes</label>
                <Input
                  value={structFormData.description || ""}
                  onChange={(e) =>
                    setStructFormData &&
                    setStructFormData({ ...structFormData, description: e.target.value })
                  }
                  placeholder="e.g. Session 2026-27"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: Realtime Live Summary Card */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-4 space-y-2">
            <div className="flex items-center justify-between font-bold text-foreground">
              <span className="flex items-center gap-1.5 text-xs">
                <Sparkles className="h-4 w-4 text-primary fill-primary/20" />
                Structure Component Summary
              </span>
              <span className="text-primary font-black text-base">
                ₹{Number(structFormData.amount || 0).toLocaleString("en-IN")}
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}/ {structFormData.frequency || "monthly"}
                </span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs pt-1.5 border-t border-primary/15">
              <div>
                🎓 <strong className="text-foreground">Classes:</strong>{" "}
                {selectedClassIds.length > 0
                  ? `${selectedClassIds.length} Class(es) selected`
                  : "No class selected"}
              </div>
              <div>
                🗓️ <strong className="text-foreground">Schedule:</strong>{" "}
                {structFormData.month === "all" || !structFormData.month
                  ? "Every Month (12x/yr)"
                  : `Specific Month (${structFormData.month})`}
              </div>
              <div>
                📅 <strong className="text-foreground">Due Day:</strong> Day {structFormData.dueDay || 10} of month
              </div>
              <div>
                💡 <strong className="text-foreground">Est. Annual Total:</strong> ₹
                {summaryDetails.totalAnnualStudent.toLocaleString("en-IN")} / student / year
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">
            {selectedClassIds.length > 0
              ? `Configuring component for ${selectedClassIds.length} class(es)`
              : "Select at least 1 class grade"}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowStructModal(false)} className="font-semibold">
              Cancel
            </Button>
            <Button onClick={handleSaveStruct} className="font-bold px-5 shadow-sm">
              {editingStruct
                ? "Update Component"
                : selectedClassIds.length > 1
                ? `Create for ${selectedClassIds.length} Classes`
                : "Save Component"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
