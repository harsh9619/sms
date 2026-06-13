import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { fetchFees, fetchStudents, updateFee } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { DollarSign, CheckCircle2, Clock, AlertCircle, Receipt, CreditCard, X } from "lucide-react";
import type { FeeRecord } from "../../types";

export function MyFeesPage() {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  // Fetch student profile first
  useEffect(() => {
    if (user?.role === "student") {
      fetchStudents()
        .then((studentsList) => {
          const profile = studentsList.find((s: any) => s.email === user.email);
          if (profile) setStudentProfile(profile);
        })
        .catch((err) => console.error(err));
    }
  }, [user, activeSchool]);

  const loadFees = React.useCallback(() => {
    if (!studentProfile) return;
    setLoading(true);
    fetchFees()
      .then((allFees) => {
        // Filter by current student
        const myFees = allFees.filter((f: any) => f.studentId === studentProfile.id);
        setFees(myFees);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [studentProfile, activeSchool]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const stats = useMemo(() => {
    let total = 0;
    let paid = 0;
    let pending = 0;
    fees.forEach((f) => {
      total += f.amount;
      if (f.status === "paid") {
        paid += f.amount;
      } else {
        pending += f.amount;
      }
    });
    return { total, paid, pending };
  }, [fees]);

  const handlePay = () => {
    if (!payingFee) return;
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      const payload = {
        ...payingFee,
        status: "paid",
        paidDate: new Date().toISOString().slice(0, 10),
        remarks: `Paid via Mock Gateway (${paymentMethod})`,
      };

      updateFee(payingFee.id, payload)
        .then(() => {
          setProcessing(false);
          setPayingFee(null);
          loadFees();
        })
        .catch((err) => {
          console.error(err);
          alert("Payment update failed.");
          setProcessing(false);
        });
    }, 1500);
  };

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "pending") return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            My Fees
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View your school fees, invoices and transaction histories
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
        <Card className="hover-lift">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground font-semibold">Total Fee Billing</p>
            <p className="text-2xl font-black text-foreground mt-1.5">₹{stats.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-success">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground font-semibold">Amount Paid</p>
            <p className="text-2xl font-black text-success mt-1.5">₹{stats.paid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-warning">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground font-semibold">Amount Outstanding</p>
            <p className="text-2xl font-black text-warning mt-1.5">₹{stats.pending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fees List */}
      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Invoice Ledgers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground text-xs">Loading accounts ledger...</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-left">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <th className="px-6 py-3.5 text-left">Fee Type</th>
                    <th className="px-6 py-3.5 text-left">Billing Amount</th>
                    <th className="px-6 py-3.5 text-left">Due Date</th>
                    <th className="px-6 py-3.5 text-left">Payment Date</th>
                    <th className="px-6 py-3.5 text-left">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id} className="border-b hover:bg-muted/10">
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground capitalize">{fee.feeType}</span>
                        {fee.remarks && <p className="text-[10px] text-muted-foreground font-normal mt-0.5">{fee.remarks}</p>}
                      </td>
                      <td className="px-6 py-4 font-bold">₹{fee.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{fee.dueDate}</td>
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">{fee.paidDate || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(fee.status)}
                          <Badge variant={getStatusBadgeVariant(fee.status)}>
                            {fee.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fee.status !== "paid" && (
                          <Button size="sm" className="h-8 font-semibold" onClick={() => setPayingFee(fee)}>
                            Pay Now
                          </Button>
                        )}
                        {fee.status === "paid" && (
                          <span className="text-xs text-success font-semibold flex items-center justify-end gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fees.length === 0 && (
                <div className="text-center py-16 text-muted-foreground/60 font-medium">
                  No fee records found for this academic period.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mock Payment Gateway Dialog */}
      {payingFee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => !processing && setPayingFee(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm m-4 overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Mock Payment checkout
              </h3>
              {!processing && (
                <button onClick={() => setPayingFee(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">Payment For</p>
                <p className="text-sm font-bold capitalize">{payingFee.feeType} Fee</p>
                <p className="text-xl font-black text-primary mt-1">₹{payingFee.amount.toLocaleString()}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Select Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="wallet">Mobile Wallet</option>
                </select>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                🚨 This is a mock sandbox integration. No actual currency will be debited or processed. Clicking authorize will simulate receipt confirmations.
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button variant="outline" onClick={() => setPayingFee(null)} disabled={processing}>Cancel</Button>
              <Button onClick={handlePay} disabled={processing}>
                {processing ? "Processing checkout..." : `Authorize ₹${payingFee.amount.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
