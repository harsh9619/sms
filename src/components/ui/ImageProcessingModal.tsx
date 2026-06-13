import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Button } from "./Button";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { X, Upload, Loader2, AlertCircle, CheckCircle, Eye } from "lucide-react";
import { extractTextFromImage, validateImageFile, generateImagePreview } from "../../lib/ocrUtils";
import type { AttendanceRecord } from "../../types";

interface ImageProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProcessComplete: (records: AttendanceRecord[], method: "ocr" | "manual") => void;
  classInfo: { class: string; section: string };
}

interface ManualEntry {
  rollNumber: string;
  status: "present" | "absent" | "late";
}

export function ImageProcessingModal({
  isOpen,
  onClose,
  onProcessComplete,
  classInfo,
}: ImageProcessingModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [processingMethod, setProcessingMethod] = useState<"ocr" | "manual">("ocr");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [ocrConfidence, setOcrConfidence] = useState(0);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([
    { rollNumber: "", status: "present" },
  ]);
  const [error, setError] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    setError("");
    setSelectedFile(file);
    const preview = await generateImagePreview(file);
    setImagePreview(preview);

    // Auto-process if OCR method is selected
    if (processingMethod === "ocr") {
      processImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setError("");
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      setError("");
      const result = await extractTextFromImage(file);
      setOcrText(result.text);
      setOcrConfidence(result.confidence);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const parseOCRText = (): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const lines = ocrText.split("\n");

    lines.forEach((line, index) => {
      // Try to match patterns like "101 Present" or "101 P" or "101 A"
      const match = line.match(/(\d+)\s*([PA]|present|absent|late)/i);
      if (match) {
        const rollNumber = match[1];
        const statusStr = match[2].toUpperCase();
        let status: "present" | "absent" | "late" = "present";

        if (statusStr === "A" || statusStr === "ABSENT") status = "absent";
        else if (statusStr === "L" || statusStr === "LATE") status = "late";

        records.push({
          id: `att${Date.now()}${index}`,
          studentId: `roll_${rollNumber}`,
          studentName: `Roll No. ${rollNumber}`,
          rollNumber,
          class: classInfo.class,
          section: classInfo.section,
          date: new Date().toISOString().split("T")[0],
          status,
          markedBy: "OCR Processing",
          markedAt: new Date().toISOString(),
        });
      }
    });

    return records;
  };

  const parseManualEntries = (): AttendanceRecord[] => {
    return manualEntries
      .filter((e) => e.rollNumber.trim())
      .map((entry, index) => ({
        id: `att${Date.now()}${index}`,
        studentId: `roll_${entry.rollNumber}`,
        studentName: `Roll No. ${entry.rollNumber}`,
        rollNumber: entry.rollNumber,
        class: classInfo.class,
        section: classInfo.section,
        date: new Date().toISOString().split("T")[0],
        status: entry.status,
        markedBy: "Manual Entry",
        markedAt: new Date().toISOString(),
      }));
  };

  const handleSubmit = () => {
    if (processingMethod === "ocr") {
      const records = parseOCRText();
      if (records.length === 0) {
        setError("No attendance records found in the image. Please try another image or use manual entry.");
        return;
      }
      onProcessComplete(records, "ocr");
    } else {
      const records = parseManualEntries();
      if (records.length === 0) {
        setError("Please add at least one attendance record.");
        return;
      }
      onProcessComplete(records, "manual");
    }
    resetModal();
  };

  const resetModal = () => {
    setSelectedFile(null);
    setImagePreview("");
    setOcrText("");
    setManualEntries([{ rollNumber: "", status: "present" }]);
    setError("");
    setShowPreview(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 sticky top-0 bg-background">
          <div>
            <CardTitle>Process Attendance Sheet</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {classInfo.class} - {classInfo.section}
            </p>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Method Selection */}
          <div className="grid grid-cols-2 gap-2">
            {["ocr", "manual"].map((method) => (
              <button
                key={method}
                onClick={() => {
                  setProcessingMethod(method as any);
                  setError("");
                }}
                className={`p-3 rounded border-2 transition-colors ${
                  processingMethod === method
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="font-medium text-sm capitalize">{method === "ocr" ? "Auto OCR" : "Manual Entry"}</div>
                <p className="text-xs text-muted-foreground">
                  {method === "ocr" ? "Scan image automatically" : "Enter roll numbers manually"}
                </p>
              </button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 rounded border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {/* OCR Method */}
          {processingMethod === "ocr" && (
            <>
              {/* File Upload */}
              {!selectedFile ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Upload attendance sheet image</p>
                  <p className="text-xs text-muted-foreground mb-4">JPG, PNG, or WebP (max 5MB)</p>

                  <label>
                    <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-200 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                      Select Image
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Image Display */}
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Attendance sheet"
                      className="w-full max-h-64 object-contain rounded border"
                    />
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded">
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-900">Processing image with OCR...</span>
                    </div>
                  )}

                  {/* OCR Results */}
                  {ocrText && !isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Extracted Text</label>
                        <Badge variant="outline">
                          Confidence: {(ocrConfidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <textarea
                        value={ocrText}
                        onChange={(e) => setOcrText(e.target.value)}
                        className="w-full h-24 p-2 border rounded text-xs font-mono"
                        placeholder="Extracted text from image..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Format should include roll number and status (e.g., "101 Present", "102 A")
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Manual Entry Method */}
          {processingMethod === "manual" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Manual Attendance Entry</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setManualEntries([...manualEntries, { rollNumber: "", status: "present" }])
                  }
                >
                  + Add Row
                </Button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {manualEntries.map((entry, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Roll Number"
                      value={entry.rollNumber}
                      onChange={(e) => {
                        const updated = [...manualEntries];
                        updated[index].rollNumber = e.target.value;
                        setManualEntries(updated);
                      }}
                      className="flex-1"
                    />
                    <select
                      value={entry.status}
                      onChange={(e) => {
                        const updated = [...manualEntries];
                        updated[index].status = e.target.value as any;
                        setManualEntries(updated);
                      }}
                      className="px-3 py-2 border rounded text-sm"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                    <button
                      onClick={() => {
                        setManualEntries(manualEntries.filter((_, i) => i !== index));
                      }}
                      className="text-destructive hover:text-destructive/80 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Total entries: {manualEntries.filter((e) => e.rollNumber.trim()).length}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile && processingMethod === "ocr"}
              className="flex-1"
            >
              Process & Submit
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
