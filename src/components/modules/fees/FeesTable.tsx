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
  FileText,
  Download,
  Edit,
  Trash2,
  Calendar,
  IndianRupee,
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import { formatOnlyDate } from "../../../lib/utils";
import feeService from "../../../Services/fee.service";

interface FeesTableProps {
  fees: FeeRecord[];
  loading?: boolean;
  isMyFees?: boolean;
  totalFeesCount: number;
  paginatedFees: FeeRecord[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  handleViewReceipt?: (fee: FeeRecord) => void;
  setPayingFee?: (fee: FeeRecord | null) => void;
  handleOpenEditModal?: (fee: FeeRecord) => void;
  handleDeleteFee?: (id: string) => void;
}

export const FeesTable: React.FC<FeesTableProps> = ({
  fees,
  loading = false,
  isMyFees = false,
  totalFeesCount,
  paginatedFees,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  handleViewReceipt,
  setPayingFee,
  handleOpenEditModal,
  handleDeleteFee,
}) => {
  const getStatusIcon = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    if (s === "pending") return <Clock className="h-4 w-4 text-amber-500" />;
    return <AlertCircle className="h-4 w-4 text-rose-500" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    const s = (status || "").toLowerCase();
    if (s === "paid") return "success";
    if (s === "pending") return "warning";
    return "destructive";
  };

  const columns: ColumnDef<FeeRecord>[] = [
    ...(!isMyFees
      ? [
          {
            key: "studentName",
            header: "Student Name",
            cell: (fee: FeeRecord) => (
              <div>
                <span className="font-bold text-foreground block">{fee.studentName || "N/A"}</span>
                {fee.class && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {fee.class} {fee.section || ""}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "rollNumber",
            header: "Roll No",
            cell: (fee: FeeRecord) => (
              <span className="text-xs font-mono font-semibold text-muted-foreground">
                {fee.rollNumber || "-"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "feeType",
      header: "Fee Type",
      cell: (fee: FeeRecord) => (
        <div>
          <span className="font-bold text-foreground capitalize">{fee.feeType}</span>
          {fee.remarks && (
            <p className="text-[10px] text-muted-foreground font-normal mt-0.5">{fee.remarks}</p>
          )}
        </div>
      ),
    },
    {
      key: "month",
      header: "Billing Month",
      cell: (fee: FeeRecord) =>
        fee.month ? (
          <Badge
            variant="outline"
            className="font-bold text-primary border-primary/30 bg-primary/5 text-xs"
          >
            {fee.month}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: (fee: FeeRecord) => (
        <span className="font-black text-foreground text-sm">
          ₹{Number(fee.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (fee: FeeRecord) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {formatOnlyDate(fee.dueDate)}
        </span>
      ),
    },
    {
      key: "paidDate",
      header: "Payment Date",
      cell: (fee: FeeRecord) => (
        <span className="text-xs font-semibold text-muted-foreground">
          {formatOnlyDate(fee.paidDate)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (fee: FeeRecord) => (
        <div className="flex items-center gap-1.5">
          {getStatusIcon(fee.status)}
          <Badge variant={getStatusBadgeVariant(fee.status)} className="capitalize text-xs">
            {fee.status}
          </Badge>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (fee: FeeRecord) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="hover:text-primary h-8 w-8"
            onClick={() =>
              handleViewReceipt
                ? handleViewReceipt(fee)
                : feeService.downloadFeeReceiptPdf(fee.id, fee, fees)
            }
            title="View Interactive Fee Receipt"
          >
            <FileText className="h-4 w-4" />
          </Button>
          {fee?.status?.toLowerCase() === "paid" && (
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-primary h-8 w-8"
              onClick={() => feeService.downloadFeeReceiptPdf(fee.id, fee, fees)}
              title="Download Monthly Fee Receipt PDF"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {isMyFees && fee.status !== "paid" && setPayingFee && (
            <Button size="sm" className="h-8 font-semibold text-xs" onClick={() => setPayingFee(fee)}>
              Pay Now
            </Button>
          )}
          {isMyFees && fee.status === "paid" && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Settled
            </span>
          )}
          {!isMyFees && fee?.status?.toLowerCase() !== "paid" && (
            <>
              {handleOpenEditModal && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEditModal(fee)}
                  className="hover:text-primary h-8 w-8"
                  title="Edit Fee Record"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {handleDeleteFee && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFee(fee.id)}
                  className="hover:text-destructive h-8 w-8"
                  title="Delete Fee Record"
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
          Fee Invoices Ledger
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={paginatedFees}
          columns={columns}
          rowKey={(fee) => String(fee.id)}
          loading={loading}
          bordered={true}
          emptyText="No fee records found matching criteria."
          emptyIcon={<Receipt className="h-8 w-8 opacity-30 text-muted-foreground" />}
          renderMobileCard={(fee) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {!isMyFees && (
                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      {fee.studentName || "N/A"}
                      {fee.rollNumber && (
                        <span className="text-xs font-mono font-normal text-muted-foreground">
                          (#{fee.rollNumber})
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-extrabold text-sm text-foreground capitalize">
                      {fee.feeType}
                    </span>
                    {fee.month && (
                      <Badge
                        variant="outline"
                        className="font-bold text-primary border-primary/30 bg-primary/5 text-[10px]"
                      >
                        {fee.month}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {getStatusIcon(fee.status)}
                  <Badge variant={getStatusBadgeVariant(fee.status)} className="capitalize text-[11px]">
                    {fee.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Amount
                  </span>
                  <span className="font-black text-foreground text-sm">
                    ₹{Number(fee.amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Due Date
                  </span>
                  <span className="font-semibold text-muted-foreground">
                    {formatOnlyDate(fee.dueDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Paid: {formatOnlyDate(fee.paidDate) || "-"}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-primary h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewReceipt
                        ? handleViewReceipt(fee)
                        : feeService.downloadFeeReceiptPdf(fee.id, fee, fees);
                    }}
                    title="View Receipt"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  {fee?.status?.toLowerCase() === "paid" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-primary h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        feeService.downloadFeeReceiptPdf(fee.id, fee, fees);
                      }}
                      title="Download Receipt PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {isMyFees && fee.status !== "paid" && setPayingFee && (
                    <Button
                      size="sm"
                      className="h-8 font-semibold text-xs px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayingFee(fee);
                      }}
                    >
                      Pay Now
                    </Button>
                  )}
                  {!isMyFees && fee?.status?.toLowerCase() !== "paid" && (
                    <>
                      {handleOpenEditModal && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(fee);
                          }}
                          className="hover:text-primary h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {handleDeleteFee && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFee(fee.id);
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
          )}
          pagination={{
            page: currentPage,
            limit: pageSize,
            totalItems: totalFeesCount,
            onPageChange: setCurrentPage,
            onLimitChange: setPageSize,
            showPerPage: true,
          }}
        />
      </CardContent>
    </Card>
  );
};
