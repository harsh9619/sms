import React from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Sparkles, GraduationCap, Calendar, AlertCircle, CheckCircle2, X } from "lucide-react";
import { ClassFeeStructureItem } from "../../../Services/fee.service";
import { MONTH_GRID_ITEMS } from "./types";

interface GenerateInvoicesModalProps {
  showGenerateModal: boolean;
  setShowGenerateModal: (show: boolean) => void;
  generateClassId?: string;
  setGenerateClassId?: (val: string) => void;
  generateDueDate?: string;
  setGenerateDueDate?: (val: string) => void;
  generateMonth?: string;
  setGenerateMonth?: (val: string) => void;
  handleGenerateInvoices?: () => void;
  isGenerating?: boolean;
  classes?: any[];
  classFeeStructures?: ClassFeeStructureItem[];
  students?: any[];
  handleCloseGenerateModal: () => void;
}

export const GenerateInvoicesModal: React.FC<GenerateInvoicesModalProps> = ({
  showGenerateModal,
  generateClassId = "",
  setGenerateClassId,
  generateDueDate = "",
  setGenerateDueDate,
  generateMonth = new Date().toISOString().slice(0, 7),
  setGenerateMonth,
  handleGenerateInvoices,
  isGenerating = false,
  classes = [],
  classFeeStructures = [],
  students = [],
  handleCloseGenerateModal,
}) => {
  if (!showGenerateModal) return null;

  const cls = classes.find(
    (c) => String(c.classMasterId) === String(generateClassId) || c.name === generateClassId
  );
  const targetName = cls ? cls.name || cls.className : generateClassId;

  const selectedClassFeeItems = classFeeStructures.filter(
    (s) =>
      String(s.classId) === String(generateClassId) ||
      (s.className && targetName && s.className.toLowerCase() === targetName.toLowerCase())
  );

  const totalClassFeePerStudent = selectedClassFeeItems.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const matchedStudents = students.filter(
    (st) =>
      String(st.classMasterId) === String(generateClassId) ||
      (st.class && targetName && String(st.class).toLowerCase() === String(targetName).toLowerCase())
  );

  const totalBatchEstimatedBilling = totalClassFeePerStudent * (matchedStudents.length || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleCloseGenerateModal}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Auto-Generate Class Fee Invoices
          </h3>
          <button onClick={handleCloseGenerateModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Select Class Grade Section */}
          <div className="space-y-1.5 bg-muted/20 p-3.5 rounded-xl border border-border/50">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <GraduationCap className="h-4 w-4 text-primary" /> Select Target Class Grade
            </label>

            <select
              className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none mt-1"
              value={generateClassId}
              onChange={(e) => setGenerateClassId && setGenerateClassId(e.target.value)}
            >
              <option value="">-- Choose Target Class Grade --</option>
              {classes.length > 0
                ? classes.map((c: any) => (
                    <option key={c.id} value={c.classMasterId}>
                      {c.name || c.className}
                    </option>
                  ))
                : [
                    { id: "1", name: "LKG" },
                    { id: "2", name: "UKG" },
                    { id: "3", name: "Class 1" },
                    { id: "4", name: "Class 2" },
                    { id: "5", name: "Class 3" },
                    { id: "6", name: "Class 4" },
                    { id: "7", name: "Class 5" },
                    { id: "8", name: "Class 6" },
                    { id: "9", name: "Class 7" },
                    { id: "10", name: "Class 8" },
                    { id: "11", name: "Class 9" },
                    { id: "12", name: "Class 10" },
                    { id: "13", name: "Class 11" },
                    { id: "14", name: "Class 12" },
                  ].map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Class Fee Structure & Enrolled Students Preview Card */}
          {generateClassId && (
            <div className="space-y-3 animate-fade-in">
              <div className="bg-muted/30 p-3.5 rounded-xl border border-border/80 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground pb-1 border-b border-border/50">
                  <span>Fee Components ({selectedClassFeeItems.length} configured)</span>
                  <span className="text-primary font-black text-sm">
                    ₹{totalClassFeePerStudent.toLocaleString("en-IN")} / student
                  </span>
                </div>

                {selectedClassFeeItems.length > 0 ? (
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {selectedClassFeeItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-0.5">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          • {item.feeName} <span className="text-[10px] text-muted-foreground">({item.feeType})</span>
                        </span>
                        <span className="font-bold text-foreground">₹{Number(item.amount).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400 font-semibold py-1 flex items-center gap-1 text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    No fee components configured for this class grade yet.
                  </div>
                )}
              </div>

              {/* Summary Stats Pill */}
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-foreground">
                    Target Students: {matchedStudents.length} enrolled
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Batch Total: ₹{totalBatchEstimatedBilling.toLocaleString("en-IN")}
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              </div>

              {/* Billing Month & Due Date Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> Billing Month
                  </label>
                  <select
                    className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth && setGenerateMonth(e.target.value)}
                  >
                    {MONTH_GRID_ITEMS.map((m) => {
                      const yr = new Date().getFullYear();
                      const fullVal = `${yr}-${m.value}`;
                      return (
                        <option key={m.value} value={fullVal}>
                          {m.fullLabel} {yr}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Invoice Due Date</label>
                  <Input
                    type="date"
                    className="h-9 text-xs font-bold"
                    value={generateDueDate}
                    onChange={(e) => setGenerateDueDate && setGenerateDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
          <Button variant="outline" onClick={handleCloseGenerateModal} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateInvoices}
            disabled={!generateClassId || isGenerating}
            className="font-bold px-5 shadow-sm"
          >
            {isGenerating ? "Generating Invoices..." : "Generate Invoices Now"}
          </Button>
        </div>
      </div>
    </div>
  );
};
