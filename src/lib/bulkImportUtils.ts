import * as XLSX from "xlsx";
import type { Student, Teacher } from "../types";

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: { row: number; error: string }[];
  message: string;
}

// ============ STUDENT IMPORT ============
export function importStudentsFromExcel(file: File): Promise<ImportResult<Student>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        const students: Student[] = [];
        const errors: { row: number; error: string }[] = [];

        rows.forEach((row: any, index: number) => {
          try {
            const student: Student = {
              id: `s${Date.now()}${Math.random()}`,
              name: row.Name || row.name || "",
              email: row.Email || row.email || "",
              phone: row.Phone || row.phone || "",
              class: row.Class || row.class || "",
              section: row.Section || row.section || "",
              rollNumber: (row["Roll No"] || row["Roll Number"] || row.rollNumber || "").toString(),
              parentName: row["Parent Name"] || row.parentName || "",
              parentPhone: row["Parent Phone"] || row.parentPhone || "",
              address: row.Address || row.address || "",
              dateOfBirth: row["Date of Birth"] || row.dateOfBirth || "",
              gender: (row.Gender?.toLowerCase() || "male") as "male" | "female" | "other",
              admissionDate: new Date().toISOString().split("T")[0],
              bloodGroup: row["Blood Group"] || row.bloodGroup,
            };

            if (!student.name || !student.email || !student.rollNumber) {
              errors.push({ row: index + 2, error: "Missing required fields: Name, Email, or Roll Number" });
            } else {
              students.push(student);
            }
          } catch (err) {
            errors.push({ row: index + 2, error: (err as Error).message });
          }
        });

        resolve({
          success: errors.length === 0,
          data: students,
          errors,
          message: `Imported ${students.length} students${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, error: (err as Error).message }],
          message: "Failed to parse Excel file",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function importStudentsFromCSV(file: File): Promise<ImportResult<Student>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const students: Student[] = [];
        const errors: { row: number; error: string }[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          try {
            const values = lines[i].split(",").map((v) => v.trim());
            const row: any = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx];
            });

            const student: Student = {
              id: `s${Date.now()}${Math.random()}`,
              name: row.Name || row.name || "",
              email: row.Email || row.email || "",
              phone: row.Phone || row.phone || "",
              class: row.Class || row.class || "",
              section: row.Section || row.section || "",
              rollNumber: (row["Roll No"] || row["Roll Number"] || row.rollNumber || "").toString(),
              parentName: row["Parent Name"] || row.parentName || "",
              parentPhone: row["Parent Phone"] || row.parentPhone || "",
              address: row.Address || row.address || "",
              dateOfBirth: row["Date of Birth"] || row.dateOfBirth || "",
              gender: (row.Gender?.toLowerCase() || "male") as "male" | "female" | "other",
              admissionDate: new Date().toISOString().split("T")[0],
              bloodGroup: row["Blood Group"] || row.bloodGroup,
            };

            if (!student.name || !student.email || !student.rollNumber) {
              errors.push({ row: i + 1, error: "Missing required fields: Name, Email, or Roll Number" });
            } else {
              students.push(student);
            }
          } catch (err) {
            errors.push({ row: i + 1, error: (err as Error).message });
          }
        }

        resolve({
          success: errors.length === 0,
          data: students,
          errors,
          message: `Imported ${students.length} students${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, error: (err as Error).message }],
          message: "Failed to parse CSV file",
        });
      }
    };
    reader.readAsText(file);
  });
}

// ============ TEACHER IMPORT ============
export function importTeachersFromExcel(file: File): Promise<ImportResult<Teacher>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        const teachers: Teacher[] = [];
        const errors: { row: number; error: string }[] = [];

        rows.forEach((row: any, index: number) => {
          try {
            const teacher: Teacher = {
              id: `t${Date.now()}${Math.random()}`,
              name: row.Name || row.name || "",
              email: row.Email || row.email || "",
              phone: row.Phone || row.phone || "",
              subject: row.Subject || row.subject || "",
              department: row.Department || row.department || "",
              qualification: row.Qualification || row.qualification || "",
              experience: row.Experience || row.experience || "",
              address: row.Address || row.address || "",
              joinDate: new Date().toISOString().split("T")[0],
              salary: row.Salary ? parseFloat(row.Salary) : undefined,
            };

            if (!teacher.name || !teacher.email || !teacher.subject) {
              errors.push({ row: index + 2, error: "Missing required fields: Name, Email, or Subject" });
            } else {
              teachers.push(teacher);
            }
          } catch (err) {
            errors.push({ row: index + 2, error: (err as Error).message });
          }
        });

        resolve({
          success: errors.length === 0,
          data: teachers,
          errors,
          message: `Imported ${teachers.length} teachers${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, error: (err as Error).message }],
          message: "Failed to parse Excel file",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

export function importTeachersFromCSV(file: File): Promise<ImportResult<Teacher>> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n");
        const headers = lines[0].split(",").map((h) => h.trim());

        const teachers: Teacher[] = [];
        const errors: { row: number; error: string }[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;

          try {
            const values = lines[i].split(",").map((v) => v.trim());
            const row: any = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx];
            });

            const teacher: Teacher = {
              id: `t${Date.now()}${Math.random()}`,
              name: row.Name || row.name || "",
              email: row.Email || row.email || "",
              phone: row.Phone || row.phone || "",
              subject: row.Subject || row.subject || "",
              department: row.Department || row.department || "",
              qualification: row.Qualification || row.qualification || "",
              experience: row.Experience || row.experience || "",
              address: row.Address || row.address || "",
              joinDate: new Date().toISOString().split("T")[0],
              salary: row.Salary ? parseFloat(row.Salary) : undefined,
            };

            if (!teacher.name || !teacher.email || !teacher.subject) {
              errors.push({ row: i + 1, error: "Missing required fields: Name, Email, or Subject" });
            } else {
              teachers.push(teacher);
            }
          } catch (err) {
            errors.push({ row: i + 1, error: (err as Error).message });
          }
        }

        resolve({
          success: errors.length === 0,
          data: teachers,
          errors,
          message: `Imported ${teachers.length} teachers${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
        });
      } catch (err) {
        resolve({
          success: false,
          data: [],
          errors: [{ row: 0, error: (err as Error).message }],
          message: "Failed to parse CSV file",
        });
      }
    };
    reader.readAsText(file);
  });
}

// ============ SAMPLE DATA GENERATORS ============
export function generateStudentTemplate(): void {
  const sampleData = [
    {
      Name: "John Doe",
      Email: "john@school.com",
      Phone: "9876543210",
      "Roll No": "101",
      Class: "10-A",
      Section: "A",
      "Parent Name": "Jane Doe",
      "Parent Phone": "9876543200",
      Address: "123 Main St",
      "Date of Birth": "2010-01-15",
      Gender: "male",
      "Blood Group": "O+",
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, "Students");
  XLSX.writeFile(wb, "students_template.xlsx");
}

export function generateTeacherTemplate(): void {
  const sampleData = [
    {
      Name: "Mr. Smith",
      Email: "smith@school.com",
      Phone: "9876543210",
      Subject: "Mathematics",
      Department: "Science",
      Qualification: "M.Sc",
      Experience: "5 years",
      Address: "456 Oak Ave",
      Salary: "50000",
    },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, "Teachers");
  XLSX.writeFile(wb, "teachers_template.xlsx");
}
