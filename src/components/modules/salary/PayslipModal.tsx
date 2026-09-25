import React from "react";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Receipt, Calendar, X } from "lucide-react";
import type { SalaryRecord } from "../../../types";

interface PayslipModalProps {
  selectedPayslip: SalaryRecord | null;
  setSelectedPayslip: (sal: SalaryRecord | null) => void;
  userName?: string;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  selectedPayslip,
  setSelectedPayslip,
  userName = "Staff",
}) => {
  if (!selectedPayslip) return null;

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "processing") return "default";
    return "warning";
  };

  const netSalary =
    (selectedPayslip.baseSalary || 0) +
    (selectedPayslip.allowances || 0) -
    (selectedPayslip.deductions || 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={() => setSelectedPayslip(null)}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payslip Statement Receipt
          </h3>
          <button
            onClick={() => setSelectedPayslip(null)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-sm">
          <div className="flex justify-between items-start border-b border-border/40 pb-4">
            <div>
              <h4 className="font-bold text-foreground">
                {selectedPayslip.teacherName || userName}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedPayslip.subject || "Faculty"} Teacher
              </p>
              {selectedPayslip.teacherEmail && (
                <p className="text-[11px] text-muted-foreground">
                  Email: {selectedPayslip.teacherEmail}
                </p>
              )}
              {selectedPayslip.teacherPhone && (
                <p className="text-[11px] text-muted-foreground">
                  Phone: {selectedPayslip.teacherPhone}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-muted-foreground">Pay Period</span>
              <p className="font-black text-primary">
                {selectedPayslip.month} {selectedPayslip.year}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between font-semibold">
              <span className="text-muted-foreground">Basic Salary</span>
              <span className="text-foreground">
                ₹{Number(selectedPayslip.baseSalary || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-success">
              <span>Allowances & HRA</span>
              <span>+ ₹{Number(selectedPayslip.allowances || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold text-destructive">
              <span>Tax & PF Deductions</span>
              <span>- ₹{Number(selectedPayslip.deductions || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4 bg-muted/50 rounded-xl flex justify-between items-center mt-6 border border-border/40">
            <span className="font-bold text-foreground text-xs uppercase">Net Amount Credited</span>
            <span className="text-lg font-black text-primary">₹{netSalary.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3 justify-center pt-6 border-t border-border/40 text-xs text-muted-foreground font-semibold">
            <Badge variant={getStatusBadgeVariant(selectedPayslip.status)} className="py-1 px-3">
              Status: {selectedPayslip.status.toUpperCase()}
            </Badge>
            {selectedPayslip.paidDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" /> Paid on {selectedPayslip.paidDate}
              </span>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end">
          <Button onClick={() => setSelectedPayslip(null)}>Close Payslip</Button>
        </div>
      </div>
    </div>
  );
};
