import React from "react";
import { Button } from "./Button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  UserCheck,
} from "lucide-react";

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  showPerPage?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  bordered?: boolean; // Column vertical borders
  hoverable?: boolean;
  emptyText?: string;
  emptyIcon?: React.ReactNode;
  pagination?: PaginationConfig;
  className?: string;
  onRowClick?: (row: T) => void;
  renderMobileCard?: (row: T, index: number) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  loading = false,
  bordered = true,
  hoverable = true,
  emptyText = "No matching records found",
  emptyIcon = <UserCheck className="h-8 w-8 opacity-30" />,
  pagination,
  className = "",
  onRowClick,
  renderMobileCard,
}: DataTableProps<T>) {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const totalItems = pagination?.totalItems ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  return (
    <div className={`w-full overflow-hidden flex flex-col ${className}`}>
      {/* 1. Mobile-First Cards View (Visible on mobile screens < md, No Horizontal Scroll) */}
      <div className="block md:hidden divide-y divide-border/60 w-full">
        {loading ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-semibold">Loading data...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              {emptyIcon}
              <p className="text-sm font-bold text-foreground">{emptyText}</p>
            </div>
          </div>
        ) : (
          data.map((row, idx) => (
            <div
              key={rowKey(row, idx)}
              onClick={() => onRowClick && onRowClick(row)}
              className={`p-4 space-y-3 bg-card/60 transition-colors ${
                hoverable ? "hover:bg-muted/30" : ""
              } ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {renderMobileCard ? (
                renderMobileCard(row, idx)
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {columns.map((col, cIdx) => {
                    const isFullWidth = col.key === "teacher" || cIdx === columns.length - 1;
                    return (
                      <div
                        key={col.key}
                        className={`flex flex-col gap-1 ${
                          isFullWidth ? "col-span-2" : "col-span-1"
                        }`}
                      >
                        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                          {col.header}
                        </span>
                        <div className="text-xs sm:text-sm font-medium text-foreground">
                          {col.cell(row, idx)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 2. Desktop Table View (Visible on tablet & desktop screens md+) */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table
          className={`w-full text-left border-collapse ${bordered ? "border border-border/60" : ""
            }`}
        >
          <thead>
            <tr
              className={`border-b border-border/60 bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider ${bordered ? "divide-x divide-border/60" : ""
                }`}
            >
              {columns.map((col) => {
                const alignClass =
                  col.align === "center"
                    ? "text-center"
                    : col.align === "right"
                      ? "text-right"
                      : "text-left";
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-3 sm:px-6 py-3 sm:py-3.5 ${alignClass} ${bordered ? "border-r border-border/60" : ""
                      } ${col.headerClassName || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-semibold">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    {emptyIcon}
                    <p className="text-sm font-bold text-foreground">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey(row, idx)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`${hoverable ? "hover:bg-muted/30 transition-colors" : ""
                    } ${onRowClick ? "cursor-pointer" : ""} ${bordered ? "divide-x divide-border/60 border-b border-border/60" : ""
                    }`}
                >
                  {columns.map((col) => {
                    const alignClass =
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left";
                    return (
                      <td
                        key={col.key}
                        className={`px-3 sm:px-6 py-2.5 ${alignClass} ${bordered ? "border-r border-border/60" : ""
                          } ${col.cellClassName || ""}`}
                      >
                        {col.cell(row, idx)}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Clean & Modern Pagination Footer */}
      {pagination && totalItems > 0 && (
        <div className="px-3 sm:px-5 py-3 border-t border-border/60 bg-muted/20 flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-center">
            {/* First Page Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-xs font-semibold"
              disabled={page <= 1}
              onClick={() => pagination.onPageChange(1)}
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs font-semibold px-2 sm:px-3"
              disabled={page <= 1}
              onClick={() => pagination.onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1 px-0.5 sm:px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idxArr, arr) => {
                  const prev = arr[idxArr - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && (
                        <span className="px-1 text-xs text-muted-foreground select-none">...</span>
                      )}
                      <Button
                        variant={page === p ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 p-0 text-xs rounded-lg font-bold transition-all ${page === p
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "hover:bg-muted text-foreground"
                          }`}
                        onClick={() => pagination.onPageChange(p)}
                      >
                        {p}
                      </Button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs font-semibold px-2 sm:px-3"
              disabled={page >= totalPages}
              onClick={() => pagination.onPageChange(page + 1)}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>

            {/* Last Page Button */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg text-xs font-semibold"
              disabled={page >= totalPages}
              onClick={() => pagination.onPageChange(totalPages)}
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
