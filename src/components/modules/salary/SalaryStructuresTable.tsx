import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import { Users, Sparkles, Edit, Trash2 } from "lucide-react";
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
  totalStructCount,
}) => {
  const columns: ColumnDef<StaffSalaryStructureItem>[] = [
    {
      key: "staffName",
      header: "Staff Name & Contact",
      cell: (struct) => (
        <div>
          <span className="font-bold text-foreground block">
            {struct.teacherName || "Staff Member"}
          </span>
          <div className="text-xs text-muted-foreground font-normal space-y-0.5 mt-0.5">
            {struct.email && <div>{struct.email}</div>}
            {struct.phone && <div>Ph: {struct.phone}</div>}
          </div>
        </div>
      ),
    },
    {
      key: "basicSalary",
      header: "Basic Pay",
      cell: (struct) => (
        <span className="font-semibold text-foreground">
          ₹{Number(struct.basicSalary).toLocaleString()}
        </span>
      ),
    },
    {
      key: "hraDa",
      header: "HRA + DA",
      cell: (struct) => (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          + ₹{(Number(struct.hra || 0) + Number(struct.da || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      key: "otherAllowance",
      header: "Other Allow.",
      cell: (struct) => (
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          + ₹{Number(struct.otherAllowance || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "deductions",
      header: "Deductions (PF+Tax)",
      cell: (struct) => (
        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
          - ₹{(Number(struct.pfDeduction || 0) + Number(struct.taxDeduction || 0)).toLocaleString()}
        </span>
      ),
    },
    {
      key: "grossSalary",
      header: "Gross Salary",
      cell: (struct) => (
        <span className="font-bold text-foreground">
          ₹{Number(struct.grossSalary || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "netSalary",
      header: "Net Monthly Pay",
      cell: (struct) => (
        <span className="font-black text-primary text-sm">
          ₹{Number(struct.netSalary || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      cell: (struct) => (
        <Badge variant={struct.isActive ? "success" : "secondary"} className="text-xs">
          {struct.isActive ? "Active Structure" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (struct) => (
        <div className="flex items-center justify-end gap-1">
          {handleOpenEditStructModal && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenEditStructModal(struct)}
              className="hover:text-primary h-8 w-8"
              title="Edit Structure"
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
              title="Delete Structure"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <Card className="text-left border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between bg-card border-b border-border/60">
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
        <DataTable
          data={paginatedStructs}
          columns={columns}
          rowKey={(struct) => String(struct.id)}
          bordered={true}
          emptyText="No staff salary structures configured yet."
          emptyIcon={<Users className="h-8 w-8 opacity-30 text-muted-foreground" />}
          renderMobileCard={(struct) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    {struct.teacherName || "Staff Member"}
                  </span>
                  <span className="text-xs text-muted-foreground">{struct.email || struct.phone || ""}</span>
                </div>
                <Badge variant={struct.isActive ? "success" : "secondary"} className="text-[10px] shrink-0">
                  {struct.isActive ? "Active Structure" : "Inactive"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Basic Pay
                  </span>
                  <span className="font-bold text-foreground">
                    ₹{Number(struct.basicSalary).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Net Monthly Pay
                  </span>
                  <span className="font-black text-primary text-sm">
                    ₹{Number(struct.netSalary || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    HRA + DA + Allow.
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    + ₹{(Number(struct.hra || 0) + Number(struct.da || 0) + Number(struct.otherAllowance || 0)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Deductions (PF+Tax)
                  </span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    - ₹{(Number(struct.pfDeduction || 0) + Number(struct.taxDeduction || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                <span className="text-muted-foreground font-semibold">
                  Gross: ₹{Number(struct.grossSalary || 0).toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  {handleOpenEditStructModal && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditStructModal(struct);
                      }}
                      className="hover:text-primary h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {handleDeleteStruct && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteStruct(struct.id);
                      }}
                      className="hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          pagination={{
            page: structPage,
            limit: 10,
            totalItems: totalStructCount,
            onPageChange: setStructPage,
            showPerPage: true,
          }}
        />
      </CardContent>
    </Card>
  );
};
