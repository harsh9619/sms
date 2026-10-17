import type { FeeRecord } from "../../../types";
import {
  ClassFeeStructureItem,
  FeePaymentScheduleItem,
  SchoolFeeSettings,
  FeeStatsResponse,
} from "../../../Services/fee.service";

export type {
  ClassFeeStructureItem,
  FeePaymentScheduleItem,
  SchoolFeeSettings,
  FeeStatsResponse,
  FeeRecord,
};

export * from "../../../constants/fee";

export interface FeesUIProps {
  fees: FeeRecord[];
  classFeeStructures?: ClassFeeStructureItem[];
  feeSchedules?: FeePaymentScheduleItem[];
  schoolSettings?: SchoolFeeSettings | null;
  feeStats?: FeeStatsResponse | null;
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
  activeSubTab?: "invoices" | "schedules" | "structures" | "analytics";
  setActiveSubTab?: (tab: "invoices" | "schedules" | "structures" | "analytics") => void;

  // Payment Schedules (V2)
  scheduleSessionFilter?: string;
  setScheduleSessionFilter?: (val: string) => void;
  scheduleFormatFilter?: string;
  setScheduleFormatFilter?: (val: string) => void;
  showScheduleModal?: boolean;
  setShowScheduleModal?: (show: boolean) => void;
  editingScheduleItem?: FeePaymentScheduleItem | null;
  setEditingScheduleItem?: (item: FeePaymentScheduleItem | null) => void;
  handleSaveScheduleItem?: (data: any) => void;
  handleDeleteScheduleItem?: (id: string) => void;
  handleGenerateDefaultSchedule?: (sessionStart: "april" | "july", format: "monthly" | "quarterly") => void;
  handleUpdateSchoolSettings?: (settings: { feeSessionStart?: string; feeFrequency?: string }) => void;
  isGeneratingSchedule?: boolean;

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

  // Month & Schedule Filtering
  monthFilter?: string;
  setMonthFilter?: (val: string) => void;
  sessionFilter?: string;
  setSessionFilter?: (val: string) => void;

  // Active Receipt View Modal
  activeReceipt?: any;
  setActiveReceipt?: (receipt: any) => void;
  handleViewReceipt?: (fee: FeeRecord) => void;

  // Auto Generate Invoices Modal (V2)
  showGenerateModal?: boolean;
  setShowGenerateModal?: (show: boolean) => void;
  generateClassId?: string;
  setGenerateClassId?: (val: string) => void;
  generateDueDate?: string;
  setGenerateDueDate?: (val: string) => void;
  generateMonth?: string;
  setGenerateMonth?: (val: string) => void;
  generateScheduleId?: string;
  setGenerateScheduleId?: (val: string) => void;
  generateInstallmentName?: string;
  setGenerateInstallmentName?: (val: string) => void;
  generateMultiplier?: number;
  setGenerateMultiplier?: (val: number) => void;
  generateSessionStart?: string;
  setGenerateSessionStart?: (val: string) => void;
  generateFormat?: string;
  setGenerateFormat?: (val: string) => void;
  generateIsEntireYear?: boolean;
  setGenerateIsEntireYear?: (val: boolean) => void;
  handleGenerateInvoices?: () => void;
  isGenerating?: boolean;
}
