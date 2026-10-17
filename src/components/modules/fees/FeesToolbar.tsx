import React from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Search, Filter, RefreshCw, X, Calendar } from "lucide-react";

import { MONTH_NAMES_MAP } from "../../../constants/fee";

const MONTH_LABEL_MAP = MONTH_NAMES_MAP;

interface FeesToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter?: string;
  setStatusFilter?: (val: string) => void;
  feeTypeFilter?: string;
  setFeeTypeFilter?: (val: string) => void;
  monthFilter?: string;
  setMonthFilter?: (val: string) => void;
  sessionFilter?: string;
  setSessionFilter?: (val: string) => void;
  selectedClassFilter?: string;
  setSelectedClassFilter?: (val: string) => void;
  selectedDivisionFilter?: string;
  setSelectedDivisionFilter?: (val: string) => void;
  availableClasses?: string[];
  availableDivisions?: string[];
  classes?: any[];
  isMyFees?: boolean;
  activeSubTab?: "invoices" | "schedules" | "structures" | "analytics";
  filteredCount: number;
}

export const FeesToolbar: React.FC<FeesToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter = "all",
  setStatusFilter,
  feeTypeFilter = "all",
  setFeeTypeFilter,
  monthFilter = "all",
  setMonthFilter,
  sessionFilter = "all",
  setSessionFilter,
  selectedClassFilter = "all",
  setSelectedClassFilter,
  selectedDivisionFilter = "all",
  setSelectedDivisionFilter,
  availableClasses = [],
  availableDivisions = [],
  classes = [],
  isMyFees = false,
  activeSubTab = "invoices",
  filteredCount,
}) => {
  const [showFilters, setShowFilters] = React.useState(true);

  // Fallback classes if availableClasses is empty
  const classList = React.useMemo(() => {
    if (availableClasses.length > 0) return availableClasses;
    const names = new Set<string>();
    classes.forEach((c) => {
      const n = (c.name || c.className || "").split("-")[0].trim();
      if (n) names.add(n);
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [availableClasses, classes]);

  // Fallback divisions dependent on selected class
  const divisionList = React.useMemo(() => {
    if (availableDivisions.length > 0) return availableDivisions;
    const divs = new Set<string>();
    classes.forEach((c) => {
      const cName = (c.name || c.className || "").split("-")[0].trim().toLowerCase();
      if (selectedClassFilter === "all" || cName === selectedClassFilter.toLowerCase()) {
        if (c.section) divs.add(String(c.section).trim());
        if (c.division) divs.add(String(c.division).trim());
        if (c.divisions && Array.isArray(c.divisions)) {
          c.divisions.forEach((d: any) => d.name && divs.add(String(d.name).trim()));
        }
      }
    });
    return Array.from(divs).filter(Boolean).sort();
  }, [availableDivisions, classes, selectedClassFilter]);

  const extraFiltersCount =
    (statusFilter !== "all" ? 1 : 0) +
    (feeTypeFilter !== "all" ? 1 : 0) +
    (monthFilter !== "all" ? 1 : 0) +
    (sessionFilter !== "all" ? 1 : 0) +
    (selectedClassFilter !== "all" ? 1 : 0) +
    (selectedDivisionFilter !== "all" ? 1 : 0);

  const hasActiveFilters =
    searchQuery !== "" ||
    statusFilter !== "all" ||
    feeTypeFilter !== "all" ||
    monthFilter !== "all" ||
    sessionFilter !== "all" ||
    selectedClassFilter !== "all" ||
    selectedDivisionFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    if (setStatusFilter) setStatusFilter("all");
    if (setFeeTypeFilter) setFeeTypeFilter("all");
    if (setMonthFilter) setMonthFilter("all");
    if (setSessionFilter) setSessionFilter("all");
    if (setSelectedClassFilter) setSelectedClassFilter("all");
    if (setSelectedDivisionFilter) setSelectedDivisionFilter("all");
  };

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-3 sm:p-4 space-y-2.5 sm:space-y-3 text-left shadow-xs">
      {/* Search Input & Action Controls Bar */}
      <div className="flex items-center gap-2">
        {/* Search Field */}
        <div className="relative flex-1">
          <Input
            placeholder={
              activeSubTab === "invoices"
                ? "Search student name, roll no, invoice..."
                : "Search fee structure components..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="w-full pl-9 pr-8 h-10 rounded-xl border-border bg-background/60 focus:bg-background transition-all text-xs shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted/80 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        {/* <Button
          variant={showFilters || extraFiltersCount > 0 ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-10 px-3 rounded-xl text-xs font-bold gap-1.5 shrink-0 transition-all ${extraFiltersCount > 0
            ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
            : ""
            }`}
          title="Toggle filters panel"
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {extraFiltersCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
              {extraFiltersCount}
            </span>
          )}
        </Button> */}

        {/* Reset Filters */}
        <Button
          variant="outline"
          size="sm"
          disabled={!hasActiveFilters}
          onClick={handleResetFilters}
          className="h-10 px-2.5 sm:px-3 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 shrink-0"
          title="Reset all filters"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      {/* 4 Main Filter Dropdowns: Class, Division (dependent on Class), Month, Status */}
      {showFilters && (
        <div className="pt-2 border-t border-border/60 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. Class Filter */}
            {!isMyFees && setSelectedClassFilter && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Class
                </label>
                <select
                  value={selectedClassFilter}
                  onChange={(e) => {
                    const newClass = e.target.value;
                    setSelectedClassFilter(newClass);
                    if (setSelectedDivisionFilter) setSelectedDivisionFilter("all");
                  }}
                  className="w-full h-9 px-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Classes</option>
                  {classList.map((clsName) => (
                    <option key={clsName} value={clsName}>
                      {clsName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Division Filter (Dependent on Class!) */}
            {!isMyFees && setSelectedDivisionFilter && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Division
                </label>
                <select
                  value={selectedDivisionFilter}
                  onChange={(e) => setSelectedDivisionFilter(e.target.value)}
                  disabled={divisionList.length === 0}
                  className="w-full h-9 px-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">
                    {selectedClassFilter === "all" ? "All Divisions" : `All Divisions`}
                  </option>
                  {divisionList.map((divName) => (
                    <option key={divName} value={divName}>
                      Division {divName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 3. Month Filter */}
            {activeSubTab === "invoices" && setMonthFilter && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Month
                </label>
                <select
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
                >
                  <option value="all">All Months</option>
                  <option value="04">April (Apr Start)</option>
                  <option value="05">May</option>
                  <option value="06">June</option>
                  <option value="07">July (Jul Start)</option>
                  <option value="08">August</option>
                  <option value="09">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                  <option value="01">January</option>
                  <option value="02">February</option>
                  <option value="03">March</option>
                </select>
              </div>
            )}

            {/* 4. Status Filter */}
            {activeSubTab === "invoices" && (
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter && setStatusFilter(e.target.value)}
                  className="w-full h-9 px-2.5 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs capitalize"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Chips & Summary */}
      {/* {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-primary" /> Active Filters:
          </span>

          {searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-primary/10 text-primary border-primary/20"
            >
              Search: &quot;{searchQuery}&quot;
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setSearchQuery("")}
              />
            </Badge>
          )}

          {sessionFilter !== "all" && setSessionFilter && (
            <Badge
              variant="secondary"
              className="gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
            >
              Session: {sessionFilter === "april" ? "April Start" : "July Start"}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-0.5"
                onClick={() => setSessionFilter("all")}
              />
            </Badge>
          )}

          {statusFilter !== "all" && setStatusFilter && (
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
              Month: {MONTH_LABEL_MAP[monthFilter] || monthFilter}
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
      )} */}
    </div>
  );
};
