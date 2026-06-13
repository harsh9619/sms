import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { fetchAttendance, fetchStudents } from "../../lib/api";
import type { AttendanceRecord } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import Tesseract from "tesseract.js";
import * as XLSX from "xlsx";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../lib/imageUtils";
import { transliterateHindiToEnglish } from "../../lib/transliterate";
import {
  Camera,
  Upload,
  Download,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  ImagePlus,
  Table2,
  ChevronRight,
  XCircle,
  Clock,
  Loader2,
  ClipboardCheck,
  Zap,
  Eye,
  X,
  AlertTriangle,
  Crop,
  RotateCcw,
  Maximize,
} from "lucide-react";

export function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterClass, setFilterClass] = useState("");
  const [activeTab, setActiveTab] = useState<"records" | "manual">("records");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });

  const filteredAttendance = attendance.filter((a) => {
    const matchDate = a.date === filterDate;
    const matchClass = !filterClass || a.class === filterClass;
    return matchDate && matchClass;
  });

  const presentCount = filteredAttendance.filter((a) => a.status === "present").length;
  const absentCount = filteredAttendance.filter((a) => a.status === "absent").length;
  const lateCount = filteredAttendance.filter((a) => a.status === "late").length;

  // Export attendance records to Excel
  const exportToExcel = useCallback(() => {
    const data = filteredAttendance.map((a) => ({
      "Roll Number": a.rollNumber,
      "Student Name": a.studentName,
      "Class": `${a.class}-${a.section}`,
      "Status": a.status.charAt(0).toUpperCase() + a.status.slice(1),
      "Date": a.date,
      "Marked By": a.markedBy,
      "Marked At": a.markedAt,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `attendance_${filterDate}.xlsx`);
  }, [filteredAttendance, filterDate]);

  const handleBulkImport = (newRecords: AttendanceRecord[]) => {
    setAttendance((prev) => [...prev, ...newRecords]);
    setImportStatus({
      visible: true,
      success: true,
      message: `Successfully imported ${newRecords.length} attendance record${newRecords.length !== 1 ? "s" : ""}!`,
    });
    setTimeout(() => setImportStatus((s) => ({ ...s, visible: false })), 4000);
  };

  // Manual attendance
  const [manualAttendance, setManualAttendance] = useState<Record<string, "present" | "absent" | "late">>({});
  const { activeSchool } = useSchool();

  React.useEffect(() => {
    let mounted = true;
    fetchAttendance()
      .then((d) => { if (mounted) setAttendance(d); })
      .catch(() => { /* keep mock attendance */ });
    fetchStudents()
      .then((d) => { if (mounted) setStudents(d); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [activeSchool]);

  const handleManualSave = () => {
    const newRecords: AttendanceRecord[] = Object.entries(manualAttendance).map(([studentId, status]) => {
      const student = students.find((s) => s.id === studentId);
      return {
        id: `manual-${Date.now()}-${studentId}`,
        studentId,
        studentName: student?.name || "",
        rollNumber: student?.rollNumber || "",
        class: student?.class || "",
        section: student?.section || "",
        date: filterDate,
        status,
        markedBy: "Manual Entry",
        markedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
    });

    setAttendance((prev) => [...prev, ...newRecords]);
    setManualAttendance({});
    setActiveTab("records");
  };

  const statusIcon = (status: string) => {
    if (status === "present") return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === "absent") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-warning" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            Attendance Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Mark, track, and export attendance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkUpload(true)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-success">{presentCount}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-success/30" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-destructive">{absentCount}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive/30" />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Late</p>
              <p className="text-2xl font-bold text-warning">{lateCount}</p>
            </div>
            <Clock className="h-8 w-8 text-warning/30" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {[
          { id: "records" as const, label: "Records", icon: ClipboardCheck },
          { id: "manual" as const, label: "Manual Entry", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-auto"
            />
            <select
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
            >
              <option value="">All Classes</option>
              {["8", "9", "10", "11", "12"].map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tab Content */}
      {activeTab === "records" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Student</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Roll No</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Class</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Marked By</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{record.studentName}</td>
                      <td className="px-6 py-4"><Badge variant="outline">{record.rollNumber}</Badge></td>
                      <td className="px-6 py-4 text-sm">{record.class}-{record.section}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {statusIcon(record.status)}
                          <Badge
                            variant={
                              record.status === "present" ? "success" :
                              record.status === "absent" ? "destructive" : "warning"
                            }
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{record.markedBy}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{record.markedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredAttendance.length === 0 && (
              <div className="text-center py-12">
                <ClipboardCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No attendance records for this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Mark Attendance Manually
            </CardTitle>
            <CardDescription>Select the class and mark attendance for each student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.filter((s) => !filterClass || s.class === filterClass).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{student.rollNumber}</Badge>
                    <div>
                      <p className="text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">Class {student.class}-{student.section}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(["present", "absent", "late"] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={manualAttendance[student.id] === status ? "default" : "outline"}
                        className={
                          manualAttendance[student.id] === status
                            ? status === "present"
                              ? "bg-success hover:bg-success/90"
                              : status === "absent"
                              ? "bg-destructive hover:bg-destructive/90"
                              : "bg-warning hover:bg-warning/90"
                            : ""
                        }
                        onClick={() =>
                          setManualAttendance((prev) => ({ ...prev, [student.id]: status }))
                        }
                      >
                        {status === "present" ? "P" : status === "absent" ? "A" : "L"}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(manualAttendance).length > 0 && (
                <Button className="w-full" onClick={handleManualSave}>
                  Save Attendance ({Object.keys(manualAttendance).length} students)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkAttendanceModal
          onClose={() => setShowBulkUpload(false)}
          onImport={handleBulkImport}
          students={students}
          filterDate={filterDate}
          filterClass={filterClass}
        />
      )}

      {/* Import Status Toast */}
      {importStatus.visible && (
        <div
          className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg flex gap-3 items-start animate-slide-up bg-green-50 border border-green-200`}
        >
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">
              {importStatus.message}
            </p>
          </div>
          <button
            onClick={() => setImportStatus({ ...importStatus, visible: false })}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── BulkAttendanceModal ───────────────────────────────────────────────────────

interface BulkAttendanceRow {
  id: string;
  rollNumber: string;
  studentName: string;
  status: "present" | "absent" | "late";
  date: string;
  class: string;
  section: string;
  studentId?: string;
  errors: string[];
}

const ATTENDANCE_COLUMN_MAP: Record<string, keyof BulkAttendanceRow> = {
  "roll no": "rollNumber",
  "rollno": "rollNumber",
  "rollnumber": "rollNumber",
  "roll number": "rollNumber",
  "प्रवेश क्रमांक": "rollNumber",
  "प्रवेशक्रमांक": "rollNumber",
  "प्रवेश संख्या": "rollNumber",
  "प्रवेशसंख्या": "rollNumber",
  "क्रमांक": "rollNumber",
  "s.no": "rollNumber",
  "s.no.": "rollNumber",
  "sno": "rollNumber",
  
  "name": "studentName",
  "student name": "studentName",
  "studentname": "studentName",
  "full name": "studentName",
  "नाम": "studentName",
  "छात्र का नाम": "studentName",
  
  "status": "status",
  "attendance": "status",
  "उपस्थिति": "status",
  "स्थिति": "status",
  
  "date": "date",
  "दिनांक": "date",
  "तारीख": "date",
  
  "class": "class",
  "कक्षा": "class",
  
  "section": "section",
  "वर्ग": "section"
};

function normalizeAttendanceKey(raw: string): keyof BulkAttendanceRow | null {
  const clean = raw.trim().toLowerCase().replace(/[_\-]/g, " ");
  return ATTENDANCE_COLUMN_MAP[clean] ?? null;
}

function validateAttendanceRow(row: Partial<BulkAttendanceRow>, students: any[]): string[] {
  const errs: string[] = [];

  if (!row.rollNumber?.trim()) {
    errs.push("Roll number required");
  } else {
    const matched = students.find(
      (s) => s.rollNumber.trim().toLowerCase() === row.rollNumber?.trim().toLowerCase()
    );
    if (!matched) {
      errs.push("Roll number not found");
    }
  }

  if (!row.status) {
    errs.push("Status required");
  } else if (!["present", "absent", "late"].includes(row.status)) {
    errs.push("Invalid status");
  }

  return errs;
}

async function extractAttendanceFromImage(
  file: File | string,
  students: any[]
): Promise<BulkAttendanceRow[]> {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(file, "hin+eng", {
      logger: (m) => console.log("Tesseract progress:", m),
    });

    console.log("OCR RESULT:", text);

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsedRows: BulkAttendanceRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const tokens = line
        .split(/[\s|\[\]\/\\:;\t]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      if (tokens.length === 0) continue;

      let rollNumber = "";
      let status: "present" | "absent" | "late" = "present";
      let extractedName = "";

      for (const token of tokens) {
        const lower = token.toLowerCase();
        if (lower === "absent" || lower === "a" || token.includes("अनुपस्थित")) {
          status = "absent";
          break;
        } else if (lower === "late" || lower === "l" || token.includes("विलंब")) {
          status = "late";
          break;
        } else if (lower === "present" || lower === "p" || token.includes("उपस्थित")) {
          status = "present";
          break;
        }
      }

      for (const token of tokens) {
        const clean = token.replace(/\D/g, "");
        if (clean && clean.length >= 1 && clean.length <= 4) {
          rollNumber = clean;
          break;
        }
      }

      const nameTokens = tokens.filter((token) => {
        const lower = token.toLowerCase();
        if (["present", "absent", "late", "p", "a", "l", "abs", "pre", "lt"].includes(lower)) return false;
        if (/^\d+$/.test(token)) return false;
        if (token.length <= 1 && !/[\u0900-\u097F]/.test(token)) return false;
        return true;
      });

      extractedName = nameTokens.join(" ");
      extractedName = transliterateHindiToEnglish(extractedName).trim();

      let studentName = extractedName || "Unknown Student";
      let matchedStudent = null;

      if (rollNumber) {
        matchedStudent = students.find(
          (s) => s.rollNumber.trim().toLowerCase() === rollNumber.toLowerCase()
        );
      }

      if (!matchedStudent && extractedName) {
        matchedStudent = students.find(
          (s) => s.name.trim().toLowerCase() === extractedName.toLowerCase()
        );
      }

      if (matchedStudent) {
        rollNumber = matchedStudent.rollNumber;
        studentName = matchedStudent.name;
      }

      const row: BulkAttendanceRow = {
        id: `ocr_att_${Date.now()}_${i}`,
        rollNumber,
        studentName,
        status,
        date: new Date().toISOString().split("T")[0],
        class: matchedStudent?.class || "",
        section: matchedStudent?.section || "A",
        studentId: matchedStudent?.id,
        errors: [],
      };

      row.errors = validateAttendanceRow(row, students);
      parsedRows.push(row);
    }

    return parsedRows;
  } catch (error) {
    console.error("OCR Extraction failed:", error);
    return [];
  }
}

interface BulkAttendanceModalProps {
  onClose: () => void;
  onImport: (records: AttendanceRecord[]) => void;
  students: any[];
  filterDate: string;
  filterClass: string;
}

function BulkAttendanceModal({
  onClose,
  onImport,
  students,
  filterDate,
  filterClass,
}: BulkAttendanceModalProps) {
  const [sourceTab, setSourceTab] = useState<"excel" | "image">("excel");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [rows, setRows] = useState<BulkAttendanceRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const parseExcel = (file: File) => {
    setProcessing(true);
    setProcessingMsg("Reading spreadsheet…");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const raw: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { raw: false, defval: "" });

        const parsed: BulkAttendanceRow[] = raw.map((r, i) => {
          const mapped: Partial<BulkAttendanceRow> = {};
          for (const [k, v] of Object.entries(r)) {
            const field = normalizeAttendanceKey(k);
            if (field) (mapped as Record<string, unknown>)[field] = v;
          }

          let status: "present" | "absent" | "late" = "present";
          const rawStatus = (mapped.status as string | undefined)?.toLowerCase().trim();
          if (rawStatus === "absent" || rawStatus === "a" || rawStatus === "abs" || rawStatus === "अनुपस्थित") {
            status = "absent";
          } else if (rawStatus === "late" || rawStatus === "l" || rawStatus === "lt" || rawStatus === "विलंब") {
            status = "late";
          } else if (rawStatus === "present" || rawStatus === "p" || rawStatus === "pre" || rawStatus === "उपस्थित") {
            status = "present";
          }

          const rollNumber = (mapped.rollNumber as string | undefined)?.trim() || "";
          const matchedStudent = students.find(
            (s) => s.rollNumber.trim().toLowerCase() === rollNumber.toLowerCase()
          );

          const row: BulkAttendanceRow = {
            id: `bulk_att_${Date.now()}_${i}`,
            rollNumber,
            studentName: matchedStudent?.name || (mapped.studentName as string | undefined)?.trim() || "Unknown Student",
            status,
            date: (mapped.date as string | undefined)?.trim() || filterDate,
            class: matchedStudent?.class || (mapped.class as string | undefined)?.trim() || filterClass || "10",
            section: matchedStudent?.section || (mapped.section as string | undefined)?.trim() || "A",
            studentId: matchedStudent?.id,
            errors: []
          };

          row.errors = validateAttendanceRow(row, students);
          return row;
        });

        setRows(parsed);
        setStep("preview");
      } catch (err) {
        console.error(err);
        alert("Failed to parse Excel file.");
      } finally {
        setProcessing(false);
        setProcessingMsg("");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseImage = async (file: File) => {
    setImageError(null);
    setFileName(file.name);
    
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setProcessing(true);
    setProcessingMsg("Scanning with Tesseract OCR...");

    try {
      const extracted = await extractAttendanceFromImage(file, students);

      if (extracted.length === 0) {
        setImageError("No student attendance records detected.");
        return;
      }

      setRows(extracted);
      setStep("preview");
    } catch (err) {
      console.error(err);
      setImageError("Failed to process register image.");
    } finally {
      setProcessing(false);
      setProcessingMsg("");
    }
  };

  const handleExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseExcel(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseImage(file);
  };

  const handleRollNumberChange = (id: string, newRoll: string) => {
    const updated = rows.map((row) => {
      if (row.id !== id) return row;

      const rollNumber = newRoll.trim();
      const matchedStudent = students.find(
        (s) => s.rollNumber.trim().toLowerCase() === rollNumber.toLowerCase()
      );

      const newRow = {
        ...row,
        rollNumber,
        studentName: matchedStudent?.name || "Unknown Student",
        class: matchedStudent?.class || row.class || "10",
        section: matchedStudent?.section || row.section || "A",
        studentId: matchedStudent?.id,
      };

      newRow.errors = validateAttendanceRow(newRow, students);
      return newRow;
    });
    setRows(updated);
  };

  const handleStatusChange = (id: string, newStatus: "present" | "absent" | "late") => {
    const updated = rows.map((row) => {
      if (row.id !== id) return row;

      const newRow = {
        ...row,
        status: newStatus,
      };
      newRow.errors = validateAttendanceRow(newRow, students);
      return newRow;
    });
    setRows(updated);
  };

  const handleImport = () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    const newRecords: AttendanceRecord[] = valid.map((r) => ({
      id: `bulk-${Date.now()}-${r.studentId}`,
      studentId: r.studentId!,
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      class: r.class,
      section: r.section,
      date: r.date,
      status: r.status,
      markedBy: "Bulk Upload",
      markedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }));
    onImport(newRecords);
    onClose();
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Roll No": "101",
        "Student Name": "Aarav Sharma",
        "Status": "Present",
        "Date": filterDate,
        "Class": filterClass || "10",
        "Section": "A"
      },
      {
        "Roll No": "102",
        "Student Name": "Vivaan Patel",
        "Status": "Absent",
        "Date": filterDate,
        "Class": filterClass || "10",
        "Section": "A"
      }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(template), "Attendance");
    XLSX.writeFile(wb, "bulk_attendance_template.xlsx");
  };

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.length - validCount;

  const resetUpload = () => {
    setStep("upload");
    setRows([]);
    setFileName("");
    setImagePreview(null);
    setImageError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden m-4 flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Bulk Upload Attendance</h2>
              <p className="text-xs text-muted-foreground">Import spreadsheet or scan register · Cross-reference in real-time</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            {(["upload", "preview"] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${step === s ? "bg-primary text-primary-foreground" : rows.length > 0 && i < ["upload", "preview"].indexOf(step) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  <span>{i + 1}</span>
                  <span className="capitalize">{s}</span>
                </div>
                {i < 1 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* STEP 1: Upload */}
          {step === "upload" && (
            <div className="space-y-5">
              {/* Source tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-xl w-fit">
                <button
                  onClick={() => { setSourceTab("excel"); setImagePreview(null); setImageError(null); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sourceTab === "excel" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Excel / CSV
                </button>
                <button
                  onClick={() => { setSourceTab("image"); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${sourceTab === "image" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <ImagePlus className="h-4 w-4 text-purple-600" />
                  Register Scan (OCR)
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">AI</span>
                </button>
              </div>

              {/* Excel upload */}
              {sourceTab === "excel" && (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleExcelDrop}
                    onClick={() => excelInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
                  >
                    <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseExcel(f); }} />
                    {processing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        <p className="text-sm text-muted-foreground">{processingMsg}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-green-100 flex items-center justify-center">
                          <FileSpreadsheet className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">Drop your Excel or CSV file here</p>
                          <p className="text-sm text-muted-foreground mt-1">Supports .xlsx, .xls, .csv · Click to browse</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <Table2 className="h-8 w-8 text-blue-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Need a template?</p>
                      <p className="text-xs text-blue-600">Download our pre-formatted attendance template with columns mapping</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadTemplate} className="border-blue-200 text-blue-700 hover:bg-blue-100">
                      <Download className="h-4 w-4 mr-2" /> Template
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accepted Columns</p>
                    <div className="flex flex-wrap gap-2">
                      {["Roll No", "Student Name", "Status", "Date", "Class", "Section"].map((c) => (
                        <span key={c} className="px-2 py-1 bg-muted text-xs rounded-md font-mono">{c}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Image OCR upload */}
              {sourceTab === "image" && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="h-8 w-8 rounded-lg bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ImagePlus className="h-4 w-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">Hindi/English Register Scanning (OCR)</p>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Upload a photo of your school attendance register. The system parses entries, transliterates Hindi names, identifies Roll numbers, and matches them to your enrollment list!
                      </p>
                    </div>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleImageDrop}
                    onClick={() => !processing && imageInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl transition-all ${processing ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-purple-400 hover:bg-purple-50/50"} ${isDragging ? "border-purple-400 bg-purple-50 scale-[1.01]" : "border-border"}`}
                  >
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) parseImage(f); }} />
                    
                    {processing ? (
                      <div className="p-10 flex flex-col items-center gap-4">
                        {imagePreview && (
                          <div className="relative">
                            <img src={imagePreview} alt="Uploading" className="h-32 w-48 object-cover rounded-xl opacity-60 animate-pulse" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2 shadow-md">
                                <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                                <span className="text-xs font-medium text-purple-800">{processingMsg}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Extracting register details...</p>
                          <p className="text-xs text-muted-foreground mt-1">This will take standard OCR extraction time</p>
                        </div>
                      </div>
                    ) : imagePreview ? (
                      <div className="p-6 flex items-center gap-4">
                        <img src={imagePreview} alt="Crop preview" className="h-24 w-32 object-cover rounded-xl ring-2 ring-purple-300" />
                        <div>
                          <p className="font-medium text-sm">{fileName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Click or drop to scan another image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center">
                          <ImagePlus className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-base">Drop register image here</p>
                          <p className="text-sm text-muted-foreground mt-1">Click to select photos · PNG, JPG, WebP</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {imageError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 animate-fade-in">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">OCR Scan Failed</p>
                        <p className="text-xs text-red-600 mt-0.5">{imageError}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 2: Preview & Adjustments */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{validCount}</span> Auto-Matched (OK)
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">{errorCount}</span> Unresolved Roll Numbers
                  </div>
                )}
                <button onClick={resetUpload} className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                  ← Upload another file
                </button>
              </div>

              {sourceTab === "image" && imagePreview && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <img src={imagePreview} alt="Scanned file" className="h-16 w-24 object-cover rounded-lg ring-1 ring-border" />
                  <div>
                    <p className="text-xs font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Parsed {rows.length} rows using Tesseract OCR. Correct any mismatched roll numbers below.</p>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10">
                      <tr className="border-b border-border">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase w-28">Roll No</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Student Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Class</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-center w-48">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase text-center">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {rows.map((row, i) => (
                        <tr key={row.id} className={`transition-colors ${row.errors.length > 0 ? "bg-yellow-50/40 hover:bg-yellow-50/60" : "hover:bg-muted/10"}`}>
                          <td className="px-4 py-3 text-muted-foreground text-xs font-medium">{i + 1}</td>
                          <td className="px-4 py-3">
                            <Input
                              value={row.rollNumber}
                              onChange={(e) => handleRollNumberChange(row.id, e.target.value)}
                              className="h-8 w-20 font-mono text-center text-xs rounded-md shadow-sm border border-input focus-visible:ring-1 focus-visible:ring-primary"
                              placeholder="Roll"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-sm">
                            {row.studentName === "Unknown Student" ? (
                              <span className="text-muted-foreground italic font-normal">Unassigned</span>
                            ) : (
                              row.studentName
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            {row.class ? `Class ${row.class}-${row.section}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-center">
                              {(["present", "absent", "late"] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleStatusChange(row.id, st)}
                                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all uppercase ${
                                    row.status === st
                                      ? st === "present"
                                        ? "bg-green-600 text-white shadow-sm"
                                        : st === "absent"
                                        ? "bg-red-600 text-white shadow-sm"
                                        : "bg-yellow-500 text-white shadow-sm"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {st === "present" ? "P" : st === "absent" ? "A" : "L"}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.errors.length === 0 ? (
                              <Badge variant="success" className="inline-flex gap-1 items-center px-2 py-0.5 rounded-full text-[10px]">
                                <CheckCircle className="h-3 w-3" /> OK
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="inline-flex gap-1 items-center px-2 py-0.5 rounded-full text-[10px] bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-100" title={row.errors.join(", ")}>
                                <AlertCircle className="h-3 w-3" /> Not Found
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between flex-shrink-0 gap-3">
          <div className="text-sm text-muted-foreground">
            {step === "preview" && `${validCount} of ${rows.length} records ready to import`}
          </div>
          <div className="flex gap-2">
            {step !== "upload" && (
              <Button variant="outline" onClick={() => setStep("upload")}>Back</Button>
            )}
            {step === "upload" && <Button variant="outline" onClick={onClose}>Cancel</Button>}
            {step === "preview" && (
              <Button onClick={handleImport} disabled={validCount === 0} className="bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 mr-2" /> Save {validCount} Records
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

interface ImageCropperModalProps {
  uploadedImage: string | null;
  showCropper: boolean;
  setShowCropper: (v: boolean) => void;
  crop: { x: number; y: number };
  setCrop: (c: { x: number; y: number }) => void;
  zoom: number;
  setZoom: (n: number) => void;
  rotation: number;
  setRotation: (n: number) => void;
  aspect?: number;
  setAspect: (a?: number) => void;
  onCropComplete: (croppedArea: unknown, croppedAreaPixels: unknown) => void;
  handleCropSave: () => Promise<void> | void;
  croppedAreaPixels: { width: number; height: number } | null;
}

function ImageCropperModal({ 
  uploadedImage, 
  showCropper, 
  setShowCropper, 
  crop, 
  setCrop, 
  zoom, 
  setZoom, 
  rotation, 
  setRotation, 
  aspect, 
  setAspect, 
  onCropComplete, 
  handleCropSave,
  croppedAreaPixels
}: ImageCropperModalProps) {
  if (!showCropper || !uploadedImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-card w-full max-w-4xl h-[90vh] md:h-[80vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl m-4 animate-scale-in border border-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-xl">
          <div>
            <h3 className="font-bold text-xl tracking-tight">Refine Selection</h3>
            <p className="text-sm text-muted-foreground">Adjust the frame to focus on the attendance table</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => setShowCropper(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="flex-1 relative bg-[#0f0f0f]">
          <Cropper
            image={uploadedImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: { background: "#0f0f0f" },
              cropAreaStyle: { border: "2px solid white", boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)" }
            }}
          />
        </div>

        <div className="p-8 bg-card border-t border-border grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Controls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-2"><Maximize className="h-4 w-4" /> Zoom Level</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Rotation</span>
                  <span>{rotation}°</span>
                </div>
                <input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer" />
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2"><Crop className="h-4 w-4" /> Aspect Presets</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Free Form", value: undefined },
                  { label: "Square", value: 1 },
                  { label: "Document (3:4)", value: 3/4 },
                  { label: "Wide (16:9)", value: 16/9 },
                ].map((ratio) => (
                  <Button key={ratio.label} variant={aspect === ratio.value ? "default" : "outline"} size="sm" onClick={() => setAspect(ratio.value)} className="rounded-full px-4 font-medium transition-all">
                    {ratio.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Info & Actions */}
          <div className="flex flex-col justify-between gap-6">
            {croppedAreaPixels && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="text-center flex-1 border-r border-primary/10">
                  <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">Width</p>
                  <p className="text-lg font-mono font-bold text-primary">{Math.round(croppedAreaPixels.width)}px</p>
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-primary/60 uppercase mb-1">Height</p>
                  <p className="text-lg font-mono font-bold text-primary">{Math.round(croppedAreaPixels.height)}px</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-3 mt-auto">
              <Button variant="outline" size="lg" className="rounded-2xl h-12 font-bold" onClick={() => setShowCropper(false)}>Cancel</Button>
              <Button size="lg" className="rounded-2xl h-12 font-bold shadow-xl shadow-primary/20" onClick={handleCropSave}>
                Apply & Enhance
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
