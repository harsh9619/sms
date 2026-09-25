import React from "react";
import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Search, RefreshCw } from "lucide-react";

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
    <div className="bg-card border border-border/80 rounded-xl p-4 space-y-3 text-left">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeSubTab === "registries"
                ? "Search payroll by teacher name, designation, month..."
                : "Search salary structures by staff name or designation..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeSubTab === "registries" && (
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 py-1.5 bg-background border border-input rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid / Disbursed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          )}

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
