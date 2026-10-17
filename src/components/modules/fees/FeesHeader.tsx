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
  Calendar,
  BarChart3,
  Sliders,
} from "lucide-react";

interface FeesHeaderProps {
  isMyFees?: boolean;
  activeSubTab?: "invoices" | "schedules" | "structures" | "analytics";
  setActiveSubTab?: (tab: "invoices" | "schedules" | "structures" | "analytics") => void;
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
  statusFilter?: string;
  setStatusFilter?: (val: string) => void;
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
  statusFilter = "all",
  setStatusFilter,
}) => {
  const handleStatCardClick = (status: "all" | "paid" | "pending" | "overdue") => {
    if (!setStatusFilter) return;
    if (statusFilter === status) {
      setStatusFilter("all");
    } else {
      setStatusFilter(status);
    }
  };
  console.log(stats);
  return (
    <div className="space-y-4 sm:space-y-6 text-left">
      {/* Top Title and Action Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 mb-1">
            <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
            <span className="truncate">Fee Management Engine V2.0</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-1.5 sm:p-2 text-white shadow-md shadow-indigo-200 dark:shadow-none shrink-0">
              <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className="truncate">
              {isMyFees ? "My Fee Records" : "School Fees & Ledger"}
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 max-w-2xl hidden sm:block">
            {isMyFees
              ? "View school fee schedules, installments, paid receipts and download tax-compliant payment PDFs."
              : "Comprehensive billing engine for monthly/quarterly payment schedules (April & July cycles), class-wise fee structures, and receipts."}
          </p>
        </div>

        {/* Action Buttons - Mobile First Stack & Wrap */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Primary Action Button */}
          {!isMyFees && activeSubTab === "invoices" && handleOpenAddModal && (
            <Button
              size="sm"
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 dark:shadow-none h-9 order-1 sm:order-last"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add Fee Entry
            </Button>
          )}

          {!isMyFees && activeSubTab === "structures" && handleOpenAddStructModal && (
            <Button
              size="sm"
              onClick={handleOpenAddStructModal}
              className="w-full sm:w-auto rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 font-bold shadow-md shadow-indigo-200 dark:shadow-none h-9 order-1 sm:order-last"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Configure Class Fee
            </Button>
          )}

          {!isMyFees && setShowGenerateModal && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowGenerateModal(true)}
              className="flex-1 sm:flex-initial rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800 border border-indigo-200 text-xs font-bold shadow-xs h-9"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <span className="truncate">Generate Invoices</span>
            </Button>
          )}

          {/* {handleExportExcel && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              className="rounded-xl text-xs h-9 px-2.5 sm:px-3 font-semibold"
              title="Export fee records to Excel"
            >
              <Download className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Export Excel</span>
            </Button>
          )} */}

          {/* {handleExportSummary && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSummary}
              className="rounded-xl text-xs h-9 px-2.5 sm:px-3 font-semibold hidden md:inline-flex"
            >
              Summary Report
            </Button>
          )} */}
        </div>
      </div>

      {error && (
        <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-xs sm:text-sm font-medium">
          {error}
        </div>
      )}

      {/* Admin Sub-Tabs Navigation (Mobile Pill Bar with Snap) */}
      {!isMyFees && setActiveSubTab && (
        <div className="flex gap-1.5 p-1 bg-muted/50 rounded-2xl border border-border/60 overflow-x-auto no-scrollbar scroll-smooth snap-x">
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`px-3 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 snap-start ${activeSubTab === "invoices"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>Invoices</span>
            <span className="hidden sm:inline">&amp; Ledger</span>
          </button>

          <button
            onClick={() => setActiveSubTab("schedules")}
            className={`px-3 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 snap-start ${activeSubTab === "schedules"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedules</span>
            <span className="hidden sm:inline">Master (V2)</span>
          </button>

          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-3 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 snap-start ${activeSubTab === "structures"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Class Fees</span>
            <span className="hidden sm:inline">Structures</span>
          </button>

          <button
            onClick={() => setActiveSubTab("analytics")}
            className={`px-3 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 snap-start ${activeSubTab === "analytics"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Analytics</span>
            <span className="hidden sm:inline">&amp; KPIs</span>
          </button>
        </div>
      )}

      {/* Summary KPI Cards for Invoices tab (Mobile 2x2 Grid, Interactive Tap-To-Filter) */}
      {activeSubTab === "invoices" && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Total Invoices */}
          <Card
            onClick={() => handleStatCardClick("all")}
            className={`hover-lift rounded-2xl border-gray-200 shadow-xs dark:border-gray-800 cursor-pointer transition-all ${statusFilter === "all" ? "ring-2 ring-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20" : ""
              }`}
          >
            <CardContent className="p-3 sm:pt-5 sm:pb-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider truncate">
                  Total Fees
                </p>
                {statusFilter === "all" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </div>
              <p className="text-base sm:text-2xl font-black text-foreground mt-1 truncate">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 font-medium truncate">
                {stats.totalCount} Invoices
              </p>
            </CardContent>
          </Card>

          {/* Paid */}
          <Card
            onClick={() => handleStatCardClick("paid")}
            className={`hover-lift rounded-2xl border-l-4 border-l-emerald-500 shadow-xs dark:border-gray-800 cursor-pointer transition-all ${statusFilter === "paid" ? "ring-2 ring-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20" : ""
              }`}
          >
            <CardContent className="p-3 sm:pt-5 sm:pb-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider truncate">
                  Paid
                </p>
                {statusFilter === "paid" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
              <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                ₹{stats.paidAmount.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-emerald-600/80 mt-0.5 font-medium truncate">
                {stats.paidCount} Fully Paid
              </p>
            </CardContent>
          </Card>

          {/* Pending */}
          <Card
            onClick={() => handleStatCardClick("pending")}
            className={`hover-lift rounded-2xl border-l-4 border-l-amber-500 shadow-xs dark:border-gray-800 cursor-pointer transition-all ${statusFilter === "pending" ? "ring-2 ring-amber-500 bg-amber-50/20 dark:bg-amber-950/20" : ""
              }`}
          >
            <CardContent className="p-3 sm:pt-5 sm:pb-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider truncate">
                  Pending
                </p>
                {statusFilter === "pending" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                )}
              </div>
              <p className="text-base sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 truncate">
                ₹{stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-amber-600/80 mt-0.5 font-medium truncate">
                {stats.pendingCount} Pending
              </p>
            </CardContent>
          </Card>

          {/* Overdue */}
          <Card
            onClick={() => handleStatCardClick("overdue")}
            className={`hover-lift rounded-2xl border-l-4 border-l-red-500 shadow-xs dark:border-gray-800 cursor-pointer transition-all ${statusFilter === "overdue" ? "ring-2 ring-red-500 bg-red-50/20 dark:bg-red-950/20" : ""
              }`}
          >
            <CardContent className="p-3 sm:pt-5 sm:pb-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-bold uppercase tracking-wider truncate">
                  Overdue
                </p>
                {statusFilter === "overdue" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </div>
              <p className="text-base sm:text-2xl font-black text-red-600 dark:text-red-400 mt-1 truncate">
                ₹{stats.overdueAmount.toLocaleString()}
              </p>
              <p className="text-[10px] sm:text-xs text-red-600/80 mt-0.5 font-medium truncate">
                {stats.overdueCount} Critical
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

