import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, RefreshCw } from "lucide-react";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateHeaders: string[];
  sampleRow: Record<string, string>;
  onUpload: (data: any[]) => Promise<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> }>;
  onSuccess?: () => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  title,
  templateHeaders,
  sampleRow,
  onUpload,
  onSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    setParseError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== "");
        if (lines.length < 2) {
          setParseError("CSV file must contain a header row and at least one data row.");
          setParsedData([]);
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());
        const dataRows = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            obj[h] = values[idx] || "";
          });
          return obj;
        });

        setParsedData(dataRows);
      } catch (err) {
        setParseError("Failed to parse CSV file. Please make sure it is a valid CSV.");
        setParsedData([]);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const headerLine = templateHeaders.join(",");
    const sampleValues = templateHeaders.map((h) => sampleRow[h] || sampleRow[h.toLowerCase()] || "");
    const csvContent = "data:text/csv;charset=utf-8," + [headerLine, sampleValues.join(",")].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "_")}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      // If 100% clean success (no skipped/errors), close automatically.
      // If there are skipped rows or errors, keep modal open to show error details.
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
      <div className="bg-card text-card-foreground border border-border/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <p className="text-xs text-muted-foreground">Upload CSV file to import multiple records at once.</p>
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
          {/* Step 1: Download Template */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-primary/5 border border-primary/15 text-xs">
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Need a sample structure?</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="rounded-xl text-xs font-semibold hover:bg-primary/10 border-primary/30"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 text-primary" /> Download CSV Template
            </Button>
          </div>

          {/* Step 2: Upload CSV Area */}
          {!result ? (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
                  }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                {file ? (
                  <div>
                    <p className="text-sm font-bold text-foreground">{file.name}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                      {parsedData.length} records ready to import
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-foreground">Click to select a CSV file</p>
                    <p className="text-xs text-muted-foreground mt-1">CSV format with header columns: {templateHeaders.join(", ")}</p>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Data Preview */}
              {parsedData.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Preview (First 3 rows)</p>
                  <div className="overflow-x-auto rounded-xl border border-border text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-muted-foreground font-semibold">
                        <tr>
                          {templateHeaders.slice(0, 4).map((h) => (
                            <th key={h} className="p-2 border-b border-border capitalize">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 3).map((row, idx) => (
                          <tr key={idx} className="border-b border-border/40 hover:bg-muted/20">
                            {templateHeaders.slice(0, 4).map((h) => (
                              <td key={h} className="p-2 text-foreground truncate max-w-[120px]">
                                {row[h] || row[h.toLowerCase()] || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
                className="rounded-xl text-xs font-semibold bg-primary text-primary-foreground shadow-md"
              >
                {uploading ? (
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                )}
                {uploading ? "Importing..." : `Import ${parsedData.length} Records`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
