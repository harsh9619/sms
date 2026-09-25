import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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
  totalPages,
  setSelectedPayslip,
  handleOpenEditModal,
  handleDeleteSalary,
}) => {
  const getStatusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "processing") return <Clock className="h-4 w-4 text-primary" />;
    return <AlertCircle className="h-4 w-4 text-warning" />;
  };

  const getStatusBadgeVariant = (status: string): any => {
    if (status === "paid") return "success";
    if (status === "processing") return "default";
    return "warning";
  };

  return (
    <Card className="text-left">
      <CardHeader>
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Payroll Log Register
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-12">
            <Clock className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
            <p className="text-muted-foreground text-xs">Loading payroll registry...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                  {!isMySalary && <th className="px-6 py-3.5 text-left">Teacher / Staff Name</th>}
                  <th className="px-6 py-3.5 text-left">Period / Subject</th>
                  <th className="px-6 py-3.5 text-left">Basic Salary</th>
                  <th className="px-6 py-3.5 text-left">Allowances</th>
                  <th className="px-6 py-3.5 text-left">Deductions</th>
                  <th className="px-6 py-3.5 text-left">Net Salary</th>
                  <th className="px-6 py-3.5 text-left">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSalaries.map((s) => {
                  const net = (s.baseSalary || 0) + (s.allowances || 0) - (s.deductions || 0);
                  return (
                    <tr key={s.id} className="border-b hover:bg-muted/10 transition-colors">
                      {!isMySalary && (
                        <td className="px-6 py-4 font-bold text-foreground">
                          {s.teacherName || "Teacher"}
                          <div className="text-xs text-muted-foreground font-normal space-y-0.5 mt-0.5">
                            {s.teacherEmail && <div>{s.teacherEmail}</div>}
                            {s.teacherPhone && <div>Ph: {s.teacherPhone}</div>}
                            {s.subject && <div className="text-primary font-medium">{s.subject}</div>}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 font-bold">
                        {s.month} {s.year}
                        {isMySalary && s.subject && (
                          <span className="text-xs text-muted-foreground font-normal block">
                            {s.subject}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">₹{Number(s.baseSalary || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-success">
                        + ₹{Number(s.allowances || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-destructive">
                        - ₹{Number(s.deductions || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-black text-foreground">
                        ₹{net.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(s.status)}
                          <Badge variant={getStatusBadgeVariant(s.status)}>{s.status}</Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
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
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {salaries.length === 0 && (
              <div className="text-center py-16 text-muted-foreground/60 font-medium">
                No payroll logs recorded matching search criteria.
              </div>
            )}
          </div>
        )}

        {/* Pagination Toolbar */}
        {totalSalariesCount > 0 && (
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
