import React from "react";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Receipt, Download, FileText, X } from "lucide-react";
import type { FeeRecord } from "../../../types";
import feeService from "../../../Services/fee.service";

interface ReceiptModalProps {
  activeReceipt: any;
  setActiveReceipt: (receipt: any) => void;
  fees: FeeRecord[];
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  activeReceipt,
  setActiveReceipt,
  fees,
}) => {
  if (!activeReceipt) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in p-4 overflow-y-auto"
      onClick={() => setActiveReceipt(null)}
    >
      <div
        className="bg-card border-2 border-primary/30 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in text-left my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <h3 className="font-black text-base text-foreground">Official Fee Payment Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold gap-1"
              onClick={() => window.print()}
            >
              <FileText className="h-3.5 w-3.5" /> Print
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs font-bold gap-1"
              onClick={() =>
                feeService.downloadFeeReceiptPdf(
                  activeReceipt.items?.[0]?.id || "1",
                  activeReceipt,
                  fees
                )
              }
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
            <button
              onClick={() => setActiveReceipt(null)}
              className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body Container */}
        <div className="p-6 space-y-6 text-sm bg-background">
          {/* Receipt Branding Band */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase">School Management System</h2>
              <p className="text-xs font-medium opacity-90">Official Consolidated Monthly Fee Receipt</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-lg backdrop-blur-xs block sm:inline-block">
                #{activeReceipt.receiptNo || "REC-OFFICIAL"}
              </span>
              <p className="text-[11px] opacity-80 mt-1">
                Issued: {activeReceipt.paidDate || new Date().toISOString().slice(0, 10)}
              </p>
            </div>
          </div>

          {/* Student & Billing Info */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                Student Details
              </p>
              <p className="font-extrabold text-sm text-foreground mt-0.5">
                {activeReceipt.studentName || "N/A"}
              </p>
              <p className="text-muted-foreground font-semibold">
                Class: <strong className="text-foreground">{activeReceipt.class || "N/A"}</strong> |
                Roll No: <strong className="text-foreground">{activeReceipt.rollNumber || "N/A"}</strong>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                Payment Information
              </p>
              <p className="font-extrabold text-sm text-foreground mt-0.5">
                Billing Period: <span className="text-primary">{activeReceipt.month || "Current"}</span>
              </p>
              <p className="text-muted-foreground font-semibold">
                Payment Mode:{" "}
                <strong className="text-foreground">
                  {activeReceipt.paymentMethod || "Direct Settlement"}
                </strong>
              </p>
            </div>
          </div>

          {/* Selected Fee Types Breakdown Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-xs uppercase tracking-wider text-muted-foreground">
                Selected Fee Components ({activeReceipt.items?.length || 0} heads)
              </h4>
              <Badge
                variant={activeReceipt.status === "paid" ? "success" : "warning"}
                className="font-bold text-xs uppercase"
              >
                {activeReceipt.status || "PAID"}
              </Badge>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-muted/60 border-b border-border text-muted-foreground font-bold">
                    <th className="px-4 py-3 text-center w-12">#</th>
                    <th className="px-4 py-3">Fee Type / Category</th>
                    <th className="px-4 py-3">Description / Note</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {activeReceipt.items?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/10 font-semibold">
                      <td className="px-4 py-3 text-center text-muted-foreground font-mono">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 font-bold capitalize text-foreground">
                        {item.label || `${item.feeType || "Tuition"} Fee`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {item.remarks || `Billing charge for ${activeReceipt.month || "month"}`}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-foreground">
                        ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Grand Total Summary Box */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-primary uppercase tracking-wider">
                Total Amount Settled
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                All selected fee items included in receipt
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{Number(activeReceipt.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Authorization Stamp Footer */}
          <div className="pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground">
            <p className="font-medium">
              Official computer-generated receipt. Valid without signature.
            </p>
            <div className="text-center sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
              <p className="font-black text-foreground">Authorized Cashier / Principal</p>
              <p className="text-[10px] opacity-75">School Management System</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border flex justify-end bg-muted/30">
          <Button
            variant="outline"
            onClick={() => setActiveReceipt(null)}
            className="font-bold text-xs"
          >
            Close Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
