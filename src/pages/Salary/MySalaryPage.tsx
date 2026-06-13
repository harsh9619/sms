import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSchool } from "../../context/SchoolContext";
import { fetchSalaries } from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { DollarSign, CheckCircle2, Clock, AlertCircle, Eye, X, Calendar, Receipt } from "lucide-react";
import type { SalaryRecord } from "../../types";

export function MySalaryPage() {
  const { user } = useAuth();
  const { activeSchool } = useSchool();
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);

  const loadSalaries = React.useCallback(() => {
    if (!user) return;
    setLoading(true);
    fetchSalaries()
      .then((allSalaries) => {
        // Filter by current teacher ID
        const mySalaries = allSalaries.filter((s: any) => s.teacherId === user.id);
        setSalaries(mySalaries);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user, activeSchool]);

  useEffect(() => {
    loadSalaries();
  }, [loadSalaries]);

  const stats = useMemo(() => {
    let earned = 0;
    let transactionsCount = 0;
    salaries.forEach((s) => {
      if (s.status === "paid") {
        const net = s.baseSalary + s.allowances - s.deductions;
        earned += net;
        transactionsCount++;
      }
    });
    return { earned, count: transactionsCount };
  }, [salaries]);

  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "processing") return <Clock className="h-4 w-4 text-info" />;
    return <AlertCircle className="h-4 w-4 text-warning" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "processing") return "info";
    return "warning";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center text-left">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            My Salary
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your payroll payments, monthly payslips, and tax slips
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
        <Card className="hover-lift">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground font-semibold">Total Net Earnings (YTD)</p>
            <p className="text-2xl font-black text-success mt-1.5">₹{stats.earned.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="hover-lift">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground font-semibold">Processed Payslips</p>
            <p className="text-2xl font-black text-foreground mt-1.5">{stats.count} Pay Periods</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary ledger list */}
      <Card>
        <CardHeader className="text-left">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payslip Registries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 text-left">
          {loading ? (
            <div className="text-center py-12">
              <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground text-xs">Loading payroll registry...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                    <th className="px-6 py-3.5">Period</th>
                    <th className="px-6 py-3.5">Basic Salary</th>
                    <th className="px-6 py-3.5">Allowances</th>
                    <th className="px-6 py-3.5">Deductions</th>
                    <th className="px-6 py-3.5">Net Salary</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((s) => {
                    const net = s.baseSalary + s.allowances - s.deductions;
                    return (
                      <tr key={s.id} className="border-b hover:bg-muted/10">
                        <td className="px-6 py-4 font-bold">
                          {s.month} {s.year}
                        </td>
                        <td className="px-6 py-4">₹{s.baseSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-success">+ ₹{s.allowances.toLocaleString()}</td>
                        <td className="px-6 py-4 text-destructive">- ₹{s.deductions.toLocaleString()}</td>
                        <td className="px-6 py-4 font-black">₹{net.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(s.status)}
                            <Badge variant={getStatusBadgeVariant(s.status)}>
                              {s.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="outline" className="h-8 font-semibold" onClick={() => setSelectedPayslip(s)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> View Payslip
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {salaries.length === 0 && (
                <div className="text-center py-16 text-muted-foreground/60 font-medium">
                  No payroll logs recorded for this account.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* payslip receipt modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPayslip(null)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Payslip Receipt
              </h3>
              <button onClick={() => setSelectedPayslip(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm">
              {/* Receipt metadata */}
              <div className="flex justify-between items-start border-b border-border/40 pb-4">
                <div>
                  <h4 className="font-bold text-foreground">{user?.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedPayslip.subject} Teacher</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-muted-foreground">Pay Period</span>
                  <p className="font-black text-primary">{selectedPayslip.month} {selectedPayslip.year}</p>
                </div>
              </div>

              {/* Items grid */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="text-foreground">₹{selectedPayslip.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-success">
                  <span>Allowances & HRA</span>
                  <span>+ ₹{selectedPayslip.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-destructive">
                  <span>Tax & PF Deductions</span>
                  <span>- ₹{selectedPayslip.deductions.toLocaleString()}</span>
                </div>
              </div>

              {/* Net earnings calculation */}
              <div className="p-4 bg-muted/50 rounded-xl flex justify-between items-center mt-6 border border-border/40">
                <span className="font-bold text-foreground text-xs uppercase">Net Amount Credited</span>
                <span className="text-lg font-black text-primary">
                  ₹{(selectedPayslip.baseSalary + selectedPayslip.allowances - selectedPayslip.deductions).toLocaleString()}
                </span>
              </div>

              {/* Paid Status Details */}
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
      )}
    </div>
  );
}
