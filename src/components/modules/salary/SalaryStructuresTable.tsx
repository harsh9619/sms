import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  Users,
  Sparkles,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { StaffSalaryStructureItem } from "../../../Services/salary.service";

interface SalaryStructuresTableProps {
  salaryStructures: StaffSalaryStructureItem[];
  paginatedStructs: StaffSalaryStructureItem[];
  setShowPayrollModal?: (show: boolean) => void;
  handleOpenEditStructModal?: (item: StaffSalaryStructureItem) => void;
  handleDeleteStruct?: (id: string) => void;
  structPage: number;
  setStructPage: (page: number) => void;
  structTotalPages: number;
  totalStructCount: number;
}

export const SalaryStructuresTable: React.FC<SalaryStructuresTableProps> = ({
  salaryStructures,
  paginatedStructs,
  setShowPayrollModal,
  handleOpenEditStructModal,
  handleDeleteStruct,
  structPage,
  setStructPage,
  structTotalPages,
  totalStructCount,
}) => {
  return (
    <Card className="text-left">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Master Staff Salary Structures
        </CardTitle>
        {setShowPayrollModal && (
          <Button size="sm" variant="outline" onClick={() => setShowPayrollModal(true)}>
            <Sparkles className="h-4 w-4 mr-2 text-primary" /> Generate Monthly Payroll
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="px-6 py-3.5 text-left">Staff Name & Contact</th>
                <th className="px-6 py-3.5 text-left">Basic Pay</th>
                <th className="px-6 py-3.5 text-left">HRA + DA</th>
                <th className="px-6 py-3.5 text-left">Other Allow.</th>
                <th className="px-6 py-3.5 text-left">Deductions (PF+Tax)</th>
                <th className="px-6 py-3.5 text-left">Gross Salary</th>
                <th className="px-6 py-3.5 text-left">Net Monthly Pay</th>
                <th className="px-6 py-3.5 text-left">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStructs.map((struct) => (
                <tr key={struct.id} className="border-b hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {struct.teacherName || "Staff Member"}
                    <div className="text-xs text-muted-foreground font-normal space-y-0.5 mt-0.5">
                      {struct.email && <div>{struct.email}</div>}
                      {struct.phone && <div>Ph: {struct.phone}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">₹{Number(struct.basicSalary).toLocaleString()}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-success">
                    + ₹{(Number(struct.hra || 0) + Number(struct.da || 0)).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-success">
                    + ₹{Number(struct.otherAllowance || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-destructive">
                    - ₹{(Number(struct.pfDeduction || 0) + Number(struct.taxDeduction || 0)).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold">₹{Number(struct.grossSalary || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 font-black text-primary">
                    ₹{Number(struct.netSalary || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={struct.isActive ? "success" : "secondary"}>
                      {struct.isActive ? "Active Structure" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {handleOpenEditStructModal && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditStructModal(struct)}
                          className="hover:text-primary h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {handleDeleteStruct && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStruct(struct.id)}
                          className="hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {salaryStructures.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/60 font-medium">
              No staff salary structures configured yet. Click "Configure Salary Structure" above to add one.
            </div>
          )}
        </div>

        {/* Structure Pagination Toolbar */}
        {totalStructCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-t border-border/60 bg-card rounded-b-xl">
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={structPage <= 1}
                onClick={() => setStructPage(1)}
                title="First Page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={structPage <= 1}
                onClick={() => setStructPage(structPage - 1)}
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-semibold px-2">
                Page {structPage} of {structTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={structPage >= structTotalPages}
                onClick={() => setStructPage(structPage + 1)}
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2"
                disabled={structPage >= structTotalPages}
                onClick={() => setStructPage(structTotalPages)}
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
