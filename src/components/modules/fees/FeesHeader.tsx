import React from "react";
import { Button } from "../../ui/Button";
import { Card, CardContent } from "../../ui/Card";
import {
  DollarSign,
  Download,
  Plus,
  Sparkles,
  Receipt,
  Layers,
} from "lucide-react";

interface FeesHeaderProps {
  isMyFees?: boolean;
  activeSubTab?: "invoices" | "structures";
  setActiveSubTab?: (tab: "invoices" | "structures") => void;
  error?: string | null;
  stats: {
    totalAmount: number;
    totalCount: number;
    paidAmount: number;
    paidCount: number;
    pendingAmount: number;
    pendingCount: number;
    overdueAmount: number;
    overdueCount: number;
  };
  handleExportExcel?: () => void;
  handleExportSummary?: () => void;
  handleOpenAddModal?: () => void;
  handleOpenAddStructModal?: () => void;
  setShowGenerateModal?: (show: boolean) => void;
}

export const FeesHeader: React.FC<FeesHeaderProps> = ({
  isMyFees = false,
  activeSubTab = "invoices",
  setActiveSubTab,
  error,
  stats,
  handleExportExcel,
  handleExportSummary,
  handleOpenAddModal,
  handleOpenAddStructModal,
  setShowGenerateModal,
}) => {
  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            {isMyFees ? "My Fees" : "Fee Management & Ledgers"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMyFees
              ? "View your school fees, invoices and payment transaction history"
              : "Manage student billing, class-wise fee structures, collections, and financial receipts"}
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
          {!isMyFees && activeSubTab === "invoices" && handleOpenAddModal && (
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Fee Entry
            </Button>
          )}
          {!isMyFees && activeSubTab === "structures" && handleOpenAddStructModal && (
            <Button size="sm" onClick={handleOpenAddStructModal}>
              <Plus className="h-4 w-4 mr-2" /> Configure Class Fee
            </Button>
          )}
          {!isMyFees && activeSubTab === "structures" && setShowGenerateModal && (
            <Button size="sm" variant="secondary" onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> Auto-Generate Invoices
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
      {!isMyFees && setActiveSubTab && (
        <div className="flex gap-2 border-b border-border/60 pb-1">
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "invoices"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Student Fee Invoices & Ledgers
          </button>
          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSubTab === "structures"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" />
            Class-Wise Fee Structures
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {activeSubTab === "invoices" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover-lift">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Total Fee Billing</p>
              <p className="text-2xl font-black text-foreground mt-1.5">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalCount} Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-success">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Amount Settled (Paid)</p>
              <p className="text-2xl font-black text-success mt-1.5">
                ₹{stats.paidAmount.toLocaleString()}
              </p>
              <p className="text-xs text-success/80 mt-1 font-medium">
                {stats.paidCount} Fully Paid Receipts
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-warning">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Pending Collection</p>
              <p className="text-2xl font-black text-warning mt-1.5">
                ₹{stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-warning/80 mt-1 font-medium">
                {stats.pendingCount} Invoices Pending
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-destructive">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Overdue Dues</p>
              <p className="text-2xl font-black text-destructive mt-1.5">
                ₹{stats.overdueAmount.toLocaleString()}
              </p>
              <p className="text-xs text-destructive/80 mt-1 font-medium">
                {stats.overdueCount} Critical Overdue
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
