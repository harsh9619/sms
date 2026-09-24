import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  CreditCard,
  X,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Layers,
  Sparkles,
  User,
  GraduationCap,
  Filter,
  RefreshCw,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Zap,
  BookOpen,
  Bus,
  Laptop,
  FlaskConical,
  Trophy,
  Building,
  Shirt,
  Info,
  CalendarDays,
} from "lucide-react";
import type { FeeRecord } from "../../../types";
import { formatOnlyDate } from "../../../lib/utils";
import feeService, { ClassFeeStructureItem } from "../../../Services/fee.service";

export const ALL_CLASS_OPTIONS = [
  { id: "1", label: "LKG" },
  { id: "2", label: "UKG" },
  { id: "3", label: "Class 1" },
  { id: "4", label: "Class 2" },
  { id: "5", label: "Class 3" },
  { id: "6", label: "Class 4" },
  { id: "7", label: "Class 5" },
  { id: "8", label: "Class 6" },
  { id: "9", label: "Class 7" },
  { id: "10", label: "Class 8" },
  { id: "11", label: "Class 9" },
  { id: "12", label: "Class 10" },
  { id: "13", label: "Class 11" },
  { id: "14", label: "Class 12" },
];

export const FEE_PRESET_TEMPLATES = [
  {
    name: "Monthly Tuition Fee",
    feeType: "tuition",
    amount: "3000",
    frequency: "monthly",
    month: "all",
    description: "Standard monthly tuition fee component",
    badge: "Popular",
  },
  {
    name: "Term 1 Mid-Term Exam Fee",
    feeType: "exam",
    amount: "500",
    frequency: "one_time",
    month: "07",
    description: "July term examination fee",
    badge: "July Exam",
  },
  {
    name: "Term 2 Mid-Term Exam Fee",
    feeType: "exam",
    amount: "500",
    frequency: "one_time",
    month: "11",
    description: "November term examination fee",
    badge: "November Exam",
  },
  {
    name: "Bus Transport Fee",
    feeType: "transport",
    amount: "800",
    frequency: "monthly",
    month: "all",
    description: "Optional monthly bus transport charge",
    badge: "Monthly",
  },
  {
    name: "Computer & IT Fee",
    feeType: "computer",
    amount: "400",
    frequency: "monthly",
    month: "all",
    description: "Monthly CS lab access charge",
    badge: "Lab Access",
  },
  {
    name: "Annual Activity Fee",
    feeType: "annual",
    amount: "1000",
    frequency: "annually",
    month: "04",
    description: "Annual academic activity and sports fee",
    badge: "April Annual",
  },
  {
    name: "Uniform Set Charge",
    feeType: "uniforms",
    amount: "1500",
    frequency: "one_time",
    month: "04",
    description: "One-time uniform set charge",
    badge: "One Time",
  },
];

export const MONTH_GRID_ITEMS = [
  { value: "04", label: "Apr", fullLabel: "April", badge: "Session Start" },
  { value: "05", label: "May", fullLabel: "May", badge: "" },
  { value: "06", label: "Jun", fullLabel: "June", badge: "Term 1 Exam" },
  { value: "07", label: "Jul", fullLabel: "July", badge: "" },
  { value: "08", label: "Aug", fullLabel: "August", badge: "" },
  { value: "09", label: "Sep", fullLabel: "September", badge: "Mid Year" },
  { value: "10", label: "Oct", fullLabel: "October", badge: "" },
  { value: "11", label: "Nov", fullLabel: "November", badge: "Term 2 Exam" },
  { value: "12", label: "Dec", fullLabel: "December", badge: "" },
  { value: "01", label: "Jan", fullLabel: "January", badge: "" },
  { value: "02", label: "Feb", fullLabel: "February", badge: "" },
  { value: "03", label: "Mar", fullLabel: "March", badge: "Year End" },
];

export interface FeesUIProps {
  fees: FeeRecord[];
  classFeeStructures?: ClassFeeStructureItem[];
  classes?: any[];
  students?: any[];
  loading?: boolean;
  error?: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  feeTypeFilter?: string;
  setFeeTypeFilter?: (val: string) => void;
  isMyFees?: boolean;
  payingFee?: FeeRecord | null;
  setPayingFee?: (fee: FeeRecord | null) => void;
  paymentMethod?: string;
  setPaymentMethod?: (method: string) => void;
  processing?: boolean;
  handlePay?: () => void;

  // Add/Edit Student Fee Modal
  showAddEditModal?: boolean;
  setShowAddEditModal?: (show: boolean) => void;
  editingFee?: FeeRecord | null;
  formData?: any;
  setFormData?: (data: any) => void;
  formError?: string | null;
  handleSaveFee?: () => void;
  handleDeleteFee?: (id: string) => void;
  handleOpenAddModal?: () => void;
  handleOpenEditModal?: (fee: FeeRecord) => void;
  handleExportExcel?: () => void;
  handleExportSummary?: () => void;

  // Sub-Tab Switcher
  activeSubTab?: "invoices" | "structures";
  setActiveSubTab?: (tab: "invoices" | "structures") => void;

  // Class Fee Structure Actions
  showStructModal?: boolean;
  setShowStructModal?: (show: boolean) => void;
  editingStruct?: ClassFeeStructureItem | null;
  structFormData?: any;
  setStructFormData?: (data: any) => void;
  handleSaveStruct?: () => void;
  handleDeleteStruct?: (id: string) => void;
  handleOpenAddStructModal?: () => void;
  handleOpenEditStructModal?: (item: ClassFeeStructureItem) => void;

  // Server-side Pagination & Query Params
  page?: number;
  setPage?: (page: number) => void;
  limit?: number;
  setLimit?: (limit: number) => void;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;

