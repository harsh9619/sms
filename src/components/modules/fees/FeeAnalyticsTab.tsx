import React from "react";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import type { FeeStatsResponse } from "./types";

interface FeeAnalyticsTabProps {
  stats?: FeeStatsResponse | null;
  currencySymbol?: string;
  onNavigateToInvoices?: (filterStatus?: string) => void;
}

export const FeeAnalyticsTab: React.FC<FeeAnalyticsTabProps> = ({
  stats,
  currencySymbol = "₹",
  onNavigateToInvoices,
}) => {
  if (!stats) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 animate-pulse" />
        <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">
          Loading Fee Analytics...
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Aggregating financial ledger data, please wait.
        </p>
      </div>
    );
  }

  const {
    totalBilled = 0,
    totalCollected = 0,
    totalPending = 0,
    totalOverdue = 0,
    totalInvoicesCount = 0,
    paidCount = 0,
    pendingCount = 0,
    overdueCount = 0,
    collectionRate = 0,
    typeBreakdown = {},
  } = stats;

  const typeEntries = Object.entries(typeBreakdown).sort((a, b) => b[1].billed - a[1].billed);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row (Mobile 2x2 Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Billed */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 p-3.5 sm:p-5 shadow-xs dark:border-blue-900/30 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider truncate">
              Total Billed
            </span>
            <div className="rounded-xl bg-blue-100 p-1.5 sm:p-2.5 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 text-lg sm:text-2xl font-black text-gray-900 dark:text-white truncate">
            {currencySymbol}
            {totalBilled.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{totalInvoicesCount} Invoices</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400 hidden sm:inline">100% Vol</span>
          </div>
        </div>

        {/* Total Collected */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 p-3.5 sm:p-5 shadow-xs dark:border-emerald-900/30 dark:from-emerald-950/20 dark:to-teal-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider truncate">
              Collected
            </span>
            <div className="rounded-xl bg-emerald-100 p-1.5 sm:p-2.5 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 shrink-0">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 truncate">
            {currencySymbol}
            {totalCollected.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{paidCount} Paid</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {collectionRate}%
            </span>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-yellow-50/70 p-3.5 sm:p-5 shadow-xs dark:border-amber-900/30 dark:from-amber-950/20 dark:to-yellow-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider truncate">
              Pending
            </span>
            <div className="rounded-xl bg-amber-100 p-1.5 sm:p-2.5 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 shrink-0">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400 truncate">
            {currencySymbol}
            {totalPending.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{pendingCount} Pending</span>
            {onNavigateToInvoices && (
              <button
                onClick={() => onNavigateToInvoices("pending")}
                className="font-bold text-amber-600 hover:underline dark:text-amber-400 flex items-center"
              >
                View <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Overdue Penalty Risk */}
        <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/70 to-rose-50/70 p-3.5 sm:p-5 shadow-xs dark:border-red-900/30 dark:from-red-950/20 dark:to-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider truncate">
              Overdue
            </span>
            <div className="rounded-xl bg-red-100 p-1.5 sm:p-2.5 text-red-700 dark:bg-red-900/50 dark:text-red-300 shrink-0">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-3 text-lg sm:text-2xl font-black text-red-600 dark:text-red-400 truncate">
            {currencySymbol}
            {totalOverdue.toLocaleString("en-IN")}
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">{overdueCount} Critical</span>
            {onNavigateToInvoices && (
              <button
                onClick={() => onNavigateToInvoices("overdue")}
                className="font-bold text-red-600 hover:underline dark:text-red-400 flex items-center"
              >
                View <ArrowUpRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Efficiency Gauge / Progress */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Overall Collection Efficiency
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Percentage of billed fee receivables successfully realized.
            </p>

            <div className="mt-8 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="h-36 w-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-gray-100 dark:text-gray-800"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-indigo-600 transition-all duration-1000 ease-out"
                    strokeDasharray={2 * Math.PI * 58}
                    strokeDashoffset={2 * Math.PI * 58 * (1 - collectionRate / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">
                    {collectionRate}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase text-gray-400">Realized</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4 text-xs">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Collected Fees
                </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {currencySymbol}
                  {totalCollected.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Pending Regular
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {currencySymbol}
                  {Math.max(0, totalPending - totalOverdue).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Overdue Fine Dues
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {currencySymbol}
                  {totalOverdue.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-blue-50/50 p-3 text-xs text-blue-800 dark:bg-blue-950/20 dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" />
            <span>
              School payment schedules auto-apply grace periods before calculating overdue fines.
            </span>
          </div>
        </div>

        {/* Fee Component Breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-500" />
                Fee Type Category Distribution
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Breakdown of receivables and realized collections per fee component.
              </p>
            </div>
          </div>

          {typeEntries.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No categorized fee invoices billed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {typeEntries.map(([typeKey, val]) => {
                const percent = totalBilled > 0 ? Math.round((val.billed / totalBilled) * 100) : 0;
                const paidPercent = val.billed > 0 ? Math.round((val.collected / val.billed) * 100) : 0;

                return (
                  <div key={typeKey} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="capitalize text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                        {typeKey} ({val.count} items)
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 dark:text-gray-400 font-normal">
                          Paid: {currencySymbol}
                          {val.collected.toLocaleString("en-IN")} ({paidPercent}%)
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-bold">
                          {currencySymbol}
                          {val.billed.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Dual Progress Bar */}
                    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden dark:bg-gray-800 flex">
                      <div
                        style={{ width: `${paidPercent}%` }}
                        className="h-full bg-emerald-500 transition-all duration-500"
                        title={`Collected: ${paidPercent}%`}
                      />
                      <div
                        style={{ width: `${100 - paidPercent}%` }}
                        className="h-full bg-amber-400/70 transition-all duration-500"
                        title={`Pending: ${100 - paidPercent}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
