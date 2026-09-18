import React, { useState, useRef } from "react";
import { Button } from "./Button";
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  ScanLine,
  Sparkles,
  Trash2,
  Plus,
  ArrowLeft,
  Download,
  Copy,
  Check
} from "lucide-react";
import Tesseract from "tesseract.js";
import { transliterateHindiToEnglish } from "../../lib/transliterate";
import {
  parseOcrTextToRows,
  createEmptyStudentRow,
  StudentOcrRow,
  getOcrParseSummary
} from "../../lib/OcrStudTableParser";

export interface OcrCsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  templateHeaders?: string[];
  onUpload?: (data: any[]) => Promise<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> }>;
  onSuccess?: () => void;
  onExportCsv?: (csvContent: string) => void;
}

const DEFAULT_CSV_HEADERS = [
  "serial_no",
  "admission_no",
  "admission_date",
  "student_name",
  "father_guardian_name",
  "mother_name",
  "date_of_birth",
  "class",
  "division",
  "gender",
  "mobile_number",
  "address",
  "category",
  "remarks"
];

export function OcrCsvUploadModal({
  isOpen,
  onClose,
  title = "OCR Register to CSV Converter",
  templateHeaders = DEFAULT_CSV_HEADERS,
  onUpload,
  onSuccess,
  onExportCsv,
}: OcrCsvUploadModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [parsedData, setParsedData] = useState<StudentOcrRow[]>([]);
  const [parseSummary, setParseSummary] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsOcrProcessing(false);
    setOcrProgress(0);
    setNotice(null);
    setParsedData([]);
    setParseSummary(null);
    setResult(null);
    setParseError(null);
    setCopied(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleResetScan = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsOcrProcessing(false);
    setOcrProgress(0);
    setParsedData([]);
    setParseSummary(null);
    setParseError(null);
    setNotice(null);
    setCopied(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleClose = () => {
    const hasAttemptedUpload = result !== null || parseError !== null;
    handleReset();
    onClose();
    if (hasAttemptedUpload && onSuccess) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  const parseOcrTextToData = (ocrText: string) => {
    const parseRes = parseOcrTextToRows(ocrText, templateHeaders);
    if (parseRes.error) {
      setParseError(parseRes.error);
      setParsedData([]);
      setParseSummary(null);
    } else {
      setParseError(null);
      setParsedData(parseRes.rows);
      const summary = getOcrParseSummary(parseRes);
      setParseSummary(summary);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setParseError("Please select a valid image file (PNG, JPG, etc.).");
      return;
    }

    setImageFile(selectedFile);
    setParseError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const imageUri = evt.target?.result as string;
      setImagePreview(imageUri);
      processImageOcr(selectedFile);
    };
    reader.readAsDataURL(selectedFile);
  };

  const processImageOcr = async (imgFile: File) => {
    setIsOcrProcessing(true);
    setOcrProgress(0);
    setParseError(null);

    try {
      let res: any;
      try {
        res = await Tesseract.recognize(imgFile, "hin+eng", {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round((m.progress || 0) * 100));
            }
          },
        });
      } catch (e) {
        res = await Tesseract.recognize(imgFile, "eng", {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round((m.progress || 0) * 100));
            }
          },
        });
      }

      const extractedText = res?.data?.text || "";
      parseOcrTextToData(extractedText);
    } catch (err: any) {
      setParseError("Failed to perform OCR on image. " + (err?.message || ""));
      setParsedData([]);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleCellEdit = (rowIndex: number, fieldKey: string, newValue: string) => {
    setParsedData((prev) => {
      const updated = [...prev];
      const row = { ...updated[rowIndex] } as any;
      row[fieldKey] = newValue;

      if (fieldKey === "student_name" || fieldKey === "name") {
        row["student_name"] = newValue;
        row["name"] = newValue;
      } else if (fieldKey === "admission_no" || fieldKey === "registration_no" || fieldKey === "registrationNo") {
        row["admission_no"] = newValue;
        row["registration_no"] = newValue;
        row["registrationNo"] = newValue;
      } else if (fieldKey === "academic_year" || fieldKey === "academicYear") {
        row["academic_year"] = newValue;
        row["academicYear"] = newValue;
      } else if (fieldKey === "admission_date" || fieldKey === "admissionDate") {
        row["admission_date"] = newValue;
        row["admissionDate"] = newValue;
      } else if (fieldKey === "date_of_birth" || fieldKey === "dateOfBirth" || fieldKey === "dateofbirth") {
        row["date_of_birth"] = newValue;
        row["dateOfBirth"] = newValue;
        row["dateofbirth"] = newValue;
      } else if (fieldKey === "father_guardian_name" || fieldKey === "father_name" || fieldKey === "parentName") {
        row["father_guardian_name"] = newValue;
        row["father_name"] = newValue;
        row["parentName"] = newValue;
      } else if (fieldKey === "mother_name" || fieldKey === "motherName") {
        row["mother_name"] = newValue;
        row["motherName"] = newValue;
      } else if (fieldKey === "mobile_number" || fieldKey === "parentphone" || fieldKey === "parentPhone") {
        row["mobile_number"] = newValue;
        row["parentphone"] = newValue;
        row["parentPhone"] = newValue;
      } else if (fieldKey === "category" || fieldKey === "caste_category" || fieldKey === "casteCategory") {
        row["category"] = newValue;
        row["caste_category"] = newValue;
        row["casteCategory"] = newValue;
      }

      updated[rowIndex] = row;
      return updated;
    });
  };

  const handleAddEmptyRow = () => {
    setParsedData((prev) => [
      ...prev,
      createEmptyStudentRow(prev.length + 1) as any,
    ]);
  };

  const handleDeleteRow = (index: number) => {
    setParsedData((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTranslateAllToEnglish = () => {
    setParsedData((prev) =>
      prev.map((row: any) => {
        const translatedRow = { ...row };
        const fieldsToTranslate = [
          "name",
          "student_name",
          "father_name",
          "father_guardian_name",
          "mother_name",
          "parentName",
          "address",
          "category",
          "caste_category",
          "casteCategory",
        ];
        fieldsToTranslate.forEach((field) => {
          if (translatedRow[field]) {
            translatedRow[field] = transliterateHindiToEnglish(translatedRow[field]);
          }
        });
        return translatedRow;
      })
    );
    setNotice(`Translated ${parsedData.length} records to English.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const generateCsvString = (): string => {
    const headers = templateHeaders.length > 0 ? templateHeaders : DEFAULT_CSV_HEADERS;

    const escapeCsvValue = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str}"`;
      }
      return `"${str}"`;
    };

    const headerLine = headers.join(",");
    const rowsLines = parsedData.map((row: any) => {
      return headers
        .map((h) => escapeCsvValue(row[h] !== undefined ? row[h] : (row[h.toLowerCase()] ?? "")))
        .join(",");
    });

    return [headerLine, ...rowsLines].join("\n");
  };

  const handleDownloadCsv = () => {
    if (parsedData.length === 0) return;
    const csvContent = generateCsvString();
    if (onExportCsv) {
      onExportCsv(csvContent);
    }
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `student_ocr_parsed_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotice("CSV file successfully downloaded!");
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCopyCsv = async () => {
    if (parsedData.length === 0) return;
    const csvContent = generateCsvString();
    try {
      await navigator.clipboard.writeText(csvContent);
      setCopied(true);
      setNotice("CSV data copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setNotice(null);
      }, 4000);
    } catch (err) {
      setParseError("Failed to copy CSV content.");
    }
  };

  const handleConfirmUpload = async () => {
    if (!onUpload || parsedData.length === 0) return;
    setUploading(true);
    setParseError(null);

    try {
      const res = await onUpload(parsedData);
      setResult(res);
      if (onSuccess) {
        onSuccess();
      }
      if (res.skippedCount === 0 && (!res.errors || res.errors.length === 0)) {
        handleClose();
      }
    } catch (err: any) {
      setParseError(err.message || "Failed to upload bulk records.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className={`bg-card text-card-foreground border border-border/80 rounded-3xl w-full ${parsedData.length > 0 ? "max-w-[95vw]" : "max-w-xl"} shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <p className="text-xs text-muted-foreground">Extract structured register data from OCR images & export directly to CSV.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {notice && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs flex items-center gap-2 font-medium animate-fade-in">
              <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{notice}</span>
            </div>
          )}

          {parseError && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {!result ? (
            <div className="space-y-4">
              {parsedData.length === 0 ? (
                <div className="space-y-3">
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${imageFile ? "border-emerald-500 bg-emerald-500/5" : "border-border hover:border-emerald-500/50 hover:bg-muted/40"
                      }`}
                  >
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                    {imageFile ? (
                      <div className="space-y-2">
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="max-h-36 mx-auto rounded-xl border border-border object-contain" />
                        )}
                        <p className="text-sm font-bold text-foreground">{imageFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Click to select a Register Image</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload school register page (PNG, JPG) to parse & convert to CSV</p>
                      </div>
                    )}
                  </div>

                  {isOcrProcessing && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center gap-3">
                      <ScanLine className="h-4 w-4 text-emerald-500 animate-spin" />
                      <div className="flex-1">
                        <div className="flex justify-between font-semibold text-foreground mb-1">
                          <span>Scanning image with OCR engine...</span>
                          <span>{ocrProgress}%</span>
                        </div>
                        <div className="w-full bg-emerald-200 dark:bg-emerald-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full transition-all duration-200" style={{ width: `${ocrProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* OCR Scanned Editable Data Grid & Summary */
                <div className="space-y-4">
                  {/* Summary Bar */}
                  {parseSummary && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-muted-foreground block">Extracted Rows</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{parseSummary.validRows}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <span className="text-muted-foreground block">High Confidence</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{parseSummary.highConfidenceRows}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <span className="text-muted-foreground block">Needs Review</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{parseSummary.reviewRows}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                        <span className="text-muted-foreground block">Duplicates</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{parseSummary.duplicateRows}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-muted/40 border border-border">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        {parsedData.length} CSV Rows
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        Review, edit cells or add/remove rows before export
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetScan}
                        className="rounded-xl text-xs font-semibold hover:bg-muted"
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> New Image
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTranslateAllToEnglish}
                        className="rounded-xl text-xs font-semibold flex items-center gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> English Translate
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCsv}
                        className="rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        {copied ? "Copied" : "Copy CSV"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDownloadCsv}
                        className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download CSV
                      </Button>
                    </div>
                  </div>

                  {/* Interactive Table */}
                  <div className="overflow-x-auto rounded-2xl border border-border text-xs max-h-80 shadow-inner bg-background">
                    <table className="w-full text-left border-collapse min-w-[1800px]">
                      <thead className="bg-muted text-muted-foreground font-bold sticky top-0 z-10 border-b border-border">
                        <tr>
                          <th className="p-2.5 w-10 text-center">#</th>
                          <th className="p-2.5 w-24">Reg No</th>
                          <th className="p-2.5 w-28">Admission Date</th>
                          <th className="p-2.5 w-36">Student Name</th>
                          <th className="p-2.5 w-36">Father Name</th>
                          <th className="p-2.5 w-36">Mother Name</th>
                          <th className="p-2.5 w-28">Phone</th>
                          <th className="p-2.5 w-28">DOB</th>
                          <th className="p-2.5 w-16">Class</th>
                          <th className="p-2.5 w-20">Gender</th>
                          <th className="p-2.5 w-36">Category</th>
                          <th className="p-2.5 w-48">Address</th>
                          <th className="p-2.5 w-28">Status</th>
                          <th className="p-2.5 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parsedData.map((row: any, idx) => (
                          <tr key={idx} className={`hover:bg-muted/30 transition-colors ${row.needs_review ? "bg-amber-500/5" : ""}`}>
                            <td className="p-2 text-center font-bold text-muted-foreground">{row.serial_no || idx + 1}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.admission_no || row.registration_no || ""}
                                onChange={(e) => handleCellEdit(idx, "admission_no", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none font-mono"
                                placeholder="Reg No"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.admission_date || row.admissionDate || ""}
                                onChange={(e) => handleCellEdit(idx, "admission_date", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                                placeholder="DD-MM-YYYY"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.student_name || row.name || ""}
                                onChange={(e) => handleCellEdit(idx, "student_name", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none font-semibold text-foreground"
                                placeholder="Student Name"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.father_guardian_name || row.father_name || ""}
                                onChange={(e) => handleCellEdit(idx, "father_guardian_name", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                                placeholder="Father Name"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.mother_name || ""}
                                onChange={(e) => handleCellEdit(idx, "mother_name", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                                placeholder="Mother Name"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.mobile_number || row.parentPhone || ""}
                                onChange={(e) => handleCellEdit(idx, "mobile_number", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none font-mono"
                                placeholder="Mobile"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.date_of_birth || row.dateOfBirth || ""}
                                onChange={(e) => handleCellEdit(idx, "date_of_birth", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                                placeholder="DD-MM-YYYY"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.class || "5"}
                                onChange={(e) => handleCellEdit(idx, "class", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none text-center"
                                placeholder="5"
                              />
                            </td>
                            <td className="p-1.5">
                              <select
                                value={row.gender || "Male"}
                                onChange={(e) => handleCellEdit(idx, "gender", e.target.value)}
                                className="w-full px-1.5 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.category || row.caste_category || "General"}
                                onChange={(e) => handleCellEdit(idx, "category", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                                placeholder="Category"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.address || ""}
                                onChange={(e) => handleCellEdit(idx, "address", e.target.value)}
                                className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-border focus:border-emerald-500 focus:bg-background rounded-lg outline-none"
                                placeholder="Address"
                              />
                            </td>
                            <td className="p-1.5">
                              {row.needs_review ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-semibold">
                                  <AlertCircle className="h-3 w-3" /> Needs Review
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                                  <CheckCircle2 className="h-3 w-3" /> Valid
                                </span>
                              )}
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(idx)}
                                className="p-1 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                                title="Delete Row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Row & Stats */}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddEmptyRow}
                      className="rounded-xl text-xs font-semibold hover:bg-muted"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Empty Row
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Total {parsedData.length} records ready for CSV output
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Result Summary */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Processing Completed</span>
                </div>
                <div className="mt-2 text-xs space-y-1 text-muted-foreground">
                  <p>Added: <span className="font-bold text-foreground">{result.addedCount}</span> records</p>
                  <p>Skipped: <span className="font-bold text-foreground">{result.skippedCount}</span> records</p>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-destructive">Encountered Errors ({result.errors.length}):</p>
                  <div className="max-h-36 overflow-y-auto p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-1">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{err.email}</span>
                        <span>{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="rounded-xl text-xs font-semibold"
          >
            Close
          </Button>

          {parsedData.length > 0 && !result && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadCsv}
                className="rounded-xl text-xs font-bold flex items-center gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              >
                <Download className="h-3.5 w-3.5" /> Download CSV
              </Button>
              {onUpload && (
                <Button
                  type="button"
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" /> Confirm & Import ({parsedData.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
