import httpService from "Services/http.service";
import type { FeeRecord } from "../types";

export interface ClassFeeStructureItem {
  id: string;
  schoolId: string;
  classMasterId: string;
  className: string;
  feeType: string;
  feeName: string;
  amount: number;
  frequency: string;
  dueDay: number;
  month?: string;
  isMandatory: boolean;
  description?: string;
}

export interface FeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  feeType?: string;
  month?: string;
  studentId?: string;
  schoolId?: string;
}

export interface PaginatedFeeResponse {
  data: FeeRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const feeService = {
  getFees: async (params?: FeeQueryParams): Promise<FeeRecord[] | PaginatedFeeResponse> => {
    const queryParts: string[] = [];
    if (params) {
      if (params.page !== undefined) queryParts.push(`page=${params.page}`);
      if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.status && params.status !== "all") queryParts.push(`status=${encodeURIComponent(params.status)}`);
      if (params.feeType && params.feeType !== "all") queryParts.push(`feeType=${encodeURIComponent(params.feeType)}`);
      if (params.month && params.month !== "all") queryParts.push(`month=${encodeURIComponent(params.month)}`);
      if (params.studentId) queryParts.push(`studentId=${encodeURIComponent(params.studentId)}`);
    }

    const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    const schoolId = params?.schoolId || "1";
    return httpService.get<any>(`/api/${schoolId}/fees${queryString}`);
  },

  createFee: async (fee: any): Promise<FeeRecord> => {
    return httpService.post<FeeRecord>("/api/fees", fee);
  },

  updateFee: async (id: string, fee: any): Promise<FeeRecord> => {
    return httpService.put<FeeRecord>(`/api/fees/${id}`, fee);
  },

  deleteFee: async (id: string): Promise<any> => {
    return httpService.delete(`/api/fees/${id}`);
  },

  // Class-wise Fee Structure APIs
  getClassFeeStructures: async (schoolId = "1", classMasterId?: string): Promise<ClassFeeStructureItem[]> => {
    const query = classMasterId ? `?classMasterId=${classMasterId}` : "";
    return httpService.get<ClassFeeStructureItem[]>(`/api/${schoolId}/fees/structures/all${query}`);
  },

  saveClassFeeStructure: async (schoolId = "1", data: any): Promise<any> => {
    return httpService.post(`/api/${schoolId}/fees/structures`, data);
  },

  deleteClassFeeStructure: async (schoolId = "1", id: string): Promise<any> => {
    return httpService.delete(`/api/${schoolId}/fees/structures/${id}`);
  },

  generateClassInvoices: async (schoolId = "1", classMasterId: string, dueDate?: string, month?: string): Promise<any> => {
    return httpService.post(`/api/${schoolId}/fees/generate-invoices`, { classMasterId, dueDate, month });
  },

  downloadFeeReceiptPdf: async (feeId: string, feeRecord?: any, allFeesList?: any[]): Promise<void> => {
    try {
      const response = await fetch(`/api/fees/${feeId}/download-pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fee-receipt-${feeId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn("Backend PDF fetch failed, falling back to client jsPDF", err);
    }

    let monthFeeItems: any[] = [];
    if (feeRecord && feeRecord.studentId && feeRecord.month && Array.isArray(allFeesList)) {
      monthFeeItems = allFeesList.filter(
        (f) => String(f.studentId) === String(feeRecord.studentId) && f.month === feeRecord.month
      );
    }

    await generateClientFeePdf(feeRecord || { id: feeId }, monthFeeItems);
  },

  downloadMonthlyFeeReceiptPdf: async (studentId: string, month: string, feeItems?: any[]): Promise<void> => {
    try {
      const response = await fetch(`/api/fees/monthly-receipt-pdf?studentId=${studentId}&month=${month}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `monthly-fee-receipt-${month}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn("Backend PDF fetch failed, falling back to client jsPDF", err);
    }
    await generateClientFeePdf({ studentId, month }, feeItems);
  },
};

export const generateClientFeePdf = async (feeInput: any, monthFeeItems?: any[]) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const items = Array.isArray(monthFeeItems) && monthFeeItems.length > 0 ? monthFeeItems : [feeInput];
  const firstFee = items[0] || feeInput;
  const totalAmt = items.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const doc = new jsPDF();
  doc.setFillColor(4, 120, 87);
  doc.rect(14, 14, 182, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SCHOOL MANAGEMENT SYSTEM", 20, 26);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("OFFICIAL CONSOLIDATED MONTHLY FEE RECEIPT", 20, 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt: #REC-${firstFee.id || "N/A"}`, 140, 24);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Due: ${firstFee.dueDate ? new Date(firstFee.dueDate).toLocaleDateString() : "N/A"}`, 140, 30);
  doc.text(`Status: ${(firstFee.status || "pending").toUpperCase()}`, 140, 36);

  doc.setDrawColor(187, 247, 208);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, 44, 182, 32, 2, 2, "FD");

  doc.setTextColor(4, 120, 87);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT INFORMATION", 20, 52);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(`Student Name: ${firstFee.studentName || "N/A"}`, 20, 60);
  doc.text(`Class & Div: ${firstFee.class || "N/A"}`, 20, 67);
  doc.text(`Roll / ID: ${firstFee.rollNumber || firstFee.studentId || "N/A"}`, 110, 60);
  doc.text(`Billing Month: ${firstFee.month || "N/A"}`, 110, 67);

  const tableBody = items.map((f) => [
    (f.type || f.feeType || "Tuition Fee").toUpperCase(),
    f.remarks || `Standard Monthly Fee (${firstFee.month || "Current"})`,
    `₹${Number(f.amount || 0).toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 82,
    head: [["Fee Type / Head", "Remarks / Note", "Amount (₹)"]],
    body: tableBody,
    headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9 },
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 130;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, finalY, 182, 20, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87);
  doc.text("TOTAL MONTHLY AMOUNT:", 20, finalY + 13);
  doc.setTextColor(
    firstFee.status === "paid" ? 22 : 217,
    firstFee.status === "paid" ? 163 : 119,
    firstFee.status === "paid" ? 74 : 6
  );
  doc.setFontSize(13);
  doc.text(`₹${totalAmt.toLocaleString()}`, 150, finalY + 13);

  doc.save(`monthly-fee-receipt-${firstFee.studentName || "student"}-${firstFee.month || "month"}.pdf`);
};

export default feeService;
