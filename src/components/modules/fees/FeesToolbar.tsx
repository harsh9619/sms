import React from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Search, Filter, RefreshCw, Layers, CalendarDays } from "lucide-react";

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
    <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3 text-left">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeSubTab === "invoices"
                ? "Search by student name, roll number, invoice number..."
                : "Search class fee structure by class name or fee component..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter */}
          {!isMyFees && setSelectedClassFilter && (
            <div className="relative">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="h-10 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
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
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
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
            <div className="relative">
              <select
                value={feeTypeFilter}
                onChange={(e) => setFeeTypeFilter(e.target.value)}
                className="h-10 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring capitalize"
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
            <div className="relative">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-10 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
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
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs h-10">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground font-medium flex items-center justify-between pt-1">
        <span>Showing {filteredCount} matching records</span>
      </div>
    </div>
  );
};
