import React, { useState, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { createWorker } from "tesseract.js";
import {
  Upload,
  X,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
  Calendar,
  FileText,
  CheckCheck,
  RefreshCw,
  FileUp,
  Download,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Badge } from "../../ui/Badge";
import { AttendanceRecord, Student } from "../../../types";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  students?: Student[];
  handleBulkImport?: (records: AttendanceRecord[]) => void;
  onImport?: (records: AttendanceRecord[]) => void;
  handleDownloadSampleTemplate?: (manualDate?: string) => void;
  defaultDate?: string;
  classes?: any[];
  importStatus?: any;
  setImportStatus?: any;
}

interface ParsedRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  class: string;
  section: string;
  classId?: string;
  divisionId?: string;
  date: string;
  status: "present" | "absent" | "late";
  matched: boolean;
  rawRegistrationNo?: string;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  isOpen,
  onClose,
  students = [],
  handleBulkImport,
  onImport,
  handleDownloadSampleTemplate,
  defaultDate,
}) => {
  const importFn = handleBulkImport || onImport;
  const [dateMode, setDateMode] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [startDate, setStartDate] = useState<string>(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(
    defaultDate || new Date().toISOString().split("T")[0]
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedRecords, setParsedRecords] = useState<ParsedRecord[]>([]);
  const [isOcrMode, setIsOcrMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Reset internal state
  const handleReset = () => {
    setSelectedFile(null);
    setParsedRecords([]);
    setErrorMsg(null);
    setIsLoading(false);
    setIsOcrMode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Helper to normalize status strings
  const normalizeStatus = (rawStatus: any): "present" | "absent" | "late" => {
    if (!rawStatus) return "present";
    const str = String(rawStatus).trim().toLowerCase();
    if (str === "p" || str === "present" || str === "1" || str === "yes" || str === "true") return "present";
    if (str === "a" || str === "absent" || str === "0" || str === "no" || str === "false") return "absent";
    if (str === "l" || str === "late") return "late";
    return "present";
  };

  // Parse Excel / CSV File
  const parseSpreadsheet = async (file: File) => {
    setIsLoading(true);
    setLoadingText("Reading file...");
    setErrorMsg(null);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("No sheet found in the uploaded file.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!rows || rows.length === 0) {
        throw new Error("The uploaded sheet is empty or contains no readable rows.");
      }

      const results: ParsedRecord[] = rows.map((row, index) => {
        // Find matching columns flexible to casing and variations
        const regNo = String(
          row["Registration No"] ||
          row["RegistrationNo"] ||
          row["Registration_No"] ||
          row["Reg No"] ||
          row["Roll No"] ||
          row["RollNo"] ||
          row["Roll Number"] ||
          row["Student ID"] ||
          row["student_id"] ||
          ""
        ).trim();

        const name = String(
          row["Student Name"] ||
          row["StudentName"] ||
          row["Name"] ||
          row["Full Name"] ||
          ""
        ).trim();

        const cls = String(row["Class"] || row["ClassName"] || row["class"] || "").trim();
        const sec = String(row["Division"] || row["Section"] || row["division"] || row["section"] || "").trim();
        const rawClassId = String(row["classId"] || row["class_id"] || row["ClassId"] || "").trim();
        const rawDivisionId = String(row["divisionId"] || row["division_id"] || row["DivisionId"] || row["sectionId"] || row["section_id"] || "").trim();

        const rowDate = String(row["Date"] || row["date"] || "").trim() || selectedDate;
        const statusStr = row["Status"] || row["status"] || row["Attendance"] || row["attendance"] || "present";
        const status = normalizeStatus(statusStr);

        // Attempt student matching in loaded students prop
        let matchedStudent: Student | undefined;
        if (regNo) {
          matchedStudent = students.find(
            (s: any) =>
              String(s.roll_no || s.rollNumber || s.registration_no || s.id) === regNo ||
              String(s.student_id || s.user_id) === regNo
          );
        }
        if (!matchedStudent && name) {
          matchedStudent = students.find(
            (s: any) => s.name?.toLowerCase() === name.toLowerCase()
          );
        }

        const studentId = matchedStudent ? String(matchedStudent.id) : regNo || `import-${index + 1}`;
        const studentName = matchedStudent ? matchedStudent.name : name || `Student #${index + 1}`;
        const rollNumber = matchedStudent ? String(matchedStudent.roll_no || matchedStudent.rollNumber || "") : regNo;
        const classVal = matchedStudent ? (matchedStudent.class_name || matchedStudent.class || cls) : cls;
        const sectionVal = matchedStudent ? (matchedStudent.division_name || matchedStudent.section || sec) : sec;
        const finalClassId = rawClassId || (matchedStudent ? String(matchedStudent.class_id || (matchedStudent as any).classId || "") : "");
        const finalDivisionId = rawDivisionId || (matchedStudent ? String(matchedStudent.division_name || (matchedStudent as any).divisionId || (matchedStudent as any).sectionId || "") : "");

        return {
          id: `row-${index}-${Date.now()}`,
          studentId,
          studentName,
          rollNumber: rollNumber || regNo || "N/A",
          class: classVal || "Class 1",
          section: sectionVal || "A",
          classId: finalClassId || undefined,
          divisionId: finalDivisionId || undefined,
          date: rowDate,
          status,
          matched: !!matchedStudent,
          rawRegistrationNo: regNo,
        };
      });

      setParsedRecords(results);
    } catch (err: any) {
      console.error("Failed to parse spreadsheet:", err);
      setErrorMsg(err.message || "Failed to parse file. Please check file format.");
    } finally {
      setIsLoading(false);
    }
  };

  // Parse Image using Tesseract OCR
  const parseImageOcr = async (file: File) => {
    setIsLoading(true);
    setIsOcrMode(true);
    setLoadingText("Running OCR text recognition...");
    setErrorMsg(null);

    try {
      const worker = await createWorker("eng");
      const ret = await worker.recognize(file);
      await worker.terminate();

      const text = ret.data.text;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

      const ocrResults: ParsedRecord[] = [];
      let rowIdx = 0;

      for (const line of lines) {
        // Check if line contains status keywords
        const lower = line.toLowerCase();
        let status: "present" | "absent" | "late" = "present";
        if (lower.includes("absent") || lower.includes(" a ") || lower.endsWith(" a")) {
          status = "absent";
        } else if (lower.includes("late") || lower.includes(" l ") || lower.endsWith(" l")) {
          status = "late";
        }

        // Check matching with students
        const matchedStudent = students.find((s: any) => {
          const sName = (s.name || "").toLowerCase();
          const sRoll = String(s.roll_no || s.rollNumber || "");
          return (sRoll && lower.includes(sRoll)) || (sName && lower.includes(sName));
        });

        if (matchedStudent || lower.length > 3) {
          rowIdx++;
          ocrResults.push({
            id: `ocr-${rowIdx}-${Date.now()}`,
            studentId: matchedStudent ? String(matchedStudent.id) : `ocr-${rowIdx}`,
            studentName: matchedStudent ? matchedStudent.name : line.substring(0, 24),
            rollNumber: matchedStudent ? String(matchedStudent.roll_no || matchedStudent.rollNumber || "") : `${rowIdx}`,
            class: matchedStudent ? (matchedStudent.class_name || matchedStudent.class || "") : "",
            section: matchedStudent ? (matchedStudent.division_name || matchedStudent.section || "") : "",
            classId: matchedStudent ? String(matchedStudent.class_id || (matchedStudent as any).classId || "") : undefined,
            divisionId: matchedStudent ? String((matchedStudent as any).divisionId || (matchedStudent as any).sectionId || "") : undefined,
            date: selectedDate,
            status,
            matched: !!matchedStudent,
          });
        }
      }

      if (ocrResults.length === 0) {
        throw new Error("Could not extract student attendance records from image. Please try a clearer image or CSV file.");
      }

      setParsedRecords(ocrResults);
    } catch (err: any) {
      console.error("OCR Error:", err);
      setErrorMsg(err.message || "Failed to perform OCR on image.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setSelectedFile(file);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv" || ext === "xlsx" || ext === "xls") {
      parseSpreadsheet(file);
    } else if (["png", "jpg", "jpeg", "webp"].includes(ext || "")) {
      parseImageOcr(file);
    } else {
      setErrorMsg("Unsupported file type. Please upload a .csv, .xlsx, .xls spreadsheet or image file.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  // Handle Record status modification in preview table
  const handleRecordStatusChange = (id: string, newStatus: "present" | "absent" | "late") => {
    setParsedRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Mark All Records
  const handleMarkAll = (status: "present" | "absent" | "late") => {
    setParsedRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  // Final Commit / Import
  const handleConfirmImport = () => {
    if (parsedRecords.length === 0) return;

    const formattedRecords: (AttendanceRecord & { classId?: string; divisionId?: string })[] = parsedRecords.map((r) => ({
      studentId: r.studentId,
      studentName: r.studentName,
      rollNumber: r.rollNumber,
      class: r.classId,
      section: r.divisionId,
      classId: r.classId,
      divisionId: r.divisionId,
      date: selectedDate || r.date,
      status: r.status,
      markedBy: "Bulk Upload",
      markedAt: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    })) as any;

    console.log('formattedRecords', formattedRecords);

    if (handleBulkImport) {
      handleBulkImport(formattedRecords);
    }
    handleClose();
  };

  const presentCount = parsedRecords.filter((r) => r.status === "present").length;
  const absentCount = parsedRecords.filter((r) => r.status === "absent").length;
  const lateCount = parsedRecords.filter((r) => r.status === "late").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                Bulk Attendance Upload
                <Badge variant="secondary" className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                  CSV / Excel
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload a spreadsheet or image to automatically parse and mark attendance records
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Top Configuration Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
            {/* Target Date / Date Range Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Target Attendance Date
                </label>
                {/* <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setDateMode("single")}
                    className={`px-2 py-0.5 rounded transition-all ${dateMode === "single" ? "bg-primary/10 text-primary font-bold" : "hover:text-foreground"}`}
                  >
                    Single Date
                  </button>
                  <span>|</span>
                  <button
                    type="button"
                    onClick={() => setDateMode("range")}
                    className={`px-2 py-0.5 rounded transition-all ${dateMode === "range" ? "bg-primary/10 text-primary font-bold" : "hover:text-foreground"}`}
                  >
                    Date Range
                  </button>
                </div> */}
              </div>

              {dateMode === "single" ? (
                <Input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (parsedRecords.length > 0) {
                      setParsedRecords((prev) =>
                        prev.map((r) => ({ ...r, date: e.target.value }))
                      );
                    }
                  }}
                  className="font-medium h-10"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="font-medium h-10 text-xs"
                    title="Start Date"
                  />
                  <span className="text-xs text-muted-foreground font-semibold">to</span>
                  <Input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="font-medium h-10 text-xs"
                    title="End Date"
                  />
                </div>
              )}
            </div>

            {/* Download Sample Template */}
            <div className="flex flex-col justify-end">
              <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                Need excel format template?
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDownloadSampleTemplate && handleDownloadSampleTemplate(dateMode === "single" ? selectedDate : startDate)}
                className="w-full h-10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Download Sample Template (.xlsx)
              </Button>
            </div>
          </div>

          {/* File Upload Dropzone */}
          {parsedRecords.length === 0 && !isLoading && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${isDragOver
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 scale-[0.99]"
                : "border-border hover:border-emerald-500/60 hover:bg-muted/30"
                }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls, .png, .jpg, .jpeg, .webp"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <FileUp className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground">
                  Drag & Drop your CSV / Excel or Image file here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports <span className="font-mono text-foreground font-semibold">.csv</span>, <span className="font-mono text-foreground font-semibold">.xlsx</span>, <span className="font-mono text-foreground font-semibold">.xls</span> or <span className="font-mono text-foreground font-semibold">.png/.jpg (OCR)</span>
                </p>
              </div>
              <Button size="sm" variant="secondary" className="mt-2 font-bold px-5">
                Browse Files
              </Button>
            </div>
          )}

          {/* Loading Spinner */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <p className="text-sm font-bold text-foreground">{loadingText}</p>
              <p className="text-xs text-muted-foreground">Parsing records and matching students...</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-sm flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <div className="flex-1 font-medium">{errorMsg}</div>
              <Button size="sm" variant="ghost" onClick={() => setErrorMsg(null)}>
                Dismiss
              </Button>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedRecords.length > 0 && !isLoading && (
            <div className="space-y-4">
              {/* File Info Bar & Bulk Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold text-foreground">
                    {selectedFile?.name || "Parsed Records"}
                  </span>
                  <Badge variant="outline" className="text-[11px] font-mono font-semibold">
                    {parsedRecords.length} records parsed
                  </Badge>
                  {isOcrMode && (
                    <Badge className="bg-amber-500 text-white text-[10px] font-bold">
                      OCR Extracted
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    onClick={() => handleMarkAll("present")}
                  >
                    Mark All Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-rose-500/30 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950"
                    onClick={() => handleMarkAll("absent")}
                  >
                    Mark All Absent
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8 text-muted-foreground hover:text-foreground"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-upload
                  </Button>
                </div>
              </div>

              {/* Status Counts Pill Bar */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/30 text-center">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">
                    Present
                  </span>
                  <span className="text-lg font-black text-emerald-800 dark:text-emerald-200">
                    {presentCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-50/40 dark:bg-rose-950/30 text-center">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">
                    Absent
                  </span>
                  <span className="text-lg font-black text-rose-800 dark:text-rose-200">
                    {absentCount}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/30 text-center">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">
                    Late
                  </span>
                  <span className="text-lg font-black text-amber-800 dark:text-amber-200">
                    {lateCount}
                  </span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-border rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="sticky top-0 bg-muted/80 backdrop-blur-md border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Roll / Reg No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Class / Div</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedRecords.map((rec, idx) => (
                      <tr key={rec.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {rec.rollNumber}
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          {rec.studentName}
                          {rec.matched && (
                            <Badge variant="outline" className="ml-2 text-[10px] bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-700 dark:text-emerald-400">
                              Matched
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {rec.class} {rec.section ? `(${rec.section})` : ""}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {(["present", "absent", "late"] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleRecordStatusChange(rec.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${rec.status === st
                                  ? st === "present"
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : st === "absent"
                                      ? "bg-rose-600 text-white shadow-sm"
                                      : "bg-amber-500 text-white shadow-sm"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                              >
                                {st === "present" ? "P" : st === "absent" ? "A" : "L"}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/40">
          <Button variant="outline" onClick={handleClose} className="font-bold">
            Cancel
          </Button>

          {parsedRecords.length > 0 && (
            <Button
              onClick={handleConfirmImport}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Import {parsedRecords.length} Record{parsedRecords.length > 1 ? "s" : ""}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
