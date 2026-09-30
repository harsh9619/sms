import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import {
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import type { SalaryRecord } from "../../../types";
import salaryService from "../../../Services/salary.service";

interface SalaryRecordsTableProps {
  salaries: SalaryRecord[];
  loading?: boolean;
  isMySalary?: boolean;
  totalSalariesCount: number;
  paginatedSalaries: SalaryRecord[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  setSelectedPayslip?: (sal: SalaryRecord | null) => void;
  handleOpenEditModal?: (sal: SalaryRecord) => void;
  handleDeleteSalary?: (id: string) => void;
}

export const SalaryRecordsTable: React.FC<SalaryRecordsTableProps> = ({
  salaries,
  loading = false,
  isMySalary = false,
  totalSalariesCount,
  paginatedSalaries,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  handleOpenEditModal,
  handleDeleteSalary,
}) => {
  const getStatusIcon = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (s === "processing") return <Clock className="h-4 w-4 text-primary animate-spin" />;
    return <AlertCircle className="h-4 w-4 text-amber-500" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return "success";
    if (s === "processing") return "default";
    return "warning";
  };

  const columns: ColumnDef<SalaryRecord>[] = [
    ...(!isMySalary
      ? [
          {
            key: "teacherName",
            header: "Teacher / Staff Name",
            cell: (s: SalaryRecord) => (
              <div>
                <span className="font-bold text-foreground block">{s.teacherName || "Teacher"}</span>
                <div className="text-xs text-muted-foreground font-normal space-y-0.5 mt-0.5">
                  {s.teacherEmail && <div>{s.teacherEmail}</div>}
                  {s.teacherPhone && <div>Ph: {s.teacherPhone}</div>}
                  {s.subject && <div className="text-primary font-medium">{s.subject}</div>}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "period",
      header: "Period / Subject",
      cell: (s: SalaryRecord) => (
        <div>
          <span className="font-bold text-foreground">
            {s.month} {s.year}
          </span>
          {isMySalary && s.subject && (
            <span className="text-xs text-muted-foreground font-normal block">{s.subject}</span>
          )}
        </div>
      ),
    },
    {
      key: "baseSalary",
      header: "Basic Salary",
      cell: (s: SalaryRecord) => (
        <span className="font-semibold text-foreground">
          ₹{Number(s.baseSalary || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "allowances",
      header: "Allowances",
      cell: (s: SalaryRecord) => (
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
          + ₹{Number(s.allowances || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "deductions",
      header: "Deductions",
      cell: (s: SalaryRecord) => (
        <span className="text-rose-600 dark:text-rose-400 font-semibold text-xs">
          - ₹{Number(s.deductions || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "netSalary",
      header: "Net Salary",
      cell: (s: SalaryRecord) => {
        const net = (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0);
        return <span className="font-black text-foreground text-sm">₹{net.toLocaleString()}</span>;
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (s: SalaryRecord) => (
        <div className="flex items-center gap-1.5">
          {getStatusIcon(s.status)}
          <Badge variant={getStatusBadgeVariant(s.status)} className="capitalize text-xs">
            {s.status}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (s: SalaryRecord) => (
        <div className="flex items-center justify-end gap-1">
          {s?.status?.toLowerCase() === "paid" && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-8 w-8"
              onClick={() => salaryService.downloadSalarySlipPdf(s.id, s)}
              title="Download Salary Slip PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {!isMySalary && s?.status?.toLowerCase() !== "paid" && (
            <>
              {handleOpenEditModal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEditModal(s)}
                  className="hover:text-primary h-8 w-8"
                  title="Edit Payroll Record"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {handleDeleteSalary && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteSalary(s.id)}
                  className="hover:text-destructive h-8 w-8"
                  title="Delete Payroll Record"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="text-left border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="p-4 bg-card border-b border-border/60">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Payroll Log Register
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={paginatedSalaries}
          columns={columns}
          rowKey={(s) => String(s.id)}
          loading={loading}
          bordered={true}
          emptyText="No payroll logs recorded matching search criteria."
          emptyIcon={<Receipt className="h-8 w-8 opacity-30 text-muted-foreground" />}
          renderMobileCard={(s) => {
            const net = (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0);
            return (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    {!isMySalary && (
                      <span className="font-bold text-sm text-foreground block">
                        {s.teacherName || "Teacher"}
                      </span>
                    )}
                    <span className="font-bold text-xs text-primary">
                      {s.month} {s.year} {s.subject ? `• ${s.subject}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {getStatusIcon(s.status)}
                    <Badge variant={getStatusBadgeVariant(s.status)} className="capitalize text-[11px]">
                      {s.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/40">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      Basic Salary
                    </span>
                    <span className="font-bold text-foreground">
                      ₹{Number(s.baseSalary || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      Net Salary
                    </span>
                    <span className="font-black text-foreground text-sm">₹{net.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      Allowances
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      + ₹{Number(s.allowances || 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                      Deductions
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      - ₹{Number(s.deductions || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground text-[11px] font-medium truncate max-w-[200px]">
                    {s.teacherEmail || s.teacherPhone || "Salary Log"}
                  </span>
                  <div className="flex items-center gap-1">
                    {s?.status?.toLowerCase() === "paid" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          salaryService.downloadSalarySlipPdf(s.id, s);
                        }}
                        title="Download Slip"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {!isMySalary && s?.status?.toLowerCase() !== "paid" && (
                      <>
                        {handleOpenEditModal && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(s);
                            }}
                            className="hover:text-primary h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {handleDeleteSalary && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSalary(s.id);
                            }}
                            className="hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          }}
          pagination={{
            page: currentPage,
            limit: pageSize,
            totalItems: totalSalariesCount,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize,
            showPerPage: true,
          }}
        />
      </CardContent>
    </Card>
  );
};
