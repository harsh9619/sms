import React from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { Sparkles, Calendar, Users, Clock, X } from "lucide-react";
import { StaffSalaryStructureItem } from "../../../Services/salary.service";

interface GeneratePayrollModalProps {
  showPayrollModal: boolean;
  setShowPayrollModal: (show: boolean) => void;
  payrollMonth?: number;
  setPayrollMonth?: (val: number) => void;
  payrollYear?: number;
  setPayrollYear?: (val: number) => void;
  handleGeneratePayroll?: () => void;
  isGenerating?: boolean;
  salaryStructures?: StaffSalaryStructureItem[];
  handleClosePayrollModal: () => void;
}

export const GeneratePayrollModal: React.FC<GeneratePayrollModalProps> = ({
  showPayrollModal,
  payrollMonth = new Date().getMonth() + 1,
  setPayrollMonth,
  payrollYear = new Date().getFullYear(),
  setPayrollYear,
  handleGeneratePayroll,
  isGenerating = false,
  salaryStructures = [],
  handleClosePayrollModal,
}) => {
  if (!showPayrollModal) return null;

  const activeCount = salaryStructures.filter((s) => s.isActive).length;
  const totalCount = salaryStructures.length;
  const estimatedPayroll = salaryStructures.reduce(
    (acc, s) => acc + Number(s.netSalary || 0),
    0
  );
  const monthNames = [
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
  ];
  const selectedMonthName = monthNames[(payrollMonth || 1) - 1] || "Selected Month";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in text-left"
      onClick={handleClosePayrollModal}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            Generate Monthly Staff Payroll
          </h3>
          <button onClick={handleClosePayrollModal} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {/* Pay Period Month & Year Picker */}
          <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border/50">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="h-4 w-4 text-primary" /> Select Pay Period
            </label>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Month</label>
                <select
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth && setPayrollMonth(Number(e.target.value))}
                >
                  {monthNames.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Year</label>
                <Input
                  type="number"
                  className="h-9 text-xs font-bold"
                  value={payrollYear}
                  onChange={(e) => setPayrollYear && setPayrollYear(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Active Staff Structures & Payroll Estimate Card */}
          <div className="space-y-2.5">
            <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" /> Target Period
                </span>
                <Badge variant="primary" className="text-[10px] font-bold">
                  {selectedMonthName} {payrollYear}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Monthly staff payslips will be automatically created for all active staff salary structures.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-3 bg-card border border-border/60 rounded-xl space-y-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wide">
                  Active Structures
                </span>
                <span className="text-base font-black text-foreground">
                  {activeCount > 0 ? activeCount : totalCount} Staff
                </span>
                <span className="text-[10px] text-success block font-medium">Ready for generation</span>
              </div>

              <div className="p-3 bg-card border border-border/60 rounded-xl space-y-0.5 shadow-sm">
                <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wide">
                  Est. Net Payroll
                </span>
                <span className="text-base font-black text-primary">
                  ₹{estimatedPayroll.toLocaleString()}
                </span>
                <span className="text-[10px] text-muted-foreground block font-medium">Net monthly total</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2.5">
          <Button variant="outline" onClick={handleClosePayrollModal} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGeneratePayroll} disabled={isGenerating} className="gap-2 font-bold">
            {isGenerating ? (
              <>
                <Clock className="h-4 w-4 animate-spin text-primary-foreground" />
                Generating Payroll...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Disburse Monthly Payroll
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
