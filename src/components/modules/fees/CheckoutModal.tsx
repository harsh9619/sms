import React from "react";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { CreditCard, ShieldCheck, Lock, X } from "lucide-react";
import type { FeeRecord } from "../../../types";
import { PAYMENT_OPTIONS } from "../../../constants/fee";

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

  const paymentOptions = PAYMENT_OPTIONS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-0 sm:p-4"
      onClick={() => !processing && setPayingFee(null)}
    >
      <div
        className="bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in text-left max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-primary/5 shrink-0">
          <div className="min-w-0">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-foreground truncate">
              <CreditCard className="h-5 w-5 text-primary shrink-0" />
              Fee Gateway Checkout
            </h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5 truncate">
              Secure fee payment processing
            </p>
          </div>
          {!processing && (
            <button
              onClick={() => setPayingFee(null)}
              className="text-muted-foreground hover:text-foreground w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center shrink-0 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Student & Billing Month Banner */}
          <div className="p-3 bg-muted/40 rounded-2xl border border-border flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-extrabold text-sm text-foreground truncate">
                {payingFee.studentName || "Student"}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium truncate">
                {payingFee.class ? `Class: ${payingFee.class}` : ""}{" "}
                {payingFee.rollNumber ? `| Roll: #${payingFee.rollNumber}` : ""}
              </p>
            </div>
            <Badge variant="outline" className="font-bold text-primary border-primary/40 bg-primary/5 shrink-0">
              {payingFee.month || "Current Month"}
            </Badge>
          </div>

          {/* Itemized List of Selected Fee Heads */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-muted-foreground tracking-wider block">
              Fee Heads Breakdown ({payingFeeItems.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 no-scrollbar">
              {payingFeeItems.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-2.5 rounded-xl border border-border/70 bg-card flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold capitalize text-foreground truncate">
                        {item.feeType || item.type} Fee
                      </p>
                      {item.remarks && (
                        <p className="text-[10px] text-muted-foreground truncate">{item.remarks}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-black text-foreground text-xs shrink-0 ml-2">
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
                Total Payable Amount
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">
                Inclusive of all selected components
              </p>
            </div>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{checkoutTotalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Payment Method Selector Tiles */}
          <div className="space-y-2">
            <label className="text-xs font-black text-foreground block">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentOptions.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                const IconComponent = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod && setPaymentMethod(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                      : "border-border/80 bg-card hover:bg-muted/40"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div
                        className={`p-1.5 rounded-xl ${isSelected
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground"
                          }`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>
                      {opt.badge && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold uppercase">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-extrabold text-foreground text-xs">{opt.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-2.5 bg-muted/50 border border-border/60 rounded-xl text-[10px] text-muted-foreground leading-relaxed font-medium flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>256-bit SSL Encrypted Sandbox Gateway Simulation. Instant digital receipt.</span>
          </div>
        </div>

        {/* Modal Action Bar (Sticky at bottom on mobile) */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20 shrink-0">
          <Button
            variant="outline"
            onClick={() => setPayingFee(null)}
            disabled={processing}
            className="font-bold text-xs h-11 px-4 rounded-xl flex-1 sm:flex-initial"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePay}
            disabled={processing}
            className="font-extrabold text-xs h-11 px-6 rounded-xl shadow-md bg-indigo-600 hover:bg-indigo-700 flex-2 sm:flex-initial"
          >
            {processing ? (
              "Processing..."
            ) : (
              `Authorize & Pay ₹${checkoutTotalAmount.toLocaleString("en-IN")}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
