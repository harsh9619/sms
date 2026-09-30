import React from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { Search, Filter, RefreshCw, X } from "lucide-react";

interface SalaryToolbarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  activeSubTab?: "registries" | "structures";
  filteredCount: number;
}

export const SalaryToolbar: React.FC<SalaryToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  activeSubTab = "registries",
  filteredCount,
}) => {
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <div className="bg-card border border-border/80 rounded-xl p-3.5 sm:p-4 space-y-3 text-left shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Input
            placeholder={
              activeSubTab === "registries"
                ? "Search payroll by teacher name, designation, month..."
                : "Search salary structures by staff name or designation..."
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
        <div className="flex items-center justify-between lg:justify-end gap-2.5 w-full lg:w-auto">
          {activeSubTab === "registries" && (
            <div className="relative flex-1 sm:flex-none">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-xs"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid / Disbursed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          )}

          {/* Reset Filters */}
          <Button
            variant="outline"
            size="sm"
            disabled={!hasActiveFilters}
            onClick={handleResetFilters}
            className="h-10 rounded-xl px-3 text-xs font-semibold hover:text-foreground gap-1.5 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
            title="Reset all filters"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
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

          <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
            Showing {filteredCount} matching records
          </span>
        </div>
      )}
    </div>
  );
};
