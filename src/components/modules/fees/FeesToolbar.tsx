import React from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Search, Filter, RefreshCw, X } from "lucide-react";

interface FeesToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  feeTypeFilter?: string;
  setFeeTypeFilter?: (val: string) => void;
  monthFilter?: string;
  setMonthFilter?: (val: string) => void;
  selectedClassFilter?: string;
  setSelectedClassFilter?: (val: string) => void;
  classes?: any[];
  isMyFees?: boolean;
  activeSubTab?: "invoices" | "structures";
  filteredCount: number;
}

export const FeesToolbar: React.FC<FeesToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  feeTypeFilter = "all",
  setFeeTypeFilter,
  monthFilter = "all",
  setMonthFilter,
  selectedClassFilter = "all",
  setSelectedClassFilter,
  classes = [],
  isMyFees = false,
  activeSubTab = "invoices",
  filteredCount,
}) => {
  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    feeTypeFilter !== "all" ||
    monthFilter !== "all" ||
    selectedClassFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    if (setFeeTypeFilter) setFeeTypeFilter("all");
    if (setMonthFilter) setMonthFilter("all");
    if (setSelectedClassFilter) setSelectedClassFilter("all");
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 sm:p-4 space-y-3 text-left shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Input
            placeholder={
              activeSubTab === "invoices"
                ? "Search by student name, roll number, invoice number..."
                : "Search class fee structure by class name or fee component..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full pl-9 pr-9 h-10 rounded-xl border-border bg-background/60 focus:bg-background transition-all text-sm shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
          {/* Class Filter */}
          {!isMyFees && setSelectedClassFilter && (
            <div className="col-span-1 sm:w-auto">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
              >
                <option value="all">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id || cls.className} value={cls.id || cls.className}>
                    {cls.className} {cls.section ? `- ${cls.section}` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          {activeSubTab === "invoices" && (
            <div className="col-span-1 sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          )}

          {/* Fee Type Filter */}
          {setFeeTypeFilter && (
            <div className="col-span-1 sm:w-auto">
              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer capitalize shadow-xs"
              >
                <option value="all">All Fee Types</option>
                <option value="tuition">Tuition</option>
                <option value="exam">Examination</option>
                <option value="transport">Transport</option>
                <option value="annual">Annual</option>
                <option value="computer">Computer Lab</option>
                <option value="uniforms">Uniforms</option>
                <option value="library">Library</option>
                <option value="sports">Sports</option>
              </select>
            </div>
          )}

          {/* Month Filter */}
          {activeSubTab === "invoices" && setMonthFilter && (
            <div className="col-span-1 sm:w-auto">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="w-full h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
              >
                <option value="all">All Months</option>
                <option value="04">April (Term 1)</option>
                <option value="05">May</option>
                <option value="06">June</option>
                <option value="07">July</option>
                <option value="08">August</option>
                <option value="09">September (Term 2)</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
                <option value="01">January (Term 3)</option>
                <option value="02">February</option>
                <option value="03">March</option>
              </select>
            </div>
          )}

          {/* Reset Filters */}
          <Button
            variant="outline"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={handleResetFilters}
            className="col-span-2 sm:col-auto h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            title="Reset all filters"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Chips & Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-primary" /> Active Filters:
          </span>

          {searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border-primary/20"
            >
              Search: "{searchQuery}"
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}

          {statusFilter !== "all" && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border-primary/20 capitalize"
            >
              Status: {statusFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setStatusFilter("all")}
              />
            </Badge>
          )}

          {feeTypeFilter !== "all" && setFeeTypeFilter && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border-primary/20 capitalize"
            >
              Type: {feeTypeFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setFeeTypeFilter("all")}
              />
            </Badge>
          )}

          {monthFilter !== "all" && setMonthFilter && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border-primary/20"
            >
              Month: {monthFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setMonthFilter("all")}
              />
            </Badge>
          )}

          {selectedClassFilter !== "all" && setSelectedClassFilter && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border-primary/20"
            >
              Class: {selectedClassFilter}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setSelectedClassFilter("all")}
              />
            </Badge>
          )}

          <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
            Showing {filteredCount} records
          </span>
        </div>
      )}
    </div>
  );
};
