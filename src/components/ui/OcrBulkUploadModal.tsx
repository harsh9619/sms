import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { X, Upload, CheckCircle2, AlertCircle, RefreshCw, Image as ImageIcon, ScanLine, Sparkles, Trash2, Plus, ArrowLeft } from "lucide-react";
import Tesseract from "tesseract.js";
import { transliterateHindiToEnglish } from "../../lib/transliterate";
import {
  parseOcrTextToRows,
  createEmptyStudentRow,
} from "../../lib/OcrTableParser";

interface OcrBulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  templateHeaders: string[];
  onUpload: (data: any[]) => Promise<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> }>;
  onSuccess?: () => void;
}

export function OcrBulkUploadModal({
  isOpen,
  onClose,
  title = "Upload from Image (OCR)",
  templateHeaders,
  onUpload,
  onSuccess,
}: OcrBulkUploadModalProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsOcrProcessing(false);
    setOcrProgress(0);
    setTranslationNotice(null);
    setParsedData([]);
    setResult(null);
    setParseError(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleResetScan = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsOcrProcessing(false);
    setOcrProgress(0);
    setParsedData([]);
    setParseError(null);
    setTranslationNotice(null);
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
    const result = parseOcrTextToRows(ocrText, templateHeaders);
    if (result.error) {
      setParseError(result.error);
      setParsedData([]);
    } else {
      setParseError(null);
      console.log(' parsed data', JSON.stringify(result.rows))
      setParsedData(result.rows);
    }
  };


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setParseError("Please select a valid image file.");
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
      console.log(' extracted text', extractedText)
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
      const row = { ...updated[rowIndex] };
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
      } else if (fieldKey === "fatherOccupation" || fieldKey === "father_occupation") {
        row["fatherOccupation"] = newValue;
        row["father_occupation"] = newValue;
      } else if (fieldKey === "fatherQualification" || fieldKey === "father_qualification") {
        row["fatherQualification"] = newValue;
        row["father_qualification"] = newValue;
      } else if (fieldKey === "motherOccupation" || fieldKey === "mother_occupation") {
        row["motherOccupation"] = newValue;
        row["mother_occupation"] = newValue;
      } else if (fieldKey === "motherQualification" || fieldKey === "mother_qualification") {
        row["motherQualification"] = newValue;
        row["mother_qualification"] = newValue;
      }
      updated[rowIndex] = row;
      return updated;
    });
  };

  const handleAddEmptyRow = () => {
    setParsedData((prev) => [
      ...prev,
      createEmptyStudentRow(prev.length + 1),
    ]);
  };


  const handleDeleteRow = (index: number) => {
    setParsedData((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleTranslateAllToEnglish = () => {
    setParsedData((prev) =>
      prev.map((row) => {
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
          "fatherOccupation",
          "fatherQualification",
          "motherOccupation",
          "motherQualification",
        ];
        fieldsToTranslate.forEach((field) => {
          if (translatedRow[field]) {
            translatedRow[field] = transliterateHindiToEnglish(translatedRow[field]);
          }
        });
        return translatedRow;
      })
    );
    setTranslationNotice(`Translated ${parsedData.length} records to English.`);
    setTimeout(() => setTranslationNotice(null), 4000);
  };

  const handleConfirmUpload = async () => {
    if (parsedData.length === 0) return;
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
            <div className="p-2.5 rounded-2xl bg-violet-500/10 text-violet-500">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <p className="text-xs text-muted-foreground">Scan school register photo to extract & import student records.</p>
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
          {translationNotice && (
            <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs flex items-center gap-2 font-medium animate-fade-in">
              <Sparkles className="h-4 w-4 shrink-0 text-violet-500" />
              <span>{translationNotice}</span>
            </div>
          )}

          {!result ? (
            <div className="space-y-4">
              {/* Hide Image Upload dropzone completely after successful OCR processing */}
              {parsedData.length === 0 ? (
                <div className="space-y-3">
                  <div
                    onClick={() => imageInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${imageFile ? "border-violet-500 bg-violet-500/5" : "border-border hover:border-violet-500/50 hover:bg-muted/40"
                      }`}
                  >
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-violet-500" />
                    {imageFile ? (
                      <div className="space-y-2">
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="max-h-36 mx-auto rounded-xl border border-border object-contain" />
                        )}
                        <p className="text-sm font-bold text-foreground">{imageFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Click to select an Image file</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload image containing tabular student register records (PNG, JPG)</p>
                      </div>
                    )}
                  </div>

                  {isOcrProcessing && (
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs flex items-center gap-3">
                      <ScanLine className="h-4 w-4 text-violet-500 animate-spin" />
                      <div className="flex-1">
                        <div className="flex justify-between font-semibold text-foreground mb-1">
                          <span>Scanning register image with OCR...</span>
                          <span>{ocrProgress}%</span>
                        </div>
                        <div className="w-full bg-violet-200 dark:bg-violet-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-violet-600 h-full transition-all duration-200" style={{ width: `${ocrProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* OCR Scanned Editable Data Grid */
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-violet-600 text-white text-xs font-bold">
                        {parsedData.length} Records Extracted
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        Review and edit parsed values before import
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResetScan}
                        className="rounded-xl text-xs font-semibold hover:bg-muted"
                      >
                        <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Scan Another Image
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleTranslateAllToEnglish}
                        className="rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Translate to English
                      </Button>
                    </div>
                  </div>

                  {/* Interactive Editable Table showing ALL columns */}
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
                          <th className="p-2.5 w-24">Category</th>
                          <th className="p-2.5 w-44">Address</th>
                          <th className="p-2.5 w-12 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {parsedData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-muted/30 transition-colors">
                            <td className="p-2 text-center text-muted-foreground font-mono font-bold">{idx + 1}</td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.admission_no || row.registration_no || row.registrationNo || ""}
                                onChange={(e) => handleCellEdit(idx, "admission_no", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs font-mono font-semibold focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.admission_date || row.admissionDate || ""}
                                onChange={(e) => handleCellEdit(idx, "admission_date", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.student_name || row.name || ""}
                                onChange={(e) => handleCellEdit(idx, "student_name", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs font-semibold focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.father_guardian_name || row.father_name || row.parentName || ""}
                                onChange={(e) => handleCellEdit(idx, "father_guardian_name", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.mother_name || row.motherName || ""}
                                onChange={(e) => handleCellEdit(idx, "mother_name", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.mobile_number || row.parentphone || row.parentPhone || ""}
                                onChange={(e) => handleCellEdit(idx, "mobile_number", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs font-mono focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.date_of_birth || row.dateOfBirth || row.dateofbirth || ""}
                                onChange={(e) => handleCellEdit(idx, "date_of_birth", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.class !== undefined ? String(row.class) : "5"}
                                onChange={(e) => handleCellEdit(idx, "class", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs text-center focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <select
                                value={row.gender || "पु."}
                                onChange={(e) => handleCellEdit(idx, "gender", e.target.value)}
                                className="w-full px-1.5 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              >
                                <option value="पु.">पु.</option>
                                <option value="स्त्री.">स्त्री.</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.category || row.caste_category || row.casteCategory || ""}
                                onChange={(e) => handleCellEdit(idx, "category", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={row.address || ""}
                                onChange={(e) => handleCellEdit(idx, "address", e.target.value)}
                                className="w-full px-2 py-1 bg-muted/40 hover:bg-background focus:bg-background border border-border/60 focus:border-violet-500 rounded-lg text-xs focus:outline-none transition-all"
                              />
                            </td>
                            <td className="p-1.5 text-center">

                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete Student"
                                onClick={() => handleDeleteRow(idx)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              {/* <button
                                type="button"
                                onClick={() => }
                                className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete Row"
                              ></button> */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-start">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddEmptyRow}
                      className="rounded-xl text-xs font-bold text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-950/40"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Student Row
                    </Button>
                  </div>
                </div>
              )}

              {parseError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Upload Result Summary */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-bold text-foreground">Import Processed</h3>
                <p className="text-xs text-muted-foreground">
                  Successfully added <span className="font-bold text-emerald-600">{result.addedCount}</span> records.
                  {result.skippedCount > 0 && <span> Skipped <span className="font-bold text-amber-600">{result.skippedCount}</span> duplicates/invalid rows.</span>}
                </p>
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-destructive uppercase tracking-wider">Skipped Rows / Errors</p>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {result.errors.map((err, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs flex justify-between items-center">
                        <span className="font-medium text-foreground">{err.email}</span>
                        <span className="text-destructive font-semibold">{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-muted/20 flex justify-between items-center">
          {result ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-xl text-xs font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Upload Another
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="rounded-xl text-xs font-medium"
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button
                type="button"
                size="sm"
                disabled={parsedData.length === 0 || uploading}
                onClick={handleConfirmUpload}
                className="rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md"
              >
                {uploading ? (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                )}
                {uploading ? "Importing..." : `Bulk Upload (${parsedData.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
