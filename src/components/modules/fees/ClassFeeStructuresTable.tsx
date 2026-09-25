import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  Layers,
  Sparkles,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
  structTotalPages,
  totalStructCount,
}) => {
  return (
    <Card className="text-left">
      <CardHeader className="flex flex-row items-center justify-between">
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground font-semibold">
                <th className="px-6 py-3.5 text-left">Class Grade</th>
                <th className="px-6 py-3.5 text-left">Fee Component Name</th>
                <th className="px-6 py-3.5 text-left">Fee Type</th>
                <th className="px-6 py-3.5 text-left">Applicable Month</th>
                <th className="px-6 py-3.5 text-left">Amount (₹)</th>
                <th className="px-6 py-3.5 text-left">Frequency</th>
                <th className="px-6 py-3.5 text-left">Due Day</th>
                <th className="px-6 py-3.5 text-left">Mandatory</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStructs.map((struct) => (
                <tr key={struct.id} className="border-b hover:bg-muted/10 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">
                    {struct.className || `Class ${struct.classMasterId}`}
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">
                    {struct.feeName}
                    {struct.description && (
                      <p className="text-[10px] text-muted-foreground font-normal mt-0.5">
                        {struct.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <Badge variant="secondary">{struct.feeType}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                    <Badge variant="outline" className="capitalize font-bold text-primary border-primary/30">
                      {struct.month === "all" || !struct.month ? "Every Month" : struct.month}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-black">₹{Number(struct.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 capitalize text-xs font-semibold text-muted-foreground">
                    {struct.frequency}
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                    Day {struct.dueDay} of month
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={struct.isMandatory ? "success" : "warning"}>
                      {struct.isMandatory ? "Mandatory" : "Optional"}
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
          {classFeeStructures.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/60 font-medium">
              No class fee structures configured. Click "Configure Class Fee" above to create one.
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
