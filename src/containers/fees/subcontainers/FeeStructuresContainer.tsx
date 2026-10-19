import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import feeService, { ClassFeeStructureItem } from "../../../Services/fee.service";
import {
  ALL_CLASS_OPTIONS,
  FEE_PRESET_TEMPLATES,
  PRIMARY_CLASS_IDS,
  SECONDARY_CLASS_IDS,
} from "../../../constants/fee";
import { FeesToolbar } from "../../../components/modules/fees/FeesToolbar";
import { ClassFeeStructuresTable } from "../../../components/modules/fees/ClassFeeStructuresTable";
import { ClassFeeStructureModal } from "../../../components/modules/fees/ClassFeeStructureModal";

export interface FeeStructuresContainerProps {
  schoolId: string;
  classes?: any[];
  showAddStructModalTrigger?: number;
  setShowGenerateModal?: (show: boolean) => void;
  onStructuresUpdated?: (structures: ClassFeeStructureItem[]) => void;
}

export const FeeStructuresContainer: React.FC<FeeStructuresContainerProps> = ({
  schoolId,
  classes = [],
  showAddStructModalTrigger,
  setShowGenerateModal,
  onStructuresUpdated,
}) => {
  const [classFeeStructures, setClassFeeStructures] = useState<ClassFeeStructureItem[]>([]);
  const [showStructModal, setShowStructModal] = useState(false);
  const [editingStruct, setEditingStruct] = useState<ClassFeeStructureItem | null>(null);
  const [structFormData, setStructFormData] = useState<any>({});

  // Toolbar & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [feeTypeFilter, setFeeTypeFilter] = useState("all");
  const [selectedClassFilter, setSelectedClassFilter] = useState("all");

  // Pagination state
  const [structPage, setStructPage] = useState(1);
  const [structPageSize, setStructPageSize] = useState(10);

  const fetchClassFeeStructures = useCallback(async () => {
    try {
      const data = await feeService.getClassFeeStructures(schoolId);
      if (Array.isArray(data)) {
        setClassFeeStructures(data);
        if (onStructuresUpdated) onStructuresUpdated(data);
      }
    } catch (err) {
      console.error("Failed to fetch class fee structures:", err);
    }
  }, [schoolId, onStructuresUpdated]);

  useEffect(() => {
    fetchClassFeeStructures();
  }, [fetchClassFeeStructures]);

  // Trigger modal open from Header
  useEffect(() => {
    if (showAddStructModalTrigger && showAddStructModalTrigger > 0) {
      handleOpenAddStructModal();
    }
  }, [showAddStructModalTrigger]);

  const handleOpenAddStructModal = useCallback(() => {
    setEditingStruct(null);
    setStructFormData({
      classMasterId: "3",
      classMasterIds: ["3", "4"], // Default Class 1 and Class 2 selected
      feeName: "",
      feeType: "tuition",
      amount: "",
      frequency: "monthly",
      dueDay: 10,
      month: "all",
      isMandatory: true,
      description: "",
    });
    setShowStructModal(true);
  }, []);

  const handleOpenEditStructModal = useCallback((item: ClassFeeStructureItem) => {
    setEditingStruct(item);
    setStructFormData({
      ...item,
      classMasterIds: [String(item.classMasterId)],
    });
    setShowStructModal(true);
  }, []);

  const handleSaveStruct = useCallback(async () => {
    if (!structFormData.feeName || !structFormData.amount) {
      toast.error("Fee Name and Amount are required!");
      return;
    }

    const selectedIds =
      structFormData.classMasterIds && structFormData.classMasterIds.length > 0
        ? structFormData.classMasterIds
        : structFormData.classMasterId
          ? [String(structFormData.classMasterId)]
          : [];

    if (selectedIds.length === 0) {
      toast.error("Please select at least one Class Grade!");
      return;
    }

    try {
      if (editingStruct) {
        await feeService.saveClassFeeStructure(schoolId, {
          ...structFormData,
          id: editingStruct.id,
          classMasterId: selectedIds[0],
          amount: Number(structFormData.amount || 0),
          dueDay: Number(structFormData.dueDay || 10),
        });
        toast.success("Class fee structure updated");
      } else {
        await feeService.saveClassFeeStructure(schoolId, {
          ...structFormData,
          classMasterIds: selectedIds.map(Number),
          classMasterId: selectedIds[0],
          amount: Number(structFormData.amount || 0),
          dueDay: Number(structFormData.dueDay || 10),
        });
        toast.success(`Class fee structure created for ${selectedIds.length} class(es)`);
      }
      setShowStructModal(false);
      fetchClassFeeStructures();
    } catch (err) {
      toast.error("Failed to save class fee structure");
    }
  }, [schoolId, structFormData, editingStruct, fetchClassFeeStructures]);

  const handleDeleteStruct = useCallback(
    async (id: string) => {
      if (window.confirm("Delete this class fee component?")) {
        try {
          await feeService.deleteClassFeeStructure(schoolId, id);
          toast.info("Class fee structure component deleted");
          fetchClassFeeStructures();
        } catch (err) {
          toast.error("Failed to delete component");
        }
      }
    },
    [schoolId, fetchClassFeeStructures]
  );

  // Multi-class selection helpers
  const selectedClassIds: string[] = useMemo(() => {
    if (Array.isArray(structFormData.classMasterIds)) {
      return structFormData.classMasterIds.map(String);
    }
    if (structFormData.classMasterId) {
      return [String(structFormData.classMasterId)];
    }
    return [];
  }, [structFormData.classMasterIds, structFormData.classMasterId]);

  const handleToggleClassId = (clsId: string) => {
    let nextIds: string[];
    if (selectedClassIds.includes(clsId)) {
      nextIds = selectedClassIds.filter((id) => id !== clsId);
    } else {
      nextIds = [...selectedClassIds, clsId];
    }
    setStructFormData({
      ...structFormData,
      classMasterIds: nextIds,
      classMasterId: nextIds[0] || "",
    });
  };

  const handleQuickSelectClasses = (type: "all" | "primary" | "secondary" | "none") => {
    let nextIds: string[] = [];
    if (type === "all") {
      nextIds = ALL_CLASS_OPTIONS.map((c) => c.id);
    } else if (type === "primary") {
      nextIds = [...PRIMARY_CLASS_IDS];
    } else if (type === "secondary") {
      nextIds = [...SECONDARY_CLASS_IDS];
    } else if (type === "none") {
      nextIds = [];
    }
    setStructFormData({
      ...structFormData,
      classMasterIds: nextIds,
      classMasterId: nextIds[0] || "",
    });
  };

  const handleApplyPresetTemplate = (preset: (typeof FEE_PRESET_TEMPLATES)[0]) => {
    setStructFormData({
      ...structFormData,
      feeName: preset.name,
      feeType: preset.feeType,
      amount: preset.amount,
      frequency: preset.frequency,
      month: preset.month,
      description: preset.description,
    });
  };

  const summaryDetails = useMemo(() => {
    const classCount = selectedClassIds.length;
    const amountNum = Number(structFormData.amount || 0);
    const monthVal = structFormData.month || "all";
    const freqVal = structFormData.frequency || "monthly";

    let timesPerYear = 1;
    if (monthVal === "all") {
      if (freqVal === "monthly") timesPerYear = 12;
      else if (freqVal === "quarterly") timesPerYear = 4;
      else timesPerYear = 1;
    } else if (monthVal === "anytime" || monthVal === "any_time") {
      timesPerYear = 1;
    } else {
      timesPerYear = 1;
    }

    const totalAnnualStudent = amountNum * timesPerYear;
    return {
      classCount,
      amountNum,
      monthVal,
      freqVal,
      totalAnnualStudent,
    };
  }, [selectedClassIds, structFormData]);

  // Filtered structures computation
  const filteredClassFeeStructures = useMemo(() => {
    return classFeeStructures.filter((struct) => {
      const matchesSearch =
        !searchQuery ||
        (struct.feeName && struct.feeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (struct.className && struct.className.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = feeTypeFilter === "all" || struct.feeType === feeTypeFilter;
      const matchesClass =
        selectedClassFilter === "all" ||
        (struct.className && struct.className.toLowerCase().includes(selectedClassFilter.toLowerCase())) ||
        String(struct.classMasterId) === selectedClassFilter;

      return matchesSearch && matchesType && matchesClass;
    });
  }, [classFeeStructures, searchQuery, feeTypeFilter, selectedClassFilter]);

  const totalStructsCount = filteredClassFeeStructures.length;
  const totalStructPages = Math.max(1, Math.ceil(totalStructsCount / structPageSize));

  const paginatedStructs = useMemo(() => {
    const start = (structPage - 1) * structPageSize;
    return filteredClassFeeStructures.slice(start, start + structPageSize);
  }, [filteredClassFeeStructures, structPage, structPageSize]);

  // Class list for filter dropdown
  const availableClassesList = useMemo(() => {
    const classMap = new Map<string, string>();
    classes.forEach((c: any) => {
      const name = c.name || c.className;
      if (name) {
        const clean = String(name).split("-")[0].trim();
        classMap.set(clean, clean);
      }
    });
    classFeeStructures.forEach((s) => {
      if (s.className) {
        const clean = String(s.className).split("-")[0].trim();
        classMap.set(clean, clean);
      }
    });
    return Array.from(classMap.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    );
  }, [classes, classFeeStructures]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search & Filters Toolbar */}
      <FeesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        feeTypeFilter={feeTypeFilter}
        setFeeTypeFilter={setFeeTypeFilter}
        selectedClassFilter={selectedClassFilter}
        setSelectedClassFilter={setSelectedClassFilter}
        availableClasses={availableClassesList}
        classes={classes}
        activeSubTab="structures"
        filteredCount={filteredClassFeeStructures.length}
      />

      {/* Class Fee Structures Table */}
      <ClassFeeStructuresTable
        classFeeStructures={classFeeStructures}
        paginatedStructs={paginatedStructs}
        setShowGenerateModal={setShowGenerateModal}
        handleOpenEditStructModal={handleOpenEditStructModal}
        handleDeleteStruct={handleDeleteStruct}
        structPage={structPage}
        setStructPage={setStructPage}
        structTotalPages={totalStructPages}
        totalStructCount={totalStructsCount}
      />

      {/* Configure Class Fee Modal */}
      {showStructModal && (
        <ClassFeeStructureModal
          showStructModal={showStructModal}
          setShowStructModal={setShowStructModal}
          editingStruct={editingStruct}
          structFormData={structFormData}
          setStructFormData={setStructFormData}
          selectedClassIds={selectedClassIds}
          handleToggleClassId={handleToggleClassId}
          handleQuickSelectClasses={handleQuickSelectClasses}
          handleApplyPresetTemplate={handleApplyPresetTemplate}
          handleSaveStruct={handleSaveStruct}
          summaryDetails={summaryDetails}
        />
      )}
    </div>
  );
};

export default FeeStructuresContainer;
