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

// Helpers for stylish color mapping
const getAvatarTheme = (name: string) => {
  const themes = [
    { bg: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30" },
    { bg: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
    { bg: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30" },
    { bg: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30" },
    { bg: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30" },
    { bg: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return themes[Math.abs(hash) % themes.length];
};

const parseRemarks = (remarks?: string) => {
  if (!remarks) return { installmentCover: null, breakdownItems: [] };

  const colonIdx = remarks.indexOf(":");
  const headerPart = colonIdx !== -1 ? remarks.slice(0, colonIdx).trim() : "";
  const bodyPart = colonIdx !== -1 ? remarks.slice(colonIdx + 1).trim() : remarks.trim();

  // Extract coverage from header like "(September)"
  const match = headerPart.match(/\(([^)]+)\)/);
  const coverage = match ? match[1] : null;

  // Split body by " + "
  const items = bodyPart
    ? bodyPart
      .split("+")
      .map((s) => s.trim())
      .filter(Boolean)
    : [];

  return { installmentCover: coverage, breakdownItems: items };
};

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
  const enablePayment = false
  // Aggregate ledger stats for header pills
  const stats = React.useMemo(() => {
    let paid = 0;
    let pending = 0;
    let overdue = 0;
    const list = fees && fees.length > 0 ? fees : paginatedFees;
    const todayStr = new Date().toISOString().split("T")[0];

    list.forEach((f) => {
      const isPastDue =
        f.isOverdue ||
        (f.status === "pending" && Boolean(f.dueDate && f.dueDate < todayStr));
      const s = (f.status || "").toLowerCase();
      if (s === "paid") paid++;
      else if (isPastDue) overdue++;
      else pending++;
    });

    return { paid, pending, overdue };
  }, [fees, paginatedFees]);

  const columns: ColumnDef<FeeRecord>[] = [
    ...(!isMyFees
      ? [
        {
          key: "studentName",
          header: "Student",
          cell: (fee: FeeRecord) => {
            const studentName = fee.studentName || "Student";
            const initials =
              studentName
                .split(" ")
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase() || "ST";

            const avatarTheme = getAvatarTheme(studentName);

            return (
              <div className="flex items-center gap-2.5 min-w-0 py-0.5">
                <div
                  className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border shadow-2xs ${avatarTheme.bg}`}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-foreground text-xs block truncate hover:text-primary transition-colors">
                    {studentName}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground font-medium mt-0.5">
                    {fee.class && (
                      <span className="text-foreground/90 font-semibold px-1.5 py-0.2 rounded bg-muted/60 text-[10px]">
                        {fee.class} {fee.section || ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          },
        },
      ]
      : []),
    {
      key: "feeType",
      header: "Installment & Breakdown",
      cell: (fee: FeeRecord) => {
        const { installmentCover, breakdownItems } = parseRemarks(fee.remarks);
        return (
          <div className="space-y-1.5 py-0.5 max-w-[340px]">
            <div className="flex items-center gap-2 flex-wrap">
              {fee.installmentName ? (<span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                {fee.installmentName || fee.month || "Current"} Installment
              </span>
              ) : (<span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                {fee.feeType?.charAt(0).toUpperCase() + fee.feeType?.slice(1)} Fees
              </span>
              )}

            </div>

            {breakdownItems.length > 0 ? (
              <div className="space-y-0.5 mt-1 pl-1.5 border-l-2 border-border/70">
                {breakdownItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                    <span className="truncate" title={item}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : fee.remarks ? (
              <p
                className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-tight"
                title={fee.remarks}
              >
                {fee.remarks}
              </p>
            ) : (
              <span className="text-[10px] text-muted-foreground italic"></span>
            )}
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      cell: (fee: FeeRecord) => {
        const isPaid = (fee.status || "").toLowerCase() === "paid";
        return (
          <div className="text-right py-0.5">
            <span className="font-black text-foreground text-sm tracking-tight block">
              ₹{Number(fee.amount || 0).toLocaleString("en-IN")}
            </span>
            <span
              className={`text-[10px] font-semibold block ${isPaid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                }`}
            >

            </span>
          </div>
        );
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      cell: (fee: FeeRecord) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const isPastDue =
          fee.isOverdue ||
          (fee.status === "pending" && Boolean(fee.dueDate && fee.dueDate < todayStr));
        const isPaid = (fee.status || "").toLowerCase() === "paid";

        return (
          <div className="py-0.5 space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-semibold ${isPastDue && !isPaid
                  ? "text-rose-600 dark:text-rose-400 font-bold"
                  : "text-foreground"
                  }`}
              >
                {formatOnlyDate(fee.dueDate)}
              </span>
            </div>
            {isPastDue && !isPaid && (
              <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                <AlertCircle className="h-3 w-3 shrink-0" />
                Past Due
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      cell: (fee: FeeRecord) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const isPastDue =
          fee.isOverdue ||
          (fee.status === "pending" && Boolean(fee.dueDate && fee.dueDate < todayStr));
        const statusKey = (fee.status || "").toLowerCase();

        if (statusKey === "paid") {
          return (
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Paid
              </span>
              {fee.paidDate && (
                <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                  <span>{formatOnlyDate(fee.paidDate)}</span>
                </div>
              )}
            </div>
          );
        }

        if (isPastDue) {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold shadow-2xs ">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Overdue
            </span>
          );
        }

        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-bold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (fee: FeeRecord) => {
        const isPaid = (fee?.status || "").toLowerCase() === "paid";

        return (
          <div className="flex items-center justify-end gap-1.5 py-0.5">
            {/* Download PDF / Receipt if paid */}
            {isPaid && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 rounded-lg text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 font-bold text-xs gap-1.5 transition-all shadow-2xs"
                onClick={() =>
                  handleViewReceipt
                    ? handleViewReceipt(fee)
                    : feeService.downloadFeeReceiptPdf(fee.id, fee, fees)
                }
                title="Download Receipt PDF"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Receipt</span>
              </Button>
            )}

            {/* Student Pay Now */}
            {isMyFees && !isPaid && setPayingFee && (

              <Button
                size="sm"
                disabled={!enablePayment}
                className="h-8 font-extrabold text-xs px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                onClick={() => setPayingFee(fee)}
                title={
                  !enablePayment
                    ? "Under Progress"
                    : undefined
                }
              >
                Pay Now
              </Button>
            )}



            {/* Admin Edit & Delete */}
            {!isMyFees && !isPaid && (
              <>
                {handleOpenEditModal && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenEditModal(fee)}
                    className="h-8 w-8 rounded-lg hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all shadow-2xs"
                    title="Edit Fee Record"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                )}
                {handleDeleteFee && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteFee(fee.id)}
                    className="h-8 w-8 rounded-lg hover:border-destructive/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shadow-2xs"
                    title="Delete Fee Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="text-left border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-5 bg-card border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 border border-primary/20 shadow-2xs">
            <Receipt className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-extrabold text-foreground tracking-tight">
                Fee Invoices Ledger
              </CardTitle>
              <Badge
                variant="outline"
                className="font-extrabold text-[11px] px-2 py-0.5 bg-muted/50 border-border text-foreground"
              >
                {totalFeesCount.toLocaleString("en-IN")} Invoices
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Real-time student billing and fee status ledger
            </p>
          </div>
        </div>


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
          renderMobileCard={(fee) => {
            const todayStr = new Date().toISOString().split("T")[0];
            const isPastDue =
              fee.isOverdue ||
              (fee.status === "pending" && Boolean(fee.dueDate && fee.dueDate < todayStr));
            const statusKey = (fee.status || "").toLowerCase();
            const isPaid = statusKey === "paid";
            const borderAccent = isPaid
              ? "border-l-4 border-l-emerald-500"
              : isPastDue
                ? "border-l-4 border-l-rose-500"
                : "border-l-4 border-l-amber-500";

            const studentName = fee.studentName || "Student";
            const initials =
              studentName
                .split(" ")
                .map((n) => n[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase() || "ST";

            const avatarTheme = getAvatarTheme(studentName);
            const { installmentCover, breakdownItems } = parseRemarks(fee.remarks);

            return (
              <div
                className={`p-4 rounded-2xl bg-card border border-border/70 shadow-sm space-y-3.5 transition-all ${borderAccent}`}
              >
                {/* 1. Header: Student Profile & Status Badge */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {!isMyFees && (
                      <div
                        className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border shadow-2xs ${avatarTheme.bg}`}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      {!isMyFees && (
                        <div className="font-bold text-sm text-foreground truncate">
                          {studentName}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground font-medium mt-0.5">
                        {fee.class && (
                          <span className="font-semibold text-foreground px-1.5 py-0.5 rounded-md bg-muted/80 text-[11px] border border-border/40">
                            {fee.class} {fee.section || ""}
                          </span>
                        )}
                        {fee.receiptNumber && isPaid && (
                          <span className="font-mono text-[10px] text-muted-foreground bg-muted/40 px-1 rounded border border-border/40">
                            #{fee.receiptNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>


                </div>

                {/* 2. Installment & Component Details */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      {fee.installmentName || fee.month || "Current"} Installment
                    </span>
                  </div>

                  {/* Breakdown items */}
                  {breakdownItems.length > 0 ? (
                    <div className="space-y-1 mt-1 pl-2 border-l-2 border-border/70">
                      {breakdownItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                          <span className="" title={item}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : fee.remarks ? (
                    <p className="text-[11px] text-muted-foreground font-medium ">
                      {fee.remarks}
                    </p>
                  ) : null}
                </div>

                {/* 3. Amount & Due Date FinTech Box */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                      {isPaid ? "Payment Date" : "Due Date"}
                    </span>
                    <span
                      className={`text-xs font-semibold block mt-0.5 ${isPastDue && !isPaid
                        ? "text-rose-600 dark:text-rose-400 font-bold"
                        : isPaid
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                        }`}
                    >
                      {isPaid && fee.paidDate
                        ? formatOnlyDate(fee.paidDate)
                        : formatOnlyDate(fee.dueDate)}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider block">
                      Amount
                    </span>
                    <span className="font-black text-foreground text-lg tracking-tight">
                      ₹{Number(fee.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* 4. Action Bar */}
                <div className="flex items-center justify-end pt-2 border-t border-border/40 gap-2">
                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 text-xs font-extrabold shadow-2xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        Paid
                      </span>
                    ) : isPastDue ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 px-2.5 py-1 text-xs font-extrabold shadow-2xs">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-2.5 py-1 text-xs font-extrabold shadow-2xs">
                        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Pending
                      </span>
                    )}
                  </div>
                  {/* Download PDF / Receipt if paid */}
                  {isPaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-bold gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 rounded-lg shadow-2xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewReceipt
                          ? handleViewReceipt(fee)
                          : feeService.downloadFeeReceiptPdf(fee.id, fee, fees);
                      }}
                      title="Download PDF Receipt"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Receipt</span>
                    </Button>
                  )}

                  {/* Student Pay Now */}
                  {isMyFees && !isPaid && setPayingFee && (
                    <Button
                      size="sm"
                      className="h-8 font-extrabold text-xs px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayingFee(fee);
                      }}
                    >
                      Pay Now
                    </Button>
                  )}

                  {/* Admin Edit & Delete */}
                  {!isMyFees && !isPaid && (
                    <div className="flex items-center gap-1.5">
                      {handleOpenEditModal && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditModal(fee);
                          }}
                          className="h-8 px-2.5 text-xs font-semibold gap-1.5 hover:border-primary/50 hover:bg-primary/5 hover:text-primary rounded-lg shadow-2xs"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </Button>
                      )}
                      {handleDeleteFee && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFee(fee.id);
                          }}
                          className="h-8 w-8 hover:border-destructive/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg shadow-2xs"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
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
