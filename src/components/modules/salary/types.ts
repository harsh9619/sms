import type { SalaryRecord } from "../../../types";
import { StaffSalaryStructureItem } from "../../../Services/salary.service";

export interface SalaryUIProps {
  salaries: SalaryRecord[];
  salaryStructures?: StaffSalaryStructureItem[];
  teachers?: any[];
  loading?: boolean;
  error?: string | null;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: any) => void;
  isMySalary?: boolean;
  selectedPayslip?: SalaryRecord | null;
  setSelectedPayslip?: (sal: SalaryRecord | null) => void;

  // Add/Edit Salary Record Modal
  showAddEditModal?: boolean;
  setShowAddEditModal?: (show: boolean) => void;
  editingSalary?: SalaryRecord | null;
  formData?: any;
  setFormData?: (data: any) => void;
  formError?: string | null;
  handleSaveSalary?: () => void;
  handleDeleteSalary?: (id: string) => void;
  handleOpenAddModal?: () => void;
  handleOpenEditModal?: (sal: SalaryRecord) => void;
  handleExportExcel?: () => void;
  handleExportSummary?: () => void;
  userName?: string;

  // Sub-Tab Switcher
  activeSubTab?: "registries" | "structures";
  setActiveSubTab?: (tab: "registries" | "structures") => void;

  // Staff Salary Structure Actions
  showStructModal?: boolean;
  setShowStructModal?: (show: boolean) => void;
  editingStruct?: StaffSalaryStructureItem | null;
  structFormData?: any;
  setStructFormData?: (data: any) => void;
  handleSaveStruct?: () => void;
  handleDeleteStruct?: (id: string) => void;
  handleOpenAddStructModal?: () => void;
  handleOpenEditStructModal?: (item: StaffSalaryStructureItem) => void;

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

  // Generate Monthly Payroll Modal
  showPayrollModal?: boolean;
  setShowPayrollModal?: (show: boolean) => void;
  payrollMonth?: number;
  setPayrollMonth?: (val: number) => void;
  payrollYear?: number;
  setPayrollYear?: (val: number) => void;
  handleGeneratePayroll?: () => void;
  isGenerating?: boolean;
}
