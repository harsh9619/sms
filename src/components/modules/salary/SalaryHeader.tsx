import React from "react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import { DollarSign, Download, Plus, Sparkles, Receipt, Users } from "lucide-react";

interface SalaryHeaderProps {
  isMySalary?: boolean;
  activeSubTab?: "registries" | "structures";
  setActiveSubTab?: (tab: "registries" | "structures") => void;
  error?: string | null;
  stats: {
    earned: number;
    paidCount: number;
    pendingCount: number;
    processingCount: number;
    totalCount: number;
    totalPayroll: number;
  };
  handleExportExcel?: () => void;
  handleExportSummary?: () => void;
  handleOpenAddModal?: () => void;
  handleOpenAddStructModal?: () => void;
  setShowPayrollModal?: (show: boolean) => void;
}

export const SalaryHeader: React.FC<SalaryHeaderProps> = ({
  isMySalary = false,
  activeSubTab = "registries",
  setActiveSubTab,
  error,
  stats,
  handleExportExcel,
  handleExportSummary,
  handleOpenAddModal,
  handleOpenAddStructModal,
  setShowPayrollModal,
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            {isMySalary ? "My Salary & Payslips" : "Payroll & Salary Management"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMySalary
              ? "Track your monthly earnings, allowances, tax deductions, and download payslips"
              : "Manage staff payroll, teacher base salaries, allowances, deductions, and monthly payslips"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {handleExportExcel && (
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
          )}
          {handleExportSummary && (
            <Button variant="outline" size="sm" onClick={handleExportSummary}>
              Summary Report
            </Button>
          )}
          {!isMySalary && activeSubTab === "registries" && handleOpenAddModal && (
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Payroll Entry
            </Button>
          )}
          {!isMySalary && activeSubTab === "structures" && handleOpenAddStructModal && (
            <Button size="sm" onClick={handleOpenAddStructModal}>
              <Plus className="h-4 w-4 mr-2" /> Configure Salary Structure
            </Button>
          )}
          {!isMySalary && activeSubTab === "structures" && setShowPayrollModal && (
            <Button size="sm" variant="secondary" onClick={() => setShowPayrollModal(true)}>
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> Generate Monthly Payroll
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Admin Sub-Tabs Switcher */}
      {!isMySalary && setActiveSubTab && (
        <div className="flex gap-2 border-b border-border/60 pb-1">
          <button
            onClick={() => setActiveSubTab("registries")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "registries"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Payroll Registries & Payslips
          </button>
          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "structures"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            Staff Salary Structures
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {activeSubTab === "registries" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">
                {isMySalary ? "Total Net Earnings (YTD)" : "Total Net Payroll"}
              </p>
              <p className="text-2xl font-black text-success mt-1.5">
                ₹{stats.earned.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.paidCount} Paid Pay Periods
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-info">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Total Pay Records</p>
              <p className="text-2xl font-black text-foreground mt-1.5">{stats.totalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">
                ₹{stats.totalPayroll.toLocaleString()} Gross Value
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-warning">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Pending Approvals</p>
              <p className="text-2xl font-black text-warning mt-1.5">{stats.pendingCount}</p>
              <p className="text-xs text-warning mt-1">Awaiting Disbursal</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-primary">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">In Processing</p>
              <p className="text-2xl font-black text-primary mt-1.5">{stats.processingCount}</p>
              <p className="text-xs text-primary mt-1 font-medium">Bank Clearing</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
