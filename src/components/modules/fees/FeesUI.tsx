import React from "react";
import { GraduationCap, FileText, CreditCard, Layers, Sparkles, DollarSign } from "lucide-react";
import { FeesUIProps, FEE_PRESET_TEMPLATES, ALL_CLASS_OPTIONS } from "./types";
import { FeesHeader } from "./FeesHeader";
import { FeesToolbar } from "./FeesToolbar";
import { FeesTable } from "./FeesTable";
import { ClassFeeStructuresTable } from "./ClassFeeStructuresTable";
import { ReceiptModal } from "./ReceiptModal";
import { CheckoutModal } from "./CheckoutModal";
import { AddEditFeeModal } from "./AddEditFeeModal";
import { ClassFeeStructureModal } from "./ClassFeeStructureModal";
import { GenerateInvoicesModal } from "./GenerateInvoicesModal";

export function FeesUI({
  fees,
  classFeeStructures = [],
  classes = [],
  students = [],
  loading = false,
  error,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  feeTypeFilter = "all",
  setFeeTypeFilter,
  monthFilter = "all",
  setMonthFilter,
  isMyFees = false,
  payingFee = null,
  setPayingFee,
  paymentMethod = "credit_card",
  setPaymentMethod,
  processing = false,
  handlePay,
  activeReceipt = null,
  setActiveReceipt,
  handleViewReceipt,
  showAddEditModal = false,
  setShowAddEditModal,
  editingFee = null,
  formData = {},
  setFormData,
  formError,
  handleSaveFee,
  handleDeleteFee,
  handleOpenAddModal,
  handleOpenEditModal,
  handleExportExcel,
  handleExportSummary,
  activeSubTab = "invoices",
  setActiveSubTab,
  showStructModal = false,
  setShowStructModal,
  editingStruct = null,
  structFormData = {},
  setStructFormData,
  handleSaveStruct,
  handleDeleteStruct,
  handleOpenAddStructModal,
  handleOpenEditStructModal,
  page: propsPage,
  setPage: setPropsPage,
  limit: propsLimit,
  setLimit: setPropsLimit,
  meta,
  showGenerateModal = false,
  setShowGenerateModal,
  generateClassId = "",
  setGenerateClassId,
  generateDueDate = "",
  setGenerateDueDate,
  generateMonth = new Date().toISOString().slice(0, 7),
  setGenerateMonth,
  handleGenerateInvoices,
  isGenerating = false,
}: FeesUIProps) {
  const [selectedClassFilter, setSelectedClassFilter] = React.useState<string>("all");

  // Compute all fee items to be paid together for checkout modal
  const payingFeeItems = React.useMemo(() => {
    if (!payingFee) return [];
    if (Array.isArray((payingFee as any).feeIds) && (payingFee as any).feeIds.length > 0) {
      return fees.filter((f) => (payingFee as any).feeIds.map(String).includes(String(f.id)));
    }
    if (Array.isArray((payingFee as any).selectedMonths) && (payingFee as any).selectedMonths.length > 0) {
      return fees.filter(
        (f) =>
          String(f.studentId) === String(payingFee.studentId) &&
          (payingFee as any).selectedMonths.includes(f.month) &&
          f.status !== "paid"
      );
    }
    if ((payingFee as any).payAllPendingMonths) {
      return fees.filter(
        (f) =>
          String(f.studentId) === String(payingFee.studentId) &&
          f.status !== "paid"
      );
    }
    const matches = fees.filter(
      (f) =>
        String(f.studentId) === String(payingFee.studentId) &&
        (f.month === payingFee.month || !payingFee.month) &&
        f.status !== "paid"
    );
    return matches.length > 0 ? matches : [payingFee];
  }, [payingFee, fees]);

  const checkoutTotalAmount = React.useMemo(() => {
    return payingFeeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [payingFeeItems]);

  // Multi-class selection state & helpers for Fee Structure Modal
  const selectedClassIds: string[] = React.useMemo(() => {
    if (Array.isArray(structFormData.classMasterIds)) {
      return structFormData.classMasterIds.map(String);
    }
    if (structFormData.classMasterId) {
      return [String(structFormData.classMasterId)];
    }
    return [];
  }, [structFormData.classMasterIds, structFormData.classMasterId]);

  const handleToggleClassId = (clsId: string) => {
    if (!setStructFormData) return;
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
    if (!setStructFormData) return;
    let nextIds: string[] = [];
    if (type === "all") {
      nextIds = ALL_CLASS_OPTIONS.map((c) => c.id);
    } else if (type === "primary") {
      nextIds = ["3", "4", "5", "6", "7"];
    } else if (type === "secondary") {
      nextIds = ["8", "9", "10", "11", "12"];
    } else if (type === "none") {
      nextIds = [];
    }
    setStructFormData({
      ...structFormData,
      classMasterIds: nextIds,
      classMasterId: nextIds[0] || "",
    });
  };

  const handleApplyPresetTemplate = (preset: typeof FEE_PRESET_TEMPLATES[0]) => {
    if (!setStructFormData) return;
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

  const summaryDetails = React.useMemo(() => {
    const classCount = selectedClassIds.length;
    const amountNum = Number(structFormData.amount || 0);
    const monthVal = structFormData.month || "all";
    const freqVal = structFormData.frequency || "monthly";

    let timesPerYear = 1;
    if (monthVal === "all") {
      if (freqVal === "monthly") timesPerYear = 12;
      else if (freqVal === "quarterly") timesPerYear = 4;
      else timesPerYear = 1;
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

  // Filtered fees computation
  const filteredFees = React.useMemo(() => {
    return fees.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        (f.studentName && f.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.rollNumber && f.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.feeType && f.feeType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "all" || f.status === statusFilter;
      const matchesType = feeTypeFilter === "all" || f.feeType === feeTypeFilter;
      const matchesMonth = monthFilter === "all" || f.month === monthFilter;

      const matchesClass =
        selectedClassFilter === "all" ||
        (f.class && f.class.toLowerCase().includes(selectedClassFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesType && matchesMonth && matchesClass;
    });
  }, [fees, searchQuery, statusFilter, feeTypeFilter, monthFilter, selectedClassFilter]);

  // Filtered class fee structures computation
  const filteredClassFeeStructures = React.useMemo(() => {
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

  // Stats summary calculations
  const stats = React.useMemo(() => {
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let overdueAmount = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    fees.forEach((f) => {
      const amt = Number(f.amount || 0);
      totalAmount += amt;
      if (f.status === "paid") {
        paidAmount += amt;
        paidCount++;
      } else if (f.status === "overdue") {
        overdueAmount += amt;
        overdueCount++;
      } else {
        pendingAmount += amt;
        pendingCount++;
      }
    });

    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueAmount,
      totalCount: meta ? meta.total : fees.length,
      paidCount,
      pendingCount,
      overdueCount,
    };
  }, [fees, meta]);

  const handleCloseGenerateModal = React.useCallback(() => {
    if (setGenerateClassId) setGenerateClassId("");
    if (setGenerateDueDate) setGenerateDueDate("");
    if (setShowGenerateModal) setShowGenerateModal(false);
  }, [setGenerateClassId, setGenerateDueDate, setShowGenerateModal]);

  // Invoices table pagination state
  const [localPage, setLocalPage] = React.useState(1);
  const [localLimit, setLocalLimit] = React.useState(10);

  const currentPage = propsPage ?? localPage;
  const setCurrentPage = setPropsPage ?? setLocalPage;
  const pageSize = propsLimit ?? localLimit;
  const setPageSize = setPropsLimit ?? setLocalLimit;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, feeTypeFilter, selectedClassFilter]);

  const totalFeesCount = meta ? meta.total : filteredFees.length;
  const totalPages = meta ? meta.totalPages : Math.max(1, Math.ceil(totalFeesCount / pageSize));

  const paginatedFees = React.useMemo(() => {
    if (meta) return filteredFees;
    const start = (currentPage - 1) * pageSize;
    return filteredFees.slice(start, start + pageSize);
  }, [filteredFees, currentPage, pageSize, meta]);

  // Class Fee Structures pagination state
  const [structPage, setStructPage] = React.useState(1);
  const [structPageSize, setStructPageSize] = React.useState(10);

  const totalStructsCount = filteredClassFeeStructures.length;
  const totalStructPages = Math.max(1, Math.ceil(totalStructsCount / structPageSize));

  const paginatedStructs = React.useMemo(() => {
    const start = (structPage - 1) * structPageSize;
    return filteredClassFeeStructures.slice(start, start + structPageSize);
  }, [filteredClassFeeStructures, structPage, structPageSize]);

  // Add/Edit Fee modal student lookup state
  const [modalSelectedClass, setModalSelectedClass] = React.useState<string>("all");
  const [modalSelectedDiv, setModalSelectedDiv] = React.useState<string>("all");
  const [modalStudentSearch, setModalStudentSearch] = React.useState<string>("");

  React.useEffect(() => {
    if (showAddEditModal) {
      setModalStudentSearch("");
      if (editingFee && editingFee.class) {
        const classParts = editingFee.class.split("-");
        setModalSelectedClass(classParts[0] || "all");
        setModalSelectedDiv(classParts[1] || editingFee.section || "all");
      } else {
        setModalSelectedClass("all");
        setModalSelectedDiv("all");
      }
    }
  }, [showAddEditModal, editingFee]);

  const availableModalClasses = React.useMemo(() => {
    const classMap = new Map<string, string>();
    classes.forEach((c) => {
      const name = c.name || c.className;
      if (name) classMap.set(String(name), String(name));
    });
    students.forEach((s) => {
      const name = s.class_name || s.class;
      if (name) classMap.set(String(name), String(name));
    });
    return Array.from(classMap.values()).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [classes, students]);

  const availableModalDivisions = React.useMemo(() => {
    const divSet = new Set<string>();
    if (modalSelectedClass !== "all") {
      classes
        .filter((c) => (c.name || c.className) === modalSelectedClass)
        .forEach((c) => {
          if (c.section) divSet.add(c.section);
          if (c.division) divSet.add(c.division);
          if (c.divisions && Array.isArray(c.divisions)) {
            c.divisions.forEach((d: any) => d.name && divSet.add(d.name));
          }
        });
      students
        .filter((s) => (s.class_name || s.class) === modalSelectedClass)
        .forEach((s) => {
          const div = s.division_name || s.section;
          if (div) divSet.add(div);
        });
    } else {
      students.forEach((s) => {
        const div = s.division_name || s.section;
        if (div) divSet.add(div);
      });
    }
    return Array.from(divSet).sort();
  }, [classes, students, modalSelectedClass]);

  const modalFilteredStudents = React.useMemo(() => {
    const query = modalStudentSearch.toLowerCase().trim();
    return students.filter((s) => {
      const sClass = s.class_name || s.class || "";
      const sDiv = s.division_name || s.section || "";
      const sName = (s.name || s.user?.name || "").toLowerCase();
      const sRoll = String(s.roll_no || s.rollNumber || "").toLowerCase();
      const sReg = String(s.registration_no || "").toLowerCase();

      const matchesClass =
        modalSelectedClass === "all" ||
        sClass.toLowerCase() === modalSelectedClass.toLowerCase() ||
        String(s.class_id) === modalSelectedClass;

      const matchesDiv =
        modalSelectedDiv === "all" ||
        sDiv.toLowerCase() === modalSelectedDiv.toLowerCase();

      const matchesSearch =
        !query ||
        sName.includes(query) ||
        sRoll.includes(query) ||
        sReg.includes(query);

      return matchesClass && matchesDiv && matchesSearch;
    });
  }, [students, modalSelectedClass, modalSelectedDiv, modalStudentSearch]);

  const modalDisplayedStudents = React.useMemo(() => {
    const topSlice = modalFilteredStudents.slice(0, 50);
    if (formData?.studentId && !topSlice.some((s) => String(s.id) === String(formData.studentId))) {
      const selectedObj = students.find((s) => String(s.id) === String(formData.studentId));
      if (selectedObj) {
        return [selectedObj, ...topSlice];
      }
    }
    return topSlice;
  }, [modalFilteredStudents, formData?.studentId, students]);

  const lookupFeeAmount = React.useCallback(
    (className: string, feeType: string) => {
      if (!classFeeStructures || classFeeStructures.length === 0) return 0;
      const targetClassStr = (className || "").toLowerCase().replace(/class|\s|-/g, "");
      const targetType = (feeType || "").toLowerCase();

      const found = classFeeStructures.find((struct) => {
        const structClassStr = (struct.className || "").toLowerCase().replace(/class|\s|-/g, "");
        const structType = (struct.feeType || "").toLowerCase();

        const classMatches =
          structClassStr === targetClassStr ||
          (structClassStr && targetClassStr.includes(structClassStr)) ||
          (struct.classMasterId && targetClassStr.includes(String(struct.classMasterId)));
        return classMatches && structType === targetType;
      });

      return found ? Number(found.amount || 0) : 0;
    },
    [classFeeStructures]
  );

  const availableFeeComponents = React.useMemo(() => {
    const baseTypes = [
      { id: "tuition", label: "Tuition Fee", icon: GraduationCap },
      { id: "exam", label: "Exam Fee", icon: FileText },
      { id: "transport", label: "Transport Fee", icon: CreditCard },
      { id: "library", label: "Library Fee", icon: Layers },
      { id: "sports", label: "Sports Fee", icon: Sparkles },
      { id: "hostel", label: "Hostel Fee", icon: DollarSign },
      { id: "lab", label: "Lab / Computer Fee", icon: DollarSign },
      { id: "annual", label: "Annual Charges", icon: Sparkles },
      { id: "uniforms", label: "Uniforms & Books", icon: Layers },
      { id: "other", label: "Other Fee", icon: DollarSign },
    ];

    const list = [...baseTypes];

    if (classFeeStructures && classFeeStructures.length > 0) {
      classFeeStructures.forEach((struct) => {
        const typeId = (struct.feeType || "").toLowerCase().trim();
        if (typeId && !list.some((b) => b.id === typeId)) {
          list.push({
            id: typeId,
            label: struct.feeName || `${typeId.charAt(0).toUpperCase() + typeId.slice(1)} Fee`,
            icon: DollarSign,
          });
        }
      });
    }

    if (formData?.feeType) {
      const typeId = String(formData.feeType).toLowerCase().trim();
      if (typeId && !list.some((b) => b.id === typeId)) {
        list.push({
          id: typeId,
          label: `${typeId.charAt(0).toUpperCase() + typeId.slice(1)} Fee`,
          icon: DollarSign,
        });
      }
    }

    if (Array.isArray(formData?.selectedFeeItems)) {
      formData.selectedFeeItems.forEach((item: any) => {
        const typeId = String(item.feeType || "").toLowerCase().trim();
        if (typeId && !list.some((b) => b.id === typeId)) {
          list.push({
            id: typeId,
            label: item.label || `${typeId.charAt(0).toUpperCase() + typeId.slice(1)} Fee`,
            icon: DollarSign,
          });
        }
      });
    }

    return list;
  }, [classFeeStructures, formData?.feeType, formData?.selectedFeeItems]);

  const displayedComponents = React.useMemo(() => {
    if (editingFee) {
      const editType = String(editingFee.feeType || formData?.feeType || "tuition").toLowerCase().trim();
      const found = availableFeeComponents.filter((comp) => comp.id.toLowerCase() === editType);
      if (found.length > 0) return found;
      return [
        {
          id: editType,
          label: `${editType.charAt(0).toUpperCase() + editType.slice(1)} Fee`,
          icon: DollarSign,
        },
      ];
    }
    return availableFeeComponents;
  }, [editingFee, availableFeeComponents, formData?.feeType]);

  const handleStudentSelect = (studentId: string) => {
    if (!setFormData) return;
    const selected = students.find((s) => String(s.id) === String(studentId));
    if (selected) {
      const sName = selected.name || (selected.user ? selected.user.name : "");
      const sRoll = selected.roll_no || selected.rollNumber || "";
      const sClass = selected.class_name || selected.class || "";
      const sSection = selected.division_name || selected.section || "";

      if (sClass && (modalSelectedClass === "all" || !modalSelectedClass)) {
        setModalSelectedClass(sClass);
      }
      if (sSection && (modalSelectedDiv === "all" || !modalSelectedDiv)) {
        setModalSelectedDiv(sSection);
      }

      const currentFeeType = formData.feeType || "tuition";
      const autoAmt = lookupFeeAmount(sClass, currentFeeType);

      const initialSelectedFeeItems = availableFeeComponents.map((item) => {
        const structAmt = lookupFeeAmount(sClass, item.id);
        return {
          feeType: item.id,
          label: item.label,
          amount: structAmt > 0 ? String(structAmt) : (item.id === currentFeeType && formData.amount ? String(formData.amount) : ""),
          selected: structAmt > 0 || item.id === currentFeeType,
        };
      });

      setFormData({
        ...formData,
        studentId: String(selected.id),
        studentName: sName,
        rollNumber: sRoll,
        class: sClass,
        section: sSection,
        amount: autoAmt > 0 ? String(autoAmt) : (formData.amount || ""),
        selectedFeeItems: initialSelectedFeeItems,
      });
    } else {
      setFormData({
        ...formData,
        studentId: "",
        studentName: "",
        rollNumber: "",
      });
    }
  };

  const handleToggleMultiFeeItem = (feeType: string) => {
    if (!setFormData) return;
    const items = formData.selectedFeeItems || [];
    const updated = items.map((item: any) =>
      item.feeType === feeType ? { ...item, selected: !item.selected } : item
    );
    const activeItems = updated.filter((item: any) => item.selected);
    const primary = activeItems.find((item: any) => item.feeType === (formData.feeType || feeType)) || activeItems[0];
    setFormData({
      ...formData,
      selectedFeeItems: updated,
      feeType: primary ? primary.feeType : formData.feeType,
      amount: primary ? primary.amount : formData.amount,
    });
  };

  const handleUpdateMultiFeeAmount = (feeType: string, newAmount: string) => {
    if (!setFormData) return;
    const items = formData.selectedFeeItems || [];
    const updated = items.map((item: any) =>
      item.feeType === feeType ? { ...item, amount: newAmount } : item
    );
    const isTargetMain = (formData.feeType || "tuition") === feeType;
    setFormData({
      ...formData,
      selectedFeeItems: updated,
      amount: isTargetMain ? newAmount : formData.amount,
    });
  };

  const multiFeeTotalSum = React.useMemo(() => {
    if (!formData.selectedFeeItems || !Array.isArray(formData.selectedFeeItems)) return 0;
    const baseSum = formData.selectedFeeItems.reduce((sum: number, item: any) => {
      if (item.selected && item.amount) {
        return sum + Number(item.amount || 0);
      }
      return sum;
    }, 0);

    const monthMultiplier = (Array.isArray(formData.selectedMonths) && formData.selectedMonths.length > 0)
      ? formData.selectedMonths.length
      : 1;

    return baseSum * monthMultiplier;
  }, [formData.selectedFeeItems, formData.selectedMonths]);

  return (
    <div className="space-y-6 text-left">
      {/* Header & Stats Cards */}
      <FeesHeader
        isMyFees={isMyFees}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        error={error}
        stats={stats}
        handleExportExcel={handleExportExcel}
        handleExportSummary={handleExportSummary}
        handleOpenAddModal={handleOpenAddModal}
        handleOpenAddStructModal={handleOpenAddStructModal}
        setShowGenerateModal={setShowGenerateModal}
      />

      {/* Search & Filters Toolbar */}
      <FeesToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        feeTypeFilter={feeTypeFilter}
        setFeeTypeFilter={setFeeTypeFilter}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        selectedClassFilter={selectedClassFilter}
        setSelectedClassFilter={setSelectedClassFilter}
        classes={classes}
        isMyFees={isMyFees}
        activeSubTab={activeSubTab}
        filteredCount={activeSubTab === "invoices" ? filteredFees.length : filteredClassFeeStructures.length}
      />

      {/* Main Active Sub-Tab Data Table */}
      {activeSubTab === "invoices" ? (
        <FeesTable
          fees={fees}
          loading={loading}
          isMyFees={isMyFees}
          totalFeesCount={totalFeesCount}
          paginatedFees={paginatedFees}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          handleViewReceipt={handleViewReceipt}
          setPayingFee={setPayingFee}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteFee={handleDeleteFee}
        />
      ) : (
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
      )}

      {/* Payment Gateway Checkout Modal */}
      {payingFee && setPayingFee && (
        <CheckoutModal
          payingFee={payingFee}
          setPayingFee={setPayingFee}
          payingFeeItems={payingFeeItems}
          checkoutTotalAmount={checkoutTotalAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          processing={processing}
          handlePay={handlePay}
        />
      )}

      {/* Create / Edit Student Fee Modal */}
      {showAddEditModal && setShowAddEditModal && (
        <AddEditFeeModal
          showAddEditModal={showAddEditModal}
          setShowAddEditModal={setShowAddEditModal}
          editingFee={editingFee}
          formData={formData}
          setFormData={setFormData}
          formError={formError}
          handleSaveFee={handleSaveFee}
          modalFilteredStudents={modalFilteredStudents}
          modalDisplayedStudents={modalDisplayedStudents}
          modalSelectedClass={modalSelectedClass}
          setModalSelectedClass={setModalSelectedClass}
          modalSelectedDiv={modalSelectedDiv}
          setModalSelectedDiv={setModalSelectedDiv}
          modalStudentSearch={modalStudentSearch}
          setModalStudentSearch={setModalStudentSearch}
          availableModalClasses={availableModalClasses}
          availableModalDivisions={availableModalDivisions}
          handleStudentSelect={handleStudentSelect}
          displayedComponents={displayedComponents}
          lookupFeeAmount={lookupFeeAmount}
          handleToggleMultiFeeItem={handleToggleMultiFeeItem}
          handleUpdateMultiFeeAmount={handleUpdateMultiFeeAmount}
          multiFeeTotalSum={multiFeeTotalSum}
        />
      )}

      {/* Configure Class Fee Structure Modal */}
      {showStructModal && setShowStructModal && (
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

      {/* Auto-Generate Invoices Modal */}
      {showGenerateModal && setShowGenerateModal && (
        <GenerateInvoicesModal
          showGenerateModal={showGenerateModal}
          setShowGenerateModal={setShowGenerateModal}
          generateClassId={generateClassId}
          setGenerateClassId={setGenerateClassId}
          generateDueDate={generateDueDate}
          setGenerateDueDate={setGenerateDueDate}
          generateMonth={generateMonth}
          setGenerateMonth={setGenerateMonth}
          handleGenerateInvoices={handleGenerateInvoices}
          isGenerating={isGenerating}
          classes={classes}
          classFeeStructures={classFeeStructures}
          students={students}
          handleCloseGenerateModal={handleCloseGenerateModal}
        />
      )}

      {/* Interactive Official Receipt Viewer Modal */}
      {activeReceipt && (
        <ReceiptModal
          activeReceipt={activeReceipt}
          setActiveReceipt={setActiveReceipt || (() => {})}
          fees={fees}
        />
      )}
    </div>
  );
}

export default FeesUI;
