import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { X, Upload, AlertCircle, CheckCircle, FileUp, Image as ImageIcon } from "lucide-react";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, source: "excel" | "csv" | "image") => void;
  title: string;
  description: string;
  onTemplateDownload: () => void;
}

export function BulkImportModal({
  isOpen,
  onClose,
  onImport,
  title,
  description,
  onTemplateDownload,
}: BulkImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSource, setImportSource] = useState<"excel" | "csv" | "image">("excel");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes: Record<string, string[]> = {
      excel: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      csv: ["text/csv"],
      image: ["image/jpeg", "image/png", "image/webp"],
    };

    if (validTypes[importSource]?.includes(file.type)) {
      setSelectedFile(file);
    } else {
      alert(`Invalid file type for ${importSource}. Please select a valid file.`);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile, importSource);
      setSelectedFile(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Import Source Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Import Source</label>
            <div className="grid grid-cols-3 gap-2">
              {["excel", "csv", "image"].map((source) => (
                <button
                  key={source}
                  onClick={() => {
                    setImportSource(source as any);
                    setSelectedFile(null);
                  }}
                  className={`p-2 rounded border-2 transition-colors ${
                    importSource === source
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {source === "excel" && <FileUp className="h-4 w-4" />}
                    {source === "csv" && <FileUp className="h-4 w-4" />}
                    {source === "image" && <ImageIcon className="h-4 w-4" />}
                    <span className="text-xs font-medium capitalize">{source}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
            <p className="text-xs text-muted-foreground mb-4">or</p>

            <label>
              <span className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium transition-all duration-200 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer">
                Browse Files
              </span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept={
                  importSource === "excel"
                    ? ".xlsx,.xls"
                    : importSource === "csv"
                      ? ".csv"
                      : "image/*"
                }
              />
            </label>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                  <p className="text-xs text-green-700">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-green-600 hover:text-green-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Info Box */}
          <div className="flex gap-2 p-3 bg-blue-50 rounded border border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <p className="font-medium mb-1">Tips for bulk import:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Use the template for consistent formatting</li>
                <li>Ensure all required fields are filled</li>
                <li>Maximum file size: 5MB</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onTemplateDownload}
              className="flex-1"
            >
              Download Template
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile}
              className="flex-1"
            >
              Import {selectedFile ? `(1 file)` : ""}
            </Button>
          </div>

          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