  // Month Filtering
  monthFilter?: string;
  setMonthFilter?: (val: string) => void;

  // Auto Generate Invoices Modal
  showGenerateModal?: boolean;
  setShowGenerateModal?: (show: boolean) => void;
  generateClassId?: string;
  setGenerateClassId?: (val: string) => void;
  generateDueDate?: string;
  setGenerateDueDate?: (val: string) => void;
  generateMonth?: string;
  setGenerateMonth?: (val: string) => void;
  handleGenerateInvoices?: () => void;
  isGenerating?: boolean;
}

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
  // Multi-class selection state & helpers
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

  const handleQuickSelectClasses = (type: "all" | "primary" | "secondary" | "senior" | "none") => {
    if (!setStructFormData) return;
    let nextIds: string[] = [];
    if (type === "all") {
      nextIds = ALL_CLASS_OPTIONS.map((c) => c.id);
    } else if (type === "primary") {
      nextIds = ["3", "4", "5", "6", "7"];
    } else if (type === "secondary") {
      nextIds = ["8", "9", "10", "11", "12"];
    } else if (type === "senior") {
      nextIds = ["13", "14"];
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

  // Stats calculations
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

  // Server or Client Pagination State for Invoices Table
  const [localPage, setLocalPage] = React.useState(1);
  const [localLimit, setLocalLimit] = React.useState(10);

  const currentPage = propsPage ?? localPage;
  const setCurrentPage = setPropsPage ?? setLocalPage;
  const pageSize = propsLimit ?? localLimit;
  const setPageSize = setPropsLimit ?? setLocalLimit;

  // Reset page to 1 when search/filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, feeTypeFilter]);

  const totalFeesCount = meta ? meta.total : fees.length;
  const totalPages = meta ? meta.totalPages : Math.max(1, Math.ceil(totalFeesCount / pageSize));

  const paginatedFees = React.useMemo(() => {
    if (meta) return fees; // Data is already paginated by backend
    const start = (currentPage - 1) * pageSize;
    return fees.slice(start, start + pageSize);
  }, [fees, currentPage, pageSize, meta]);

  // Pagination State for Fee Structures Table
  const [structPage, setStructPage] = React.useState(1);
  const [structPageSize, setStructPageSize] = React.useState(10);

  const totalStructsCount = classFeeStructures.length;
  const totalStructPages = Math.max(1, Math.ceil(totalStructsCount / structPageSize));

  const paginatedStructs = React.useMemo(() => {
    const start = (structPage - 1) * structPageSize;
    return classFeeStructures.slice(start, start + structPageSize);
  }, [classFeeStructures, structPage, structPageSize]);

  // Class, Division, and Student selection logic for Add/Edit Fee Modal
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

  // DOM Slicing: limit rendered options to max 50 to ensure 0 UI lag with 5,000+ students
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

  const isSelectionComplete = React.useMemo(() => {
    const hasClass = (modalSelectedClass !== "all" && Boolean(modalSelectedClass)) || Boolean(formData?.class);
    const hasDiv = (modalSelectedDiv !== "all" && Boolean(modalSelectedDiv)) || Boolean(formData?.section);
    const hasStudent = Boolean(formData?.studentId);
    return hasClass && hasDiv && hasStudent;
  }, [modalSelectedClass, modalSelectedDiv, formData?.class, formData?.section, formData?.studentId]);

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

  const handleFeeTypeChange = (newType: string) => {
    if (!setFormData) return;
    const sClass = formData.class || modalSelectedClass || "";
    const autoAmt = lookupFeeAmount(sClass, newType);
    setFormData({
      ...formData,
      feeType: newType,
      amount: autoAmt > 0 ? String(autoAmt) : (formData.amount || ""),
    });
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
    return formData.selectedFeeItems.reduce((sum: number, item: any) => {
      if (item.selected && item.amount) {
        return sum + Number(item.amount || 0);
      }
      return sum;
    }, 0);
  }, [formData.selectedFeeItems]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-7 w-7 text-primary animate-pulse-glow" />
            {isMyFees ? "My Fees" : "Fee Management & Ledgers"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isMyFees
              ? "View your school fees, invoices and payment transaction history"
              : "Manage student billing, class-wise fee structures, collections, and financial receipts"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {handleExportExcel && (
            <Button variant="outline" size="sm" onClick={handleExportExcel}>
              <Download className="h-4 w-4 mr-2" /> Export Excel
            </Button>
          )}
          {handleExportSummary && (
            <Button variant="outline" size="sm" onClick={handleExportSummary}>
              Summary Report
            </Button>
          )}
          {!isMyFees && activeSubTab === "invoices" && handleOpenAddModal && (
            <Button size="sm" onClick={handleOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Add Fee Entry
            </Button>
          )}
          {!isMyFees && activeSubTab === "structures" && handleOpenAddStructModal && (
            <Button size="sm" onClick={handleOpenAddStructModal}>
              <Plus className="h-4 w-4 mr-2" /> Configure Class Fee
            </Button>
          )}
          {!isMyFees && activeSubTab === "structures" && setShowGenerateModal && (
            <Button size="sm" variant="secondary" onClick={() => setShowGenerateModal(true)}>
              <Sparkles className="h-4 w-4 mr-2 text-primary" /> Auto-Generate Invoices
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm font-medium">
          {error}
        </div>
      )}

      {/* Admin Sub-Tabs Switcher */}
      {!isMyFees && setActiveSubTab && (
        <div className="flex gap-2 border-b border-border/60 pb-1 text-left">
          <button
            onClick={() => setActiveSubTab("invoices")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === "invoices"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Receipt className="h-4 w-4" />
            Student Fee Invoices & Ledgers
          </button>
          <button
            onClick={() => setActiveSubTab("structures")}
            className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeSubTab === "structures"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            <Layers className="h-4 w-4" />
            Class-Wise Fee Structures
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {activeSubTab === "invoices" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <Card className="hover-lift">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Total Fee Billing</p>
              <p className="text-2xl font-black text-foreground mt-1.5">
                ₹{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stats.totalCount} Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-success">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Amount Settled (Paid)</p>
              <p className="text-2xl font-black text-success mt-1.5">
                ₹{stats.paidAmount.toLocaleString()}
              </p>
              <p className="text-xs text-success mt-1">{stats.paidCount} Paid Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-warning">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Amount Outstanding</p>
              <p className="text-2xl font-black text-warning mt-1.5">
                ₹{stats.pendingAmount.toLocaleString()}
              </p>
              <p className="text-xs text-warning mt-1">{stats.pendingCount} Pending Invoices</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-l-4 border-l-destructive">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-muted-foreground font-semibold">Overdue Invoices</p>
              <p className="text-2xl font-black text-destructive mt-1.5">
                ₹{stats.overdueAmount.toLocaleString()}
              </p>
              <p className="text-xs text-destructive mt-1">{stats.overdueCount} Overdue Invoices</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- INVOICES TAB CONTENT --- */}
      {activeSubTab === "invoices" && (
        <>
          {/* Filters & Controls */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder={
                      isMyFees
                        ? "Search by fee type or remarks..."
                        : "Search by student name or roll number..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>

                  {setMonthFilter && (
                    <select
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                    >
                      <option value="all">All Months</option>
                      <option value="2026-01">January 2026</option>
                      <option value="2026-02">February 2026</option>
                      <option value="2026-03">March 2026</option>
                      <option value="2026-04">April 2026</option>
                      <option value="2026-05">May 2026</option>
                      <option value="2026-06">June 2026</option>
                      <option value="2026-07">July 2026</option>
                      <option value="2026-08">August 2026</option>
                      <option value="2026-09">September 2026</option>
                      <option value="2026-10">October 2026</option>
                      <option value="2026-11">November 2026</option>
                      <option value="2026-12">December 2026</option>
                    </select>
                  )}

                  {setFeeTypeFilter && (
                    <select
                      className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={feeTypeFilter}
                      onChange={(e) => setFeeTypeFilter(e.target.value)}
                    >
                      <option value="all">All Fee Types</option>
                      <option value="tuition">Tuition Fee</option>
                      <option value="transport">Transport Fee</option>
                      <option value="exam">Exam Fee</option>
                      <option value="library">Library Fee</option>
                      <option value="sports">Sports Fee</option>
                      <option value="hostel">Hostel Fee</option>
                      <option value="lab">Lab / Computer Fee</option>
                      <option value="annual">Annual Charges</option>
                      <option value="uniforms">Uniforms & Books</option>
                      <option value="other">Other Fee</option>
                    </select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="text-left">
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
                <div className="overflow-x-auto text-left">
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
                              <Badge variant="outline" className="font-bold text-primary border-primary/30 bg-primary/5">
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
                              <Badge variant={getStatusBadgeVariant(fee.status)}>
                                {fee.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {fee?.status?.toLowerCase() === "paid"
                                && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:text-primary h-8 w-8"
                                    onClick={() => feeService.downloadFeeReceiptPdf(fee.id, fee, fees)}
                                    title="Download Monthly Fee Receipt PDF (All Fee Heads)"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>)}
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

              {/* Invoices Pagination Toolbar */}
              {totalFeesCount > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 p-4 border-t border-border/60 bg-card rounded-b-xl">
                  {/* <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <div>
                      Showing <span className="font-semibold text-foreground">{Math.min((currentPage - 1) * pageSize + 1, totalFeesCount)}</span> to{" "}
                      <span className="font-semibold text-foreground">{Math.min(currentPage * pageSize, totalFeesCount)}</span> of{" "}
                      <span className="font-semibold text-foreground">{totalFeesCount}</span> records
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rows per page:</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                  </div> */}

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
                      className="h-8 text-xs gap-1"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>

                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, idx, arr) => {
                          const prev = arr[idx - 1];
                          const showEllipsis = prev && p - prev > 1;
                          return (
                            <React.Fragment key={p}>
                              {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                              <Button
                                variant={currentPage === p ? "default" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0 text-xs font-semibold"
                                onClick={() => setCurrentPage(p)}
                              >
                                {p}
                              </Button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next <ChevronRight className="h-4 w-4" />
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
        </>
      )}

      {/* --- CLASS FEE STRUCTURES TAB CONTENT --- */}
      {activeSubTab === "structures" && (
        <Card>
          <CardHeader className="text-left flex flex-row items-center justify-between">
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
            <div className="overflow-x-auto text-left">
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
                  No class fee structures configured yet. Click "Configure Class Fee" to add components.
                </div>
              )}
            </div>

            {/* Fee Structures Pagination Toolbar */}
            {totalStructsCount > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border/60 bg-card rounded-b-xl">
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div>
                    Showing <span className="font-semibold text-foreground">{Math.min((structPage - 1) * structPageSize + 1, totalStructsCount)}</span> to{" "}
                    <span className="font-semibold text-foreground">{Math.min(structPage * structPageSize, totalStructsCount)}</span> of{" "}
                    <span className="font-semibold text-foreground">{totalStructsCount}</span> components
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rows per page:</span>
                    <select
                      value={structPageSize}
                      onChange={(e) => {
                        setStructPageSize(Number(e.target.value));
                        setStructPage(1);
                      }}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

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
                    className="h-8 text-xs gap-1"
                    disabled={structPage <= 1}
                    onClick={() => setStructPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>

                  <div className="flex items-center gap-1 px-1">
                    {Array.from({ length: totalStructPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalStructPages || Math.abs(p - structPage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span className="px-1 text-xs text-muted-foreground">...</span>}
                            <Button
                              variant={structPage === p ? "default" : "ghost"}
                              size="sm"
                              className="h-8 w-8 p-0 text-xs font-semibold"
                              onClick={() => setStructPage(p)}
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    disabled={structPage >= totalStructPages}
                    onClick={() => setStructPage((p) => Math.min(totalStructPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2"
                    disabled={structPage >= totalStructPages}
                    onClick={() => setStructPage(totalStructPages)}
                    title="Last Page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mock Payment Gateway Modal Dialog */}
      {payingFee && setPayingFee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => !processing && setPayingFee(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Mock Payment Checkout
              </h3>
              {!processing && (
                <button
                  onClick={() => setPayingFee(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
                <p className="text-xs text-muted-foreground font-semibold">Payment For</p>
                <p className="text-sm font-bold capitalize">{payingFee.feeType} Fee</p>
                <p className="text-xl font-black text-primary mt-1">
                  ₹{Number(payingFee.amount).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod && setPaymentMethod(e.target.value)}
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="upi">UPI / QR Code</option>
                  <option value="wallet">Mobile Wallet</option>
                </select>
              </div>

              <div className="p-3 bg-muted/50 rounded-xl text-[10px] text-muted-foreground leading-relaxed">
                🚨 This is a mock sandbox integration. No actual currency will be debited or
                processed.
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={() => setPayingFee(null)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button onClick={handlePay} disabled={processing}>
                {processing
                  ? "Processing..."
                  : `Authorize ₹${Number(payingFee.amount).toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Fee Modal */}
      {showAddEditModal && setShowAddEditModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl m-4 overflow-hidden animate-scale-in text-left flex flex-col max-h-[92vh] transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black shadow-md">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground tracking-tight flex items-center gap-2">
                    {editingFee ? "Edit Student Fee Entry" : "Create New Student Fee Entry"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    {editingFee ? "Update fee details, payment status or settlement date" : "Select a student from database and issue a fee invoice"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddEditModal(false)}
                className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 space-y-6 text-sm overflow-y-auto">
              {formError && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive/40 text-destructive text-xs rounded-2xl font-bold flex items-center gap-3 animate-bounce">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-extrabold text-sm">Validation Required</p>
                    <p className="font-medium text-xs opacity-90">{formError}</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Student Selection */}
              <div className="space-y-4 p-5 bg-card border-2 border-primary/20 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">1</span>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider">
                      Student Selection (Database Lookup)
                    </label>
                  </div>
                  {modalFilteredStudents.length > 50 && (
                    <span className="text-[11px] text-amber-600 font-bold bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                      Showing 50 of {modalFilteredStudents.length} matching students
                    </span>
                  )}
                </div>

                {/* Selected Student Card (If student is already selected) */}
                {formData.studentId ? (
                  <div className="p-4 bg-primary/10 border-2 border-primary/40 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-md">
                        {(formData.studentName || "S")[0].toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-foreground text-base">{formData.studentName}</p>
                          <Badge variant="success" className="text-[10px] px-2 py-0.5 font-bold">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Student Selected
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-semibold">
                          <span>Roll No: <strong className="text-foreground">{formData.rollNumber || "N/A"}</strong></span>
                          <span>Class: <strong className="text-foreground">{formData.class || "N/A"} {formData.section || ""}</strong></span>
                          {formData.studentId && <span>ID: <strong className="text-foreground">#{formData.studentId}</strong></span>}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData && setFormData({ ...formData, studentId: "", studentName: "", rollNumber: "" })}
                      className="text-xs border-destructive/40 text-destructive hover:bg-destructive hover:text-white h-9 px-3 font-bold"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Change Student
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {/* Class & Division Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                          <Filter className="h-3.5 w-3.5 text-primary" /> Filter Class Grade
                        </label>
                        <select
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                          value={modalSelectedClass}
                          onChange={(e) => {
                            setModalSelectedClass(e.target.value);
                            setModalSelectedDiv("all");
                          }}
                        >
                          <option value="all">All Classes</option>
                          {availableModalClasses.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-foreground flex items-center gap-1">
                          <Filter className="h-3.5 w-3.5 text-primary" /> Filter Division
                        </label>
                        <select
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none"
                          value={modalSelectedDiv}
                          onChange={(e) => setModalSelectedDiv(e.target.value)}
                        >
                          <option value="all">All Divisions</option>
                          {availableModalDivisions.map((div) => (
                            <option key={div} value={div}>
                              Div {div}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Quick Search Field */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-foreground flex items-center justify-between">
                        <span>Search Student by Name or Admission No</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Type to filter list</span>
                      </label>
                      <Input
                        placeholder="Type student name, admission no, or roll no..."
                        value={modalStudentSearch}
                        onChange={(e) => setModalStudentSearch(e.target.value)}
                        icon={<Search className="h-4 w-4 text-primary" />}
                      />
                    </div>

                    {/* Student Selection Dropdown List */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-primary flex items-center gap-1">
                        Select Student Dropdown <span className="text-destructive">*</span>
                      </label>
                      <select
                        className="w-full h-11 rounded-xl border-2 border-primary/50 bg-background px-3 text-xs font-bold focus:ring-2 focus:ring-primary outline-none shadow-sm cursor-pointer"
                        value={formData.studentId || ""}
                        onChange={(e) => handleStudentSelect(e.target.value)}
                      >
                        <option value="">-- 👇 Click to Select Student ({modalDisplayedStudents.length} available) --</option>
                        {modalDisplayedStudents.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name || st.user?.name} (Admission No: {st.registration_no || "N/A"}) — {st.class_name || st.class || "-"} {st.division_name || st.section || ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Fee Category & Amount */}
              <div className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${!isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""}`}>
                {!isSelectionComplete && (
                  <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Please select Class Grade, Division, and Student in Step 1 to unlock fee category & amount.</span>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">2</span>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider">
                      Fee Category & Amount
                    </label>
                  </div>

                  {/* Mode Switch Toggle Pill */}

                </div>



                <div className="space-y-4 animate-fade-in">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4" /> {editingFee ? "Single Fee Record Edit Mode" : "Multi-Fee Bundle Mode"}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      {editingFee ? `Editing ${editingFee.feeType || "fee"} entry` : "Select fee types to issue or pay together"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-foreground">
                      {editingFee ? "Target Fee Component & Amount" : "Fee Components Checklist & Amounts"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                      {displayedComponents.map((typeObj) => {
                        const items = formData.selectedFeeItems || [];
                        const foundItem = items.find((i: any) => String(i.feeType).toLowerCase() === typeObj.id.toLowerCase());
                        const isChecked = editingFee ? true : (foundItem ? foundItem.selected : false);
                        const currentAmt = editingFee ? (formData.amount !== undefined ? formData.amount : "") : (foundItem ? foundItem.amount : "");
                        const autoAmt = lookupFeeAmount(formData.class || "", typeObj.id);
                        const IconComp = typeObj.icon || DollarSign;

                        return (
                          <div
                            key={typeObj.id}
                            className={`p-2.5 rounded-xl border-2 flex items-center gap-3 transition-all ${isChecked
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/60 bg-background opacity-75"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={Boolean(editingFee) || !isSelectionComplete}
                              onChange={() => handleToggleMultiFeeItem(typeObj.id)}
                              className="h-4 w-4 rounded accent-primary cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="flex-1 min-w-0 flex items-center gap-1.5">
                              <IconComp className="h-3.5 w-3.5 text-primary shrink-0" />
                              <span className="text-xs font-extrabold truncate">{typeObj.label}</span>
                            </div>
                            <div className="relative w-24">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 font-bold text-xs text-muted-foreground">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                disabled={!isChecked || !isSelectionComplete}
                                value={currentAmt}
                                placeholder={autoAmt > 0 ? String(autoAmt) : "0"}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (editingFee) {
                                    setFormData && setFormData({ ...formData, amount: val });
                                    handleUpdateMultiFeeAmount(typeObj.id, val);
                                  } else {
                                    handleUpdateMultiFeeAmount(typeObj.id, val);
                                  }
                                }}
                                className="w-full h-8 pl-5 pr-2 rounded-lg border border-input bg-background font-bold text-xs focus:ring-1 focus:ring-primary outline-none disabled:bg-muted/50 disabled:opacity-50"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Total Bundle Sum Banner */}
                  <div className="p-3.5 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                          Combined Bundle Total
                        </p>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Multiple fee invoices will be created in one submission
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{multiFeeTotalSum.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Billing Month & Due Date Picker for Fee Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-foreground">
                        Billing Month / Period <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="month"
                        disabled={!isSelectionComplete}
                        value={formData.month || new Date().toISOString().slice(0, 7)}
                        onChange={(e) => setFormData && setFormData({ ...formData, month: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-extrabold text-foreground">
                        Invoice Due Date <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="date"
                        disabled={!isSelectionComplete}
                        value={formData.dueDate || ""}
                        onChange={(e) => setFormData && setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* STEP 3: Payment Status & Remarks */}
              <div className={`space-y-4 p-5 bg-card border-2 border-border/80 rounded-2xl shadow-sm transition-all ${!isSelectionComplete ? "opacity-50 pointer-events-none select-none bg-muted/20" : ""}`}>
                <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-black text-xs flex items-center justify-center">3</span>
                  <label className="text-xs font-black text-foreground uppercase tracking-wider">
                    Payment Status & Settlement
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Toggle Pills */}
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-foreground">Payment Status</label>
                    <div className="flex rounded-xl border-2 border-input p-1 bg-background gap-1">
                      {[
                        { id: "pending", label: "Pending", color: "text-amber-600 bg-amber-500/15 border-amber-500/40" },
                        { id: "paid", label: "Paid", color: "text-emerald-600 bg-emerald-500/15 border-emerald-500/40" },
                        { id: "overdue", label: "Overdue", color: "text-rose-600 bg-rose-500/15 border-rose-500/40" },
                      ].map((st) => {
                        const isSelected = (formData.status || "Paid") === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            disabled={!isSelectionComplete}
                            onClick={() => setFormData && setFormData({ ...formData, status: st.id })}
                            className={`flex-1 py-2 rounded-lg text-xs font-black capitalize transition-all ${isSelected
                              ? `${st.color} shadow-sm border-2`
                              : "text-muted-foreground hover:text-foreground"
                              }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Settlement Date (Only if Paid) */}
                  {formData.status === "paid" ? (
                    <div className="space-y-2 animate-fade-in">
                      <label className="text-xs font-extrabold text-emerald-600">Date Payment Was Received</label>
                      <Input
                        type="date"
                        disabled={!isSelectionComplete}
                        value={formData.paidDate || new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFormData && setFormData({ ...formData, paidDate: e.target.value })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-foreground">Remarks / Notes</label>
                      <Input
                        disabled={!isSelectionComplete}
                        value={formData.remarks || ""}
                        onChange={(e) => setFormData && setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Optional remarks"
                      />
                    </div>
                  )}
                </div>

                {formData.status === "paid" && (
                  <div className="space-y-2 animate-fade-in pt-1">
                    <label className="text-xs font-extrabold text-foreground">Remarks / Description</label>
                    <Input
                      disabled={!isSelectionComplete}
                      value={formData.remarks || ""}
                      onChange={(e) => setFormData && setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Optional remarks or receipt voucher notes"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/30">
              <span className="text-xs text-muted-foreground font-extrabold hidden sm:inline">
                {isSelectionComplete
                  ? `Ready to submit fee entry for ${formData.studentName}`
                  : "Please select Class, Division, and Student to unlock fee creation"}
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <Button variant="outline" onClick={() => setShowAddEditModal(false)} className="font-bold">
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveFee}
                  disabled={!isSelectionComplete}
                  className="font-black px-5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingFee ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" /> Update Fee Record
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" /> Create Fee Record
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Class Fee Structure Modal */}
      {showStructModal && setShowStructModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto"
          onClick={() => setShowStructModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl my-auto overflow-hidden animate-scale-in text-left flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {editingStruct ? "Edit Class Fee Component" : "Configure Class Fee Component"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Define reusable class billing rules and apply them to target classes in seconds.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowStructModal(false)}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Divided into Clear Steps) */}
            <div className="p-5 space-y-6 text-sm overflow-y-auto flex-1">
              {/* STEP 1: Select Target Class(es) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center">
                      1
                    </span>
                    Target Class Grades
                  </label>
                  {!editingStruct && (
                    <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/20">
                      {selectedClassIds.length} Class(es) Selected
                    </Badge>
                  )}
                </div>

                {editingStruct ? (
                  <div className="space-y-1.5">
                    <select
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={structFormData.classMasterId || ""}
                      onChange={(e) =>
                        setStructFormData &&
                        setStructFormData({
                          ...structFormData,
                          classMasterId: e.target.value,
                          classMasterIds: [e.target.value],
                        })
                      }
                    >
                      <option value="">Select Class Grade</option>
                      {ALL_CLASS_OPTIONS.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-muted/20 p-3.5 rounded-xl border border-border/70 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground font-medium">
                        Choose which classes receive this fee structure component:
                      </p>
                      <div className="flex flex-wrap items-center gap-1 text-xs">
                        <button
                          type="button"
                          onClick={() => handleQuickSelectClasses("all")}
                          className="px-2.5 py-1 font-bold rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSelectClasses("primary")}
                          className="px-2.5 py-1 font-medium rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
                        >
                          Class 1-5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSelectClasses("secondary")}
                          className="px-2.5 py-1 font-medium rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
                        >
                          Class 6-10
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickSelectClasses("none")}
                          className="px-2.5 py-1 font-medium rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
                      {ALL_CLASS_OPTIONS.map((cls) => {
                        const isSelected = selectedClassIds.includes(cls.id);
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => handleToggleClassId(cls.id)}
                            className={` items-center justify-between px-1.5 py-1 text-xs font-semibold rounded-lg border transition-all ${isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs scale-102"
                              : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                              }`}
                          >

                            <span>{cls.label}</span>

                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 2: Component Details & Pricing */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center">
                      2
                    </span>
                    Fee Details & Pricing
                  </label>
                  {!editingStruct && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Click a preset below to auto-fill
                    </span>
                  )}
                </div>

                {/* Quick Presets Bar */}
                {!editingStruct && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {FEE_PRESET_TEMPLATES.map((tpl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleApplyPresetTemplate(tpl)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all"
                      >
                        <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span>{tpl.name}</span>
                        <span className="text-[10px] font-bold opacity-80">₹{tpl.amount}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Component Name *</label>
                    <Input
                      value={structFormData.feeName || ""}
                      onChange={(e) =>
                        setStructFormData &&
                        setStructFormData({ ...structFormData, feeName: e.target.value })
                      }
                      placeholder="e.g. Monthly Tuition Fee"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Fee Category Type</label>
                    <select
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                      value={structFormData.feeType || "tuition"}
                      onChange={(e) =>
                        setStructFormData &&
                        setStructFormData({ ...structFormData, feeType: e.target.value })
                      }
                    >
                      <option value="tuition">📚 Tuition Fee</option>
                      <option value="transport">🚌 Transport Fee</option>
                      <option value="exam">📝 Exam Fee</option>
                      <option value="library">📖 Library Fee</option>
                      <option value="lab">🔬 Science Lab Fee</option>
                      <option value="sports">🏆 Sports Fee</option>
                      <option value="hostel">🏢 Hostel Fee</option>
                      <option value="annual">🎉 Annual Charge</option>
                      <option value="computer">💻 Computer & IT Fee</option>
                      <option value="uniforms">👔 Uniform Charge</option>
                      <option value="other">📦 Other Component</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Amount (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground text-sm font-semibold">₹</span>
                      <Input
                        type="number"
                        className="pl-7 font-bold text-foreground"
                        value={structFormData.amount || ""}
                        onChange={(e) =>
                          setStructFormData &&
                          setStructFormData({ ...structFormData, amount: e.target.value })
                        }
                        placeholder="e.g. 3000"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Billing Frequency</label>
                    <select
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
                      value={structFormData.frequency || "monthly"}
                      onChange={(e) =>
                        setStructFormData &&
                        setStructFormData({ ...structFormData, frequency: e.target.value })
                      }
                    >
                      <option value="monthly">Monthly Recurring (12x / yr)</option>
                      <option value="quarterly">Quarterly (4x / yr)</option>
                      <option value="annually">Annually (1x / yr)</option>
                      <option value="one_time">One Time Charge</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* STEP 3: Billing Schedule & Month Rules */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-black inline-flex items-center justify-center">
                      3
                    </span>
                    Billing Month Schedule
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    When does this fee generate on student accounts?
                  </span>
                </div>

                {/* Recurring vs Month-Specific Toggle Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStructFormData && setStructFormData({ ...structFormData, month: "all" })}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${structFormData.month === "all" || !structFormData.month
                      ? "bg-primary/10 border-primary shadow-xs"
                      : "bg-background border-input hover:border-primary/50"
                      }`}
                  >
                    <div className={`p-1.5 rounded-lg mt-0.5 ${structFormData.month === "all" || !structFormData.month ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <RefreshCw className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground">Every Month (Recurring)</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Generates in all monthly billing cycles (e.g. Tuition, Bus).
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setStructFormData &&
                      setStructFormData({
                        ...structFormData,
                        month: structFormData.month && structFormData.month !== "all" ? structFormData.month : "06",
                      })
                    }
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${structFormData.month && structFormData.month !== "all"
                      ? "bg-primary/10 border-primary shadow-xs"
                      : "bg-background border-input hover:border-primary/50"
                      }`}
                  >
                    <div className={`p-1.5 rounded-lg mt-0.5 ${structFormData.month && structFormData.month !== "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground">Specific Month Only</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        Generates only in a target month (e.g. June Exam Fee).
                      </div>
                    </div>
                  </button>
                </div>

                {/* 12-Month Grid if Specific Month selected */}
                {structFormData.month && structFormData.month !== "all" && (
                  <div className="space-y-1.5 bg-muted/20 p-3 rounded-xl border border-border">
                    <label className="text-[11px] font-semibold text-muted-foreground">Select Target Month:</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                      {MONTH_GRID_ITEMS.map((m) => {
                        const isMonthSelected = structFormData.month === m.value;
                        return (
                          <button
                            key={m.value}
                            type="button"
                            onClick={() => setStructFormData && setStructFormData({ ...structFormData, month: m.value })}
                            className={`p-2 rounded-lg border text-center transition-all ${isMonthSelected
                              ? "bg-primary text-primary-foreground border-primary font-bold shadow-xs"
                              : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground"
                              }`}
                          >
                            <div className="text-xs">{m.label}</div>
                            {m.badge && (
                              <div className={`text-[9px] mt-0.5 truncate ${isMonthSelected ? "text-primary-foreground/90 font-medium" : "text-primary"}`}>
                                {m.badge}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Due Day of Month</label>
                    <Input
                      type="number"
                      value={structFormData.dueDay || 10}
                      onChange={(e) =>
                        setStructFormData &&
                        setStructFormData({ ...structFormData, dueDay: e.target.value })
                      }
                      placeholder="Day (1-31)"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Description / Notes</label>
                    <Input
                      value={structFormData.description || ""}
                      onChange={(e) =>
                        setStructFormData &&
                        setStructFormData({ ...structFormData, description: e.target.value })
                      }
                      placeholder="e.g. Session 2026-27"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 4: Realtime Live Summary Card */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 p-4 space-y-2">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-4 w-4 text-primary fill-primary/20" />
                    Structure Component Summary
                  </span>
                  <span className="text-primary font-black text-base">
                    ₹{Number(structFormData.amount || 0).toLocaleString("en-IN")}
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}/ {structFormData.frequency || "monthly"}
                    </span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground text-xs pt-1.5 border-t border-primary/15">
                  <div>
                    🎓 <strong className="text-foreground">Classes:</strong>{" "}
                    {selectedClassIds.length > 0
                      ? `${selectedClassIds.length} Class(es) selected`
                      : "No class selected"}
                  </div>
                  <div>
                    🗓️ <strong className="text-foreground">Schedule:</strong>{" "}
                    {structFormData.month === "all" || !structFormData.month
                      ? "Every Month (12x/yr)"
                      : `Specific Month (${structFormData.month})`}
                  </div>
                  <div>
                    📅 <strong className="text-foreground">Due Day:</strong> Day {structFormData.dueDay || 10} of month
                  </div>
                  <div>
                    💡 <strong className="text-foreground">Est. Annual Total:</strong> ₹
                    {summaryDetails.totalAnnualStudent.toLocaleString("en-IN")} / student / year
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">
                {selectedClassIds.length > 0
                  ? `Configuring component for ${selectedClassIds.length} class(es)`
                  : "Select at least 1 class grade"}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowStructModal(false)} className="font-semibold">
                  Cancel
                </Button>
                <Button onClick={handleSaveStruct} className="font-bold px-5 shadow-sm">
                  {editingStruct
                    ? "Update Component"
                    : selectedClassIds.length > 1
                      ? `Create for ${selectedClassIds.length} Classes`
                      : "Save Component"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Generate Invoices Modal */}
      {showGenerateModal && setShowGenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={handleCloseGenerateModal}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                Auto-Generate Class Fee Invoices
              </h3>
              <button
                onClick={handleCloseGenerateModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-sm">
              {/* Select Class Grade Section */}
              <div className="space-y-1.5 bg-muted/20 p-3.5 rounded-xl border border-border/50">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <GraduationCap className="h-4 w-4 text-primary" /> Select Target Class Grade
                </label>

                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-semibold focus:ring-2 focus:ring-primary outline-none mt-1"
                  value={generateClassId}
                  onChange={(e) => setGenerateClassId && setGenerateClassId(e.target.value)}
                >
                  <option value="">-- Choose Target Class Grade --</option>
                  {classes.length > 0
                    ? classes.map((c: any) => (
                      <option key={c.id} value={c.classMasterId}>
                        {c.name || c.className}
                      </option>
                    ))
                    : [
                      { id: "1", name: "LKG" },
                      { id: "2", name: "UKG" },
                      { id: "3", name: "Class 1" },
                      { id: "4", name: "Class 2" },
                      { id: "5", name: "Class 3" },
                      { id: "6", name: "Class 4" },
                      { id: "7", name: "Class 5" },
                      { id: "8", name: "Class 6" },
                      { id: "9", name: "Class 7" },
                      { id: "10", name: "Class 8" },
                      { id: "11", name: "Class 9" },
                      { id: "12", name: "Class 10" },
                      { id: "13", name: "Class 11" },
                      { id: "14", name: "Class 12" },
                    ].map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Class Fee Structure & Enrolled Students Preview Card */}
              {(() => {
                if (!generateClassId) return null;
                const cls = classes.find(
                  (c) => String(c.classMasterId) === String(generateClassId) || c.name === generateClassId
                );
                const targetName = cls ? cls.name || cls.className : generateClassId;

                const selectedClassFeeItems = classFeeStructures.filter(
                  (s) =>
                    String(s.classId) === String(generateClassId) ||
                    (s.className &&
                      targetName &&
                      s.className.toLowerCase() === targetName.toLowerCase())
                );

                const totalClassFeePerStudent = selectedClassFeeItems.reduce(
                  (sum, item) => sum + Number(item.amount || 0),
                  0
                );

                const targetEnrolledStudents = students.filter(
                  (s) =>
                    String(s.class_id) === String(generateClassId) ||
                    (s.class_name &&
                      targetName &&
                      s.class_name.toLowerCase() === targetName.toLowerCase()) ||
                    (s.class && targetName && s.class.toLowerCase() === targetName.toLowerCase())
                );

                return (
                  <div className="p-3.5 bg-card border border-primary/30 rounded-xl space-y-2 text-left shadow-sm animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" /> Class Invoicing Preview
                      </span>
                      <Badge
                        variant={selectedClassFeeItems.length > 0 ? "success" : "warning"}
                        className="text-[10px] font-bold"
                      >
                        {selectedClassFeeItems.length} Fee Types Configured
                      </Badge>
                    </div>

                    {selectedClassFeeItems.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {selectedClassFeeItems.map((item, idx) => (
                            <span
                              key={idx}
                              className="bg-primary/10 text-primary px-2 py-0.5 rounded font-semibold border border-primary/20"
                            >
                              {item.feeType?.toUpperCase()}: ₹{Number(item.amount).toLocaleString()}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-border/40">
                          <div className="p-2.5 bg-muted/40 rounded-lg">
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Per Student Total
                            </span>
                            <span className="text-sm font-black text-foreground">
                              ₹{totalClassFeePerStudent.toLocaleString()}
                            </span>
                          </div>

                          <div className="p-2.5 bg-muted/40 rounded-lg">
                            <span className="text-[10px] text-muted-foreground block font-medium">
                              Target Enrolled
                            </span>
                            <span className="text-sm font-black text-primary">
                              {targetEnrolledStudents.length > 0
                                ? `${targetEnrolledStudents.length} Students`
                                : "All Class Students"}
                            </span>
                          </div>
                        </div>

                        {targetEnrolledStudents.length > 0 && totalClassFeePerStudent > 0 && (
                          <div className="flex items-center justify-between p-2.5 bg-success/10 border border-success/30 rounded-lg text-xs font-bold text-success mt-1">
                            <span>Est. Batch Revenue:</span>
                            <span className="text-sm font-black">
                              ₹
                              {(
                                targetEnrolledStudents.length * totalClassFeePerStudent
                              ).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg font-medium">
                        No specific fee components pre-configured for this class. Standard fee structure will be applied.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Target Billing Month Section */}
              <div className="space-y-1.5 bg-muted/20 p-3.5 rounded-xl border border-border/50">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar className="h-4 w-4 text-primary" /> Target Billing Month
                </label>
                <Input
                  type="month"
                  className="h-10 text-xs font-bold mt-1"
                  value={generateMonth}
                  onChange={(e) => setGenerateMonth && setGenerateMonth(e.target.value)}
                />
              </div>

              {/* Invoice Due Date Section with Quick Presets */}
              <div className="space-y-1.5 bg-muted/20 p-3.5 rounded-xl border border-border/50">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="h-4 w-4 text-primary" /> Invoice Due Date
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 15);
                        setGenerateDueDate && setGenerateDueDate(d.toISOString().slice(0, 10));
                      }}
                      className="text-[10px] font-bold text-primary hover:underline bg-primary/10 px-1.5 py-0.5 rounded"
                    >
                      +15 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        const nextMonthLastDay = new Date(d.getFullYear(), d.getMonth() + 2, 0);
                        setGenerateDueDate &&
                          setGenerateDueDate(nextMonthLastDay.toISOString().slice(0, 10));
                      }}
                      className="text-[10px] font-bold text-primary hover:underline bg-primary/10 px-1.5 py-0.5 rounded"
                    >
                      Month End
                    </button>
                  </div>
                </div>

                <Input
                  type="date"
                  className="h-10 text-xs font-bold mt-1"
                  value={generateDueDate}
                  onChange={(e) => setGenerateDueDate && setGenerateDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 border-t border-border flex justify-end gap-2.5">
              <Button
                variant="outline"
                onClick={handleCloseGenerateModal}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateInvoices}
                disabled={isGenerating || !generateClassId}
                className="gap-2 font-bold"
              >
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin text-primary-foreground" />
                    Generating Invoices...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Student Invoices
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeesUI;
