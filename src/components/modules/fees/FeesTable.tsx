import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  totalPages,
  handleViewReceipt,
  setPayingFee,
  handleOpenEditModal,
  handleDeleteFee,
}) => {
  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-warning" />;
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "pending") return "warning";
    return "destructive";
  };

  return (
    <Card className="text-left">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Fee Invoices Ledger
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground text-xs">Loading fee records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  {!isMyFees && <th className="px-6 py-3.5 text-left">Student Name</th>}
                  {!isMyFees && <th className="px-6 py-3.5 text-left">Roll No</th>}
                  <th className="px-6 py-3.5 text-left">Fee Type</th>
                  <th className="px-6 py-3.5 text-left">Billing Month</th>
                  <th className="px-6 py-3.5 text-left">Amount</th>
                  <th className="px-6 py-3.5 text-left">Due Date</th>
                  <th className="px-6 py-3.5 text-left">Payment Date</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFees.map((fee) => (
                  <tr key={fee.id} className="border-b hover:bg-muted/10 transition-colors">
                    {!isMyFees && (
                      <td className="px-6 py-4 font-bold text-foreground">
                        {fee.studentName || "N/A"}
                        {fee.class && (
                          <span className="text-xs text-muted-foreground font-normal block">
                            {fee.class} {fee.section || ""}
                          </span>
                        )}
                      </td>
                    )}
                    {!isMyFees && (
                      <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                        {fee.rollNumber || "-"}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="font-bold text-foreground capitalize">{fee.feeType}</span>
                      {fee.remarks && (
                        <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                          {fee.remarks}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      {fee.month ? (
                        <Badge
                          variant="outline"
                          className="font-bold text-primary border-primary/30 bg-primary/5"
                        >
                          {fee.month}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold">₹{Number(fee.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      {formatOnlyDate(fee.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                      {formatOnlyDate(fee.paidDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <Badge variant={getStatusBadgeVariant(fee.status)}>{fee.status}</Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
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
                          <Button
                            size="sm"
                            className="h-8 font-semibold"
                            onClick={() => setPayingFee(fee)}
                          >
                            Pay Now
                          </Button>
                        )}
                        {isMyFees && fee.status === "paid" && (
                          <span className="text-xs text-success font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> Settled
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
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fees.length === 0 && (
              <div className="text-center py-16 text-muted-foreground/60 font-medium">
                No fee records found matching criteria.
              </div>
            )}
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalFeesCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-t border-border/60 bg-card rounded-b-xl">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-semibold px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Last Page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
