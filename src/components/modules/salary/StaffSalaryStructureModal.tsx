import React from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Users, X } from "lucide-react";
import { StaffSalaryStructureItem } from "../../../Services/salary.service";

interface StaffSalaryStructureModalProps {
  showStructModal: boolean;
  setShowStructModal: (show: boolean) => void;
  editingStruct?: StaffSalaryStructureItem | null;
  structFormData: any;
  setStructFormData?: (data: any) => void;
  teachers?: any[];
  handleSaveStruct?: () => void;
}

export const StaffSalaryStructureModal: React.FC<StaffSalaryStructureModalProps> = ({
  showStructModal,
  setShowStructModal,
  editingStruct,
  structFormData,
  setStructFormData,
  teachers = [],
  handleSaveStruct,
}) => {
  if (!showStructModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in text-left"
      onClick={() => setShowStructModal(false)}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg m-4 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {editingStruct ? "Edit Salary Structure" : "Configure Staff Salary Structure"}
          </h3>
          <button
            onClick={() => setShowStructModal(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Staff / Teacher</label>
              <select
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={structFormData.teacherId || ""}
                onChange={(e) =>
                  setStructFormData &&
                  setStructFormData({ ...structFormData, teacherId: e.target.value })
                }
              >
                <option value="">Select Staff Member</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Basic Salary (₹)</label>
              <Input
                type="number"
                value={structFormData.basicSalary || ""}
                onChange={(e) =>
                  setStructFormData &&
                  setStructFormData({ ...structFormData, basicSalary: e.target.value })
                }
                placeholder="e.g. 50000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">HRA (₹)</label>
              <Input
                type="number"
                value={structFormData.hra || ""}
                onChange={(e) =>
                  setStructFormData && setStructFormData({ ...structFormData, hra: e.target.value })
                }
                placeholder="e.g. 12500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">DA (₹)</label>
              <Input
                type="number"
                value={structFormData.da || ""}
                onChange={(e) =>
                  setStructFormData && setStructFormData({ ...structFormData, da: e.target.value })
                }
                placeholder="e.g. 5000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Other Allowance (₹)</label>
              <Input
                type="number"
                value={structFormData.otherAllowance || ""}
                onChange={(e) =>
                  setStructFormData &&
                  setStructFormData({ ...structFormData, otherAllowance: e.target.value })
                }
                placeholder="e.g. 2000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">PF Deduction (₹)</label>
              <Input
                type="number"
                value={structFormData.pfDeduction || ""}
                onChange={(e) =>
                  setStructFormData &&
                  setStructFormData({ ...structFormData, pfDeduction: e.target.value })
                }
                placeholder="e.g. 6000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">TDS / Tax Deduction (₹)</label>
              <Input
                type="number"
                value={structFormData.taxDeduction || ""}
                onChange={(e) =>
                  setStructFormData &&
                  setStructFormData({ ...structFormData, taxDeduction: e.target.value })
                }
                placeholder="e.g. 2500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Effective Date</label>
              <Input
                type="date"
                value={structFormData.effectiveFrom || ""}
                onChange={(e) =>
                  setStructFormData &&
                  setStructFormData({ ...structFormData, effectiveFrom: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-border flex justify-end gap-2.5">
          <Button variant="outline" onClick={() => setShowStructModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveStruct}>
            {editingStruct ? "Update Salary Setup" : "Save Salary Setup"}
          </Button>
        </div>
      </div>
    </div>
  );
};
