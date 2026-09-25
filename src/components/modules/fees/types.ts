import type { FeeRecord } from "../../../types";
import { ClassFeeStructureItem } from "../../../Services/fee.service";

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

  // Active Receipt View Modal
  activeReceipt?: any;
  setActiveReceipt?: (receipt: any) => void;
  handleViewReceipt?: (fee: FeeRecord) => void;

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
