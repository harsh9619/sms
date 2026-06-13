import * as XLSX from "xlsx";
import type { FeeRecord, SalaryRecord, AttendanceRecord } from "../types";

// ============ SIMPLE PDF GENERATION ============
// Since we don't have a PDF library yet, we'll use a simple HTML to image approach
// For now, we'll export to Excel and generate a formatted view

export interface ReportGeneratorOptions {
  title: string;
  subtitle?: string;
  date?: string;
  generatedBy?: string;
}

// ============ FEE REPORT ============
export function generateFeeReport(
  records: FeeRecord[],
  options: ReportGeneratorOptions
): void {
  const data = records.map((fee) => ({
    "Roll No": fee.rollNumber,
    "Student Name": fee.studentName,
    Class: `${fee.class}-${fee.section}`,
    "Fee Type": fee.feeType.toUpperCase(),
    Amount: fee.amount,
    "Due Date": fee.dueDate,
    "Paid Date": fee.paidDate || "N/A",
    Status: fee.status.toUpperCase(),
    Remarks: fee.remarks || "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Add title row
  XLSX.utils.sheet_add_aoa(
    ws,
    [[options.title], [options.subtitle || ""], [options.date || new Date().toLocaleDateString()]],
    { origin: "A1" }
  );

  XLSX.utils.book_append_sheet(wb, ws, "Fee Report");
  XLSX.writeFile(wb, `fee_report_${new Date().getTime()}.xlsx`);
}

export function generateFeeSummaryReport(records: FeeRecord[]): void {
  // Group by status
  const pending = records.filter((r) => r.status === "pending");
  const paid = records.filter((r) => r.status === "paid");
  const overdue = records.filter((r) => r.status === "overdue");

  const summaryData = [
    { Status: "Pending", Count: pending.length, Amount: pending.reduce((s, r) => s + r.amount, 0) },
    { Status: "Paid", Count: paid.length, Amount: paid.reduce((s, r) => s + r.amount, 0) },
    { Status: "Overdue", Count: overdue.length, Amount: overdue.reduce((s, r) => s + r.amount, 0) },
    {
      Status: "Total",
      Count: records.length,
      Amount: records.reduce((s, r) => s + r.amount, 0),
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, "Fee Summary");
  XLSX.writeFile(wb, `fee_summary_${new Date().getTime()}.xlsx`);
}

// ============ SALARY REPORT ============
export function generateSalaryReport(
  records: SalaryRecord[],
  options: ReportGeneratorOptions
): void {
  const data = records.map((salary) => ({
    "Teacher Name": salary.teacherName,
    Subject: salary.subject,
    "Base Salary": salary.baseSalary,
    Allowances: salary.allowances,
    Deductions: salary.deductions,
    "Net Salary": salary.baseSalary + salary.allowances - salary.deductions,
    Month: salary.month,
    Year: salary.year,
    Status: salary.status.toUpperCase(),
    "Paid Date": salary.paidDate || "N/A",
    Remarks: salary.remarks || "",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Salary Report");
  XLSX.writeFile(wb, `salary_report_${new Date().getTime()}.xlsx`);
}

export function generateSalarySummaryReport(records: SalaryRecord[]): void {
  const pending = records.filter((r) => r.status === "pending");
  const paid = records.filter((r) => r.status === "paid");
  const processing = records.filter((r) => r.status === "processing");

  const calculateNetSalary = (r: SalaryRecord) => r.baseSalary + r.allowances - r.deductions;

  const summaryData = [
    {
      Status: "Pending",
      Count: pending.length,
      "Total Amount": pending.reduce((s, r) => s + calculateNetSalary(r), 0),
    },
    {
      Status: "Paid",
      Count: paid.length,
      "Total Amount": paid.reduce((s, r) => s + calculateNetSalary(r), 0),
    },
    {
      Status: "Processing",
      Count: processing.length,
      "Total Amount": processing.reduce((s, r) => s + calculateNetSalary(r), 0),
    },
    {
      Status: "Total",
      Count: records.length,
      "Total Amount": records.reduce((s, r) => s + calculateNetSalary(r), 0),
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, "Salary Summary");
  XLSX.writeFile(wb, `salary_summary_${new Date().getTime()}.xlsx`);
}

// ============ ATTENDANCE REPORT ============
export function generateAttendanceReport(
  records: AttendanceRecord[],
  options: ReportGeneratorOptions
): void {
  const data = records.map((att) => ({
    "Roll No": att.rollNumber,
    "Student Name": att.studentName,
    Class: `${att.class}-${att.section}`,
    Date: att.date,
    Status: att.status.toUpperCase(),
    "Marked By": att.markedBy,
    "Marked At": att.markedAt,
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
  XLSX.writeFile(wb, `attendance_report_${new Date().getTime()}.xlsx`);
}

export function generateAttendanceSummaryReport(records: AttendanceRecord[]): void {
  const uniqueStudents = [...new Set(records.map((r) => r.studentId))];

  const summaryData = uniqueStudents.map((studentId) => {
    const studentRecords = records.filter((r) => r.studentId === studentId);
    const present = studentRecords.filter((r) => r.status === "present").length;
    const absent = studentRecords.filter((r) => r.status === "absent").length;
    const late = studentRecords.filter((r) => r.status === "late").length;
    const total = studentRecords.length;
    const percentage = ((present / total) * 100).toFixed(2);

    return {
      "Student Name": studentRecords[0]?.studentName || "Unknown",
      "Roll Number": studentRecords[0]?.rollNumber || "",
      Present: present,
      Absent: absent,
      Late: late,
      Total: total,
      "Attendance %": `${percentage}%`,
    };
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance Summary");
  XLSX.writeFile(wb, `attendance_summary_${new Date().getTime()}.xlsx`);
}

// ============ GENERATE HTML FOR PDF CONVERSION ============
export function generateReportHTML(
  data: any[],
  title: string,
  columns: string[]
): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; color: #333; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #3b82f6;
          color: white;
          padding: 10px;
          text-align: left;
          border: 1px solid #ddd;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f5f5f5;
        }
        .summary {
          margin-top: 30px;
          padding: 15px;
          background-color: #f0f0f0;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${columns.map((col) => `<th>${col}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${data
            .map(
              (row) => `
            <tr>
              ${columns.map((col) => `<td>${row[col] || ""}</td>`).join("")}
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;
  return html;
}
