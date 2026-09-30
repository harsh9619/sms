import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { DataTable, ColumnDef } from "../../ui/DataTable";
import { Layers, Sparkles, Edit, Trash2 } from "lucide-react";
import { ClassFeeStructureItem } from "../../../Services/fee.service";

interface ClassFeeStructuresTableProps {
  classFeeStructures: ClassFeeStructureItem[];
  paginatedStructs: ClassFeeStructureItem[];
  setShowGenerateModal?: (show: boolean) => void;
  handleOpenEditStructModal?: (item: ClassFeeStructureItem) => void;
  handleDeleteStruct?: (id: string) => void;
  structPage: number;
  setStructPage: (page: number) => void;
  structTotalPages: number;
  totalStructCount: number;
}

export const ClassFeeStructuresTable: React.FC<ClassFeeStructuresTableProps> = ({
  classFeeStructures,
  paginatedStructs,
  setShowGenerateModal,
  handleOpenEditStructModal,
  handleDeleteStruct,
  structPage,
  setStructPage,
  totalStructCount,
}) => {
  const columns: ColumnDef<ClassFeeStructureItem>[] = [
    {
      key: "classGrade",
      header: "Class Grade",
      cell: (struct) => (
        <span className="font-bold text-foreground">
          {struct.className || `Class ${struct.classMasterId}`}
        </span>
      ),
    },
    {
      key: "feeName",
      header: "Fee Component Name",
      cell: (struct) => (
        <div>
          <span className="font-semibold text-foreground">{struct.feeName}</span>
          {struct.description && (
            <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
              {struct.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "feeType",
      header: "Fee Type",
      cell: (struct) => <Badge variant="secondary" className="capitalize text-xs">{struct.feeType}</Badge>,
    },
    {
      key: "month",
      header: "Applicable Month",
      cell: (struct) => (
        <Badge variant="outline" className="capitalize font-bold text-primary border-primary/30 text-xs">
          {struct.month === "all" || !struct.month ? "Every Month" : struct.month}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount (₹)",
      cell: (struct) => (
        <span className="font-black text-foreground">₹{Number(struct.amount).toLocaleString()}</span>
      ),
    },
    {
      key: "frequency",
      header: "Frequency",
      cell: (struct) => (
        <span className="capitalize text-xs font-semibold text-muted-foreground">
          {struct.frequency}
        </span>
      ),
    },
    {
      key: "dueDay",
      header: "Due Day",
      cell: (struct) => (
        <span className="text-xs font-semibold text-muted-foreground">
          Day {struct.dueDay} of month
        </span>
      ),
    },
    {
      key: "isMandatory",
      header: "Mandatory",
      cell: (struct) => (
        <Badge variant={struct.isMandatory ? "success" : "warning"} className="text-xs">
          {struct.isMandatory ? "Mandatory" : "Optional"}
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
          <Layers className="h-5 w-5 text-primary" />
          Class-Wise Master Fee Structures
        </CardTitle>
        {setShowGenerateModal && (
          <Button size="sm" variant="outline" onClick={() => setShowGenerateModal(true)}>
            <Sparkles className="h-4 w-4 mr-2 text-primary" /> Auto-Generate Invoices
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          data={paginatedStructs}
          columns={columns}
          rowKey={(struct) => String(struct.id)}
          bordered={true}
          emptyText="No class fee structures configured."
          emptyIcon={<Layers className="h-8 w-8 opacity-30 text-muted-foreground" />}
          renderMobileCard={(struct) => (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    {struct.className || `Class ${struct.classMasterId}`}
                  </span>
                  <span className="font-semibold text-xs text-primary">{struct.feeName}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={struct.isMandatory ? "success" : "warning"} className="text-[10px]">
                    {struct.isMandatory ? "Mandatory" : "Optional"}
                  </Badge>
                  <Badge variant="secondary" className="capitalize text-[10px]">
                    {struct.feeType}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/30 p-2.5 rounded-xl border border-border/40">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Amount
                  </span>
                  <span className="font-black text-foreground text-sm">
                    ₹{Number(struct.amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider block">
                    Applicable Month
                  </span>
                  <span className="font-bold text-primary text-xs">
                    {struct.month === "all" || !struct.month ? "Every Month" : struct.month}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
                <span className="text-muted-foreground text-[11px] font-medium">
                  {struct.frequency} • Day {struct.dueDay} of month
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
