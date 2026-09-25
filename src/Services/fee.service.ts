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

  payStudentFeeBundle: async (schoolId = "1", payload: {
    studentId: string;
    feeIds: (string | number)[];
    paymentMethod?: string;
    remarks?: string;
    paidDate?: string;
  }): Promise<{ success: boolean; receiptNumber: string; totalAmount: number; monthsCovered: string }> => {
    return httpService.post(`/api/${schoolId}/fees/pay-bundle`, payload);
  },

  getReceiptByNumber: async (receiptNumber: string): Promise<any> => {
    return httpService.get(`/api/fees/receipts/${receiptNumber}`);
  },

  downloadReceiptPdfByNumber: async (receiptNumber: string): Promise<void> => {
    try {
      const response = await fetch(`/api/fees/receipts/${receiptNumber}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fee-receipt-${receiptNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
    } catch (err) {
      console.warn("Backend PDF fetch failed by receipt number", err);
    }
  },

  downloadFeeReceiptPdf: async (feeId: string, feeRecord?: any, allFeesList?: any[]): Promise<void> => {
    try {
      if (feeRecord?.receiptNumber) {
        return await feeService.downloadReceiptPdfByNumber(feeRecord.receiptNumber);
      }
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

  let items: any[] = [];
  if (Array.isArray(monthFeeItems) && monthFeeItems.length > 0) {
    items = monthFeeItems;
  } else if (feeInput && Array.isArray(feeInput.items) && feeInput.items.length > 0) {
    items = feeInput.items;
  } else if (Array.isArray(feeInput)) {
    items = feeInput;
  } else {
    items = [feeInput];
  }

  const firstFee = items[0] || feeInput;
  const studentName = feeInput.studentName || firstFee.studentName || "Student";
  const rollNumber = feeInput.rollNumber || firstFee.rollNumber || firstFee.studentId || "N/A";
  const className = feeInput.class || firstFee.class || "N/A";
  const billingMonth = feeInput.month || firstFee.month || "Current";
  const receiptNo = feeInput.receiptNo || (firstFee.id ? `REC-${firstFee.id}` : "REC-OFFICIAL");
  const dueDateStr = feeInput.dueDate || firstFee.dueDate;
  const statusStr = (feeInput.status || firstFee.status || "pending").toUpperCase();
  const paymentMethodStr = feeInput.paymentMethod || "Online Gateway / Settlement";

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
  doc.text("OFFICIAL CONSOLIDATED FEE RECEIPT / INVOICE", 20, 34);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt: #${receiptNo}`, 135, 24);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Due: ${dueDateStr ? new Date(dueDateStr).toLocaleDateString() : "N/A"}`, 135, 30);
  doc.text(`Status: ${statusStr}`, 135, 36);

  doc.setDrawColor(187, 247, 208);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, 44, 182, 34, 2, 2, "FD");

  doc.setTextColor(4, 120, 87);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("STUDENT & PAYMENT INFORMATION", 20, 52);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.text(`Student Name: ${studentName}`, 20, 60);
  doc.text(`Class & Div: ${className}`, 20, 67);
  doc.text(`Payment Mode: ${paymentMethodStr}`, 20, 74);

  doc.text(`Roll / ID: ${rollNumber}`, 110, 60);
  doc.text(`Billing Period: ${billingMonth}`, 110, 67);

  const tableBody = items.map((f, idx) => [
    idx + 1,
    (f.label || f.type || f.feeType || "Tuition Fee").toUpperCase(),
    f.remarks || `Selected Fee Component (${billingMonth})`,
    `₹${Number(f.amount || 0).toLocaleString("en-IN")}`,
  ]);

  autoTable(doc, {
    startY: 84,
    head: [["#", "Selected Fee Type / Category", "Remarks / Description", "Amount (₹)"]],
    body: tableBody,
    headStyles: { fillColor: [4, 120, 87], textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 55, fontStyle: "bold" },
      2: { cellWidth: 70 },
      3: { cellWidth: 42, halign: "right", fontStyle: "bold" },
    },
  });

  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 140;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, finalY, 182, 22, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87);
  doc.text("TOTAL AMOUNT PAID / SETTLED:", 20, finalY + 14);
  doc.setTextColor(
    statusStr === "PAID" ? 22 : 217,
    statusStr === "PAID" ? 163 : 119,
    statusStr === "PAID" ? 74 : 6
  );
  doc.setFontSize(14);
  doc.text(`₹${totalAmt.toLocaleString("en-IN")}`, 145, finalY + 14);

  doc.save(`fee-receipt-${studentName.replace(/\s+/g, "_")}-${billingMonth}.pdf`);
};

export default feeService;
