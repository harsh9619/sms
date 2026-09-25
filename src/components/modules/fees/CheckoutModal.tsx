import React from "react";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { CreditCard, X } from "lucide-react";
import type { FeeRecord } from "../../../types";

interface CheckoutModalProps {
  payingFee: FeeRecord | null;
  setPayingFee: (fee: FeeRecord | null) => void;
  payingFeeItems: any[];
  checkoutTotalAmount: number;
  paymentMethod: string;
  setPaymentMethod?: (method: string) => void;
  processing?: boolean;
  handlePay?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  payingFee,
  setPayingFee,
  payingFeeItems,
  checkoutTotalAmount,
  paymentMethod,
  setPaymentMethod,
  processing = false,
  handlePay,
}) => {
  if (!payingFee) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
      onClick={() => !processing && setPayingFee(null)}
    >
      <div
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between bg-primary/5">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2 text-foreground">
              <CreditCard className="h-5 w-5 text-primary" />
              Fee Payment Gateway Checkout
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Authorize & process payment for all selected fee heads
            </p>
          </div>
          {!processing && (
            <button
              onClick={() => setPayingFee(null)}
              className="text-muted-foreground hover:text-foreground w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Student & Billing Month Banner */}
          <div className="p-3 bg-muted/40 rounded-2xl border border-border flex items-center justify-between">
            <div>
              <p className="font-extrabold text-sm text-foreground">
                {payingFee.studentName || "Student"}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {payingFee.class ? `Class: ${payingFee.class}` : ""}{" "}
                {payingFee.rollNumber ? `| Roll: ${payingFee.rollNumber}` : ""}
              </p>
            </div>
            <Badge variant="outline" className="font-bold text-primary border-primary/40 bg-primary/5">
              {payingFee.month || "Current Month"}
            </Badge>
          </div>

          {/* Itemized List of Selected Fee Heads */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-muted-foreground tracking-wider">
              Fee Components Breakdown ({payingFeeItems.length} heads selected)
            </label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {payingFeeItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2.5 rounded-xl border border-border/70 bg-card flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold capitalize text-foreground">
                        {item.feeType || item.type} Fee
                      </p>
                      {item.remarks && (
                        <p className="text-[10px] text-muted-foreground truncate">{item.remarks}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-black text-foreground text-xs">
                    ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total Highlight Box */}
          <div className="p-3.5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Total Amount to Pay
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                All selected fee heads included
              </p>
            </div>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{checkoutTotalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Payment Method Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-foreground">
              Select Payment Gateway Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod && setPaymentMethod(e.target.value)}
              className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="credit_card">Credit / Debit Card</option>
              <option value="upi">UPI / QR Code (Instant)</option>
              <option value="net_banking">Net Banking</option>
              <option value="wallet">Mobile Wallet</option>
            </select>
          </div>

          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
            🔒 Sandbox Payment Simulation: Click Authorize to process payment and generate official receipt.
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2.5 bg-muted/20">
          <Button
            variant="outline"
            onClick={() => setPayingFee(null)}
            disabled={processing}
            className="font-bold text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePay}
            disabled={processing}
            className="font-extrabold text-xs px-5 shadow-md"
          >
            {processing
              ? "Processing Payment..."
              : `Authorize ₹${checkoutTotalAmount.toLocaleString("en-IN")}`}
          </Button>
        </div>
      </div>
    </div>
  );
};
