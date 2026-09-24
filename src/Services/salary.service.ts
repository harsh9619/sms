import httpService from "Services/http.service";
import type { SalaryRecord } from "../types";

export interface StaffSalaryStructureItem {
  id: string;
  schoolId: string;
  teacherId: string;
  teacherName: string;
  email: string;
  phone?: string;
  basicSalary: number;
  hra: number;
  da: number;
  otherAllowance: number;
  pfDeduction: number;
  taxDeduction: number;
  grossSalary: number;
  netSalary: number;
  effectiveFrom: string;
  isActive: boolean;
}

export interface SalaryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  teacherId?: string;
  schoolId?: string;
  academicYear?: string;
}

export interface PaginatedSalaryResponse {
  data: SalaryRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const salaryService = {
  getSalaries: async (params?: SalaryQueryParams): Promise<SalaryRecord[] | PaginatedSalaryResponse> => {
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined) queryParts.push(`page=${params.page}`);
      if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.status && params.status !== "all") queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params.teacherId) queryParts.push(`teacherId=${encodeURIComponent(params.teacherId)}`);
      if (params.academicYear) queryParts.push(`academicYear=${encodeURIComponent(params.academicYear)}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const schoolId = params?.schoolId || "1";
    return httpService.get<any>(`/api/${schoolId}/salaries${queryString}`);
  },

  createSalary: async (sal: any): Promise<SalaryRecord> => {
    return httpService.post<SalaryRecord>("/api/salaries", sal);
  },

  updateSalary: async (id: string, sal: any): Promise<SalaryRecord> => {
    return httpService.put<SalaryRecord>(`/api/salaries/${id}`, sal);
  },

  deleteSalary: async (id: string): Promise<any> => {
    return httpService.delete(`/api/salaries/${id}`);
  },

  // Staff Salary Structure APIs
  getSalaryStructures: async (schoolId = "1", teacherId?: string): Promise<StaffSalaryStructureItem[]> => {
    const query = teacherId ? `?teacherId=${teacherId}` : "";
    return httpService.get<StaffSalaryStructureItem[]>(`/api/${schoolId}/salaries/structures/all${query}`);
  },

  saveSalaryStructure: async (schoolId = "1", data: any): Promise<any> => {
    return httpService.post(`/api/${schoolId}/salaries/structures`, data);
  },

  deleteSalaryStructure: async (schoolId = "1", id: string): Promise<any> => {
    return httpService.delete(`/api/${schoolId}/salaries/structures/${id}`);
  },

  generateMonthlyPayroll: async (schoolId = "1", month: number, year: number): Promise<any> => {
    return httpService.post(`/api/${schoolId}/salaries/generate-payroll`, { month, year });
  },

  downloadSalarySlipPdf: async (salaryId: string, salaryRecord?: any): Promise<void> => {
    try {
      const response = await fetch(`/api/salaries/${salaryId}/download-pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `salary-slip-${salaryId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn("Backend PDF fetch failed, falling back to client jsPDF", err);
    }
    await generateClientSalaryPdf(salaryRecord || { id: salaryId });
  },
};

export const generateClientSalaryPdf = async (sal: any) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  doc.setFillColor(30, 64, 175);
  doc.rect(14, 14, 182, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SCHOOL MANAGEMENT SYSTEM", 20, 26);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("STAFF SALARY PAYSLIP", 20, 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Ref: #PAY-${sal.id || "N/A"}`, 140, 24);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${sal.month || ""} ${sal.year || ""}`, 140, 30);
  doc.text(`Status: ${(sal.status || "pending").toUpperCase()}`, 140, 36);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, 182, 32, 2, 2, "FD");

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STAFF DETAILS", 20, 52);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(`Staff Name: ${sal.teacherName || "N/A"}`, 20, 60);
  doc.text(`Role: ${sal.designation || "Faculty Member"}`, 20, 67);
  doc.text(`Email: ${sal.teacherEmail || "N/A"}`, 110, 60);
  doc.text(`Phone: ${sal.teacherPhone || "N/A"}`, 110, 67);

  const base = Number(sal.baseSalary || 0);
  const allow = Number(sal.allowances || 0);
  const ded = Number(sal.deductions || 0);
  const gross = base + allow;
  const net = sal.netSalary || gross - ded;

  autoTable(doc, {
    startY: 82,
    head: [["Components", "Earnings (₹)", "Deductions (₹)"]],
    body: [
      ["Basic Salary Component", `₹${base.toLocaleString()}`, "-"],
      ["Allowances & Benefits", `₹${allow.toLocaleString()}`, "-"],
      ["Statutory & Tax Deductions", "-", `₹${ded.toLocaleString()}`],
    ],
    headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 130;

  doc.setFillColor(241, 245, 249);
  doc.rect(14, finalY, 182, 25, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Gross Pay: ₹${gross.toLocaleString()}`, 20, finalY + 10);
  doc.text(`Total Deductions: ₹${ded.toLocaleString()}`, 20, finalY + 18);

  doc.setTextColor(22, 163, 74);
  doc.setFontSize(12);
  doc.text(`NET PAYABLE: ₹${net.toLocaleString()}`, 115, finalY + 14);

  doc.save(`salary-slip-${sal.id || "record"}.pdf`);
};

export default salaryService;
