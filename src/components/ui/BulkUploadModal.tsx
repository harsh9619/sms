import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, RefreshCw, Image as ImageIcon, ScanLine } from "lucide-react";
import Tesseract from "tesseract.js";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateHeaders: string[];
  sampleRow?: Record<string, string>;
  sampleRows?: Array<Record<string, string>>;
  onUpload: (data: any[]) => Promise<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> }>;
  onSuccess?: () => void;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  title,
  templateHeaders,
  sampleRow = {},
  sampleRows,
  onUpload,
  onSuccess,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ addedCount: number; skippedCount: number; errors: Array<{ email: string; reason: string }> } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image Upload & OCR State
  const [activeTab, setActiveTab] = useState<"csv" | "image">("csv");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setFile(null);
    setImageFile(null);
    setImagePreview(null);
    setIsOcrProcessing(false);
    setOcrProgress(0);
    setParsedData([]);
    setResult(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  console.log("parsedData", JSON.stringify(parsedData));

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

  const mapHindiHeaderToEnglish = (headerText: string): string | null => {
    const text = headerText.toLowerCase().trim();
    if (text.includes("प्रवेश") && (text.includes("क्रमांक") || text.includes("सं"))) return "registration_no";
    if (text.includes("प्रवेश") && text.includes("तिथि")) return "admission_date";
    if (text.includes("छात्र") || text.includes("विद्यार्थी") || text.includes("student") || (text.includes("नाम") && !text.includes("पिता") && !text.includes("माता"))) return "name";
    if (text.includes("पिता") || text.includes("संरक्षक") || text.includes("father") || text.includes("guardian")) return "father_name";
    if (text.includes("माता") || text.includes("mother")) return "mother_name";
    if (text.includes("जन्म") || text.includes("dob") || text.includes("birth")) return "dateOfBirth";
    if (text.includes("कक्षा") || text.includes("class")) return "class";
    if (text.includes("लिंग") || text.includes("gender") || text.includes("sex")) return "gender";
    if (text.includes("मोबाइल") || text.includes("फोन") || text.includes("phone") || text.includes("mobile") || text.includes("contact")) return "parent_phone";
    if (text.includes("पता") || text.includes("address")) return "address";
    if (text.includes("श्रेणी") || text.includes("जाति") || text.includes("category") || text.includes("caste")) return "caste_category";
    if (text.includes("शैक्षणिक सत्र") || text.includes("academic_year")) return "academic_year";
    return null;
  };

  const normalizeGender = (val: string): string => {
    const lower = val.toLowerCase().trim();
    if (lower.includes("पु") || lower.includes("m") || lower.includes("boy") || lower.includes("male")) return "Male";
    if (lower.includes("स्त्री") || lower.includes("f") || lower.includes("girl") || lower.includes("female")) return "Female";
    return val || "Male";
  };

  const normalizeCategory = (val: string): string => {
    const lower = val.toLowerCase().trim();
    if (lower.includes("सामान्य") || lower.includes("general") || lower.includes("gen")) return "General";
    return val;
  };


  const cleanAddress = (rawAddress: string): string => {
    if (!rawAddress) return "";

    let str = rawAddress.trim();
    // 1. Remove table borders, Devanagari dandas |, ।, ||, underscores, stray slashes
    str = str.replace(/[|।॥_~`^#=|\\]+/g, " ");

    // 2. Remove isolated OCR noise words & table headers/footers
    str = str.replace(/\b(wel|RE|FW|NO|SR|SL|S\.?N\.?|P\.?T\.?O\.?|RE\||wel\|)\b/gi, " ");

    // 3. Fix common OCR misreads for Hindi address tokens in registers
    // e.g. 'KA' or 'का' misread for 'मट' in 'मट रोड'
    str = str.replace(/\b(KA|का)\b/gi, "मट");

    // 4. Remove leading/trailing symbols, stray punctuation
    str = str
      .replace(/^[\s\-_|.:,/]+/g, "")
      .trim();

    // 5. Filter out noise tokens while keeping 1+ char Devanagari words (like मट, रोड, सदर)
    const words = str.split(/\s+/).filter((w) => {
      const cleanWord = w.trim();
      if (!cleanWord) return false;
      if (/[\u0900-\u097F]/.test(cleanWord)) return cleanWord.length >= 1; // Keep Devanagari words
      if (/^\d+$/.test(cleanWord)) return true; // House / Ward / Pin number
      if (cleanWord.length >= 2) return true; // English word >= 2 chars
      return false;
    });

    const finalAddr = words.join(" ").trim();

    // if (!finalAddr || /^\d+$/.test(finalAddr) || finalAddr.length < 2) {
    //   return "सीतापुर";
    // }

    // if (!finalAddr.includes("सीतापुर") && !finalAddr.toLowerCase().includes("sitapur")) {
    //   return `${finalAddr} सीतापुर`;
    // }

    return finalAddr;
  };

  const formatStudentRowPayload = (rawRow: Record<string, string>): Record<string, string> => {
    const row: Record<string, string> = { ...rawRow };

    // Standardize key names to match backend expectations
    const name = row["name"] || row["student_name"] || row[" छात्र का नाम"] || "";
    const fatherName = row["father_name"] || row["fathername"] || row["parentname"] || row["parent_name"] || "";
    const motherName = row["mother_name"] || row["mothername"] || "";
    const parentName = fatherName || motherName || row["parentName"] || name || "Guardian";
    const parentPhone = row["parentphone"] || row["parentPhone"] || row["phone"] || row["mobile"] || row["mobile_no"] || "";
    const className = row["class"] || row["classname"] || "5";
    const division = row["division"] || row["section"] || "A";
    const gender = normalizeGender(row["gender"] || "");
    const casteCategory = normalizeCategory(row["caste_category"] || row["castecategory"] || row["category"] || "");
    const parent_phone = row["parentphone"] || row["parentPhone"] || row["phone"] || row["mobile"] || row["mobile_no"] || "";
    const guardian_phone = row["guardianphone"] || row["guardianPhone"] || row["phone"] || row["mobile"] || row["mobile_no"] || "";
    const rawAddr = row["address"] || row["पता"] || row["addres"] || row["address_line"] || "";
    const address = cleanAddress(rawAddr);
    const dateOfBirth = row["dateofbirth"] || row["dateOfBirth"] || row["dob"] || "";
    const admissionDate = row["admissiondate"] || row["admissionDate"] || row["admission_date"] || "";
    const aadharNo = row["aadharno"] || row["aadharNo"] || row["aadhar_no"] || "";
    const registrationNo = row["registrationno"] || row["registrationNo"] || row["registration_no"] || "";
    const academicYear = row["academicyear"] || row["academicYear"] || row["academic_year"] || "";
    const medium = row["medium"] || "";
    const fatherOccupation = row["fatheroccupation"] || row["fatherOccupation"] || row["father_occupation"] || "";
    const fatherQualification = row["fatherqualification"] || row["fatherQualification"] || row["father_qualification"] || "";
    const motherOccupation = row["motheroccupation"] || row["motherOccupation"] || row["mother_occupation"] || "";
    const motherQualification = row["motherqualification"] || row["motherQualification"] || row["mother_qualification"] || "";


    const formatted: Record<string, string> = {
      ...row,
      name,
      father_name: fatherName,
      mother_name: motherName,
      parentName,
      parentphone: parentPhone,
      parentPhone: parentPhone,
      class: className,
      division: division,
      gender: gender,
      caste_category: casteCategory,
      casteCategory: casteCategory,
      academic_year: academicYear,
      address,
      dateOfBirth,
      admissionDate,
      aadharNo,
      registrationNo,
      academicYear,
      medium,
      fatherOccupation,
      fatherQualification,
      motherOccupation,
      motherQualification,
    };

    if (row["registration_no"] || row["registrationno"]) {
      formatted["registration_no"] = row["registration_no"] || row["registrationno"];
    }
    if (row["admission_date"] || row["admissiondate"]) {
      formatted["admission_date"] = row["admission_date"] || row["admissiondate"];
    }
    if (row["dateofbirth"] || row["dateOfBirth"] || row["dob"]) {
      formatted["dateOfBirth"] = row["dateofbirth"] || row["dateOfBirth"] || row["dob"];
      formatted["dateofbirth"] = formatted["dateOfBirth"];
    }

    return formatted;
  };

  const parseRegisterLine = (cleanLine: string): Record<string, string> | null => {
    if (!cleanLine) return null;

    // Ignore header/footer lines
    if (
      cleanLine.includes("विद्यालय") ||
      cleanLine.includes("प्रवेश पंजी") ||
      cleanLine.includes("शैक्षणिक सत्र") ||
      cleanLine.includes("हस्ताक्षर") ||
      cleanLine.includes("तारीख") ||
      cleanLine.includes("क्रमांक") && cleanLine.includes("नाम")
    ) {
      return null;
    }

    // Find all dates (DD-MM-YYYY or DD/MM/YYYY)
    const dateRegex = /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/g;
    const dateMatches: { text: string; index: number }[] = [];
    let dMatch;
    while ((dMatch = dateRegex.exec(cleanLine)) !== null) {
      dateMatches.push({ text: dMatch[1], index: dMatch.index });
    }

    // Find 10-digit mobile number starting with 6-9
    const phoneRegex = /\b([6-9]\d{9})\b/;
    const phoneMatch = phoneRegex.exec(cleanLine);

    // Find 4-digit registration number
    const regRegex = /\b([1-9]\d{3})\b/;
    const regMatch = regRegex.exec(cleanLine);

    if (dateMatches.length === 0 && !phoneMatch && !regMatch) {
      return null;
    }

    const obj: Record<string, string> = {
      class: "5",
      division: "A",
      academic_year: "2025-2026",
    };

    if (regMatch) {
      obj.registration_no = regMatch[1];
    }

    if (dateMatches.length >= 1) {
      obj.admission_date = dateMatches[0].text;
    }
    if (dateMatches.length >= 2) {
      obj.dateOfBirth = dateMatches[1].text;
      obj.dateofbirth = dateMatches[1].text;
    }

    if (phoneMatch) {
      obj.parentPhone = phoneMatch[1];
      obj.parentphone = phoneMatch[1];
    }

    // Extract Names from text between Admission Date and DOB Date (or before DOB Date)
    let nameBlock = "";
    if (dateMatches.length >= 2) {
      const startIdx = dateMatches[0].index + dateMatches[0].text.length;
      const endIdx = dateMatches[1].index;
      nameBlock = cleanLine.substring(startIdx, endIdx).trim();
    } else if (dateMatches.length === 1 && phoneMatch) {
      const startIdx = dateMatches[0].index + dateMatches[0].text.length;
      const endIdx = phoneMatch.index;
      nameBlock = cleanLine.substring(startIdx, endIdx).trim();
    }

    // Clean name block
    nameBlock = nameBlock.replace(/[\d|[\](){}#*=_-]/g, " ").replace(/\s+/g, " ").trim();
    if (nameBlock) {
      const words = nameBlock.split(" ").filter((w) => w.length > 0);
      if (words.length >= 6) {
        obj.name = `${words[0]} ${words[1]}`;
        obj.father_name = `${words[2]} ${words[3]}`;
        obj.mother_name = `${words[4]} ${words[5]}`;
      } else if (words.length === 5) {
        obj.name = `${words[0]} ${words[1]}`;
        obj.father_name = `${words[2]} ${words[3]}`;
        obj.mother_name = words[4];
      } else if (words.length === 4) {
        obj.name = `${words[0]} ${words[1]}`;
        obj.father_name = `${words[2]} ${words[3]}`;
        obj.mother_name = "";
      } else if (words.length === 3) {
        obj.name = words[0];
        obj.father_name = words[1];
        obj.mother_name = words[2];
      } else if (words.length === 2) {
        obj.name = `${words[0]} ${words[1]}`;
        obj.father_name = `${words[0]} ${words[1]}`;
      } else if (words.length === 1) {
        obj.name = words[0];
      }
    }

    obj.parentName = obj.father_name || obj.mother_name || obj.name || "Guardian";

    // Extract after DOB Date: Class, Gender, Address, Category
    let afterDobBlock = "";
    if (dateMatches.length >= 2) {
      afterDobBlock = cleanLine.substring(dateMatches[1].index + dateMatches[1].text.length).trim();
    } else if (phoneMatch) {
      afterDobBlock = cleanLine.substring(phoneMatch.index + phoneMatch[0].length).trim();
    }

    if (afterDobBlock) {
      // Check gender
      if (/पु\.?|पुरुष|male|\bm\b/i.test(afterDobBlock)) {
        obj.gender = "Male";
      } else if (/स्त्री|महिला|female|\bf\b/i.test(afterDobBlock)) {
        obj.gender = "Female";
      } else {
        obj.gender = "Male";
      }

      // Check category
      if (/सामान्य|general|\bgen\b/i.test(afterDobBlock)) {
        obj.caste_category = "General";
        obj.casteCategory = "General";
      } else if (/\bobc\b/i.test(afterDobBlock)) {
        obj.caste_category = "OBC";
        obj.casteCategory = "OBC";
      } else if (/\bsc\b/i.test(afterDobBlock)) {
        obj.caste_category = "SC";
        obj.casteCategory = "SC";
      } else if (/\bst\b/i.test(afterDobBlock)) {
        obj.caste_category = "ST";
        obj.casteCategory = "ST";
      } else {
        obj.caste_category = "General";
        obj.casteCategory = "General";
      }

      // Extract address if phone is matched
      if (phoneMatch) {
        const pIdx = afterDobBlock.indexOf(phoneMatch[1]);
        if (pIdx !== -1) {
          let addrPart = afterDobBlock.substring(pIdx + phoneMatch[1].length).trim();
          addrPart = addrPart.replace(/सामान्य|general|obc|sc|st|-/gi, "").trim();
          if (addrPart) {
            obj.address = addrPart;
          }
        }
      }
    }

    if (!obj.name) return null;
    return obj;
  };

  const parseOcrTextToData = (ocrText: string) => {
    const rawLines = ocrText
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (rawLines.length === 0) {
      setParseError("No text found in the image.");
      setParsedData([]);
      return;
    }

    // 1. Try Smart Register Pattern Parsing line by line
    const smartRows: Record<string, string>[] = [];
    for (const line of rawLines) {
      const parsedRow = parseRegisterLine(line);
      if (parsedRow && parsedRow.name) {
        smartRows.push(formatStudentRowPayload(parsedRow));
      }
    }

    if (smartRows.length > 0) {
      setParseError(null);
      setParsedData(smartRows);
      return;
    }

    // 2. Fallback to Tabular / Header-mapped parsing
    const cleanedHeaders = templateHeaders.map((h) => h.toLowerCase().trim());
    let columnHeaderMap: (string | null)[] = [];
    let startLineIdx = 0;

    for (let lIdx = 0; lIdx < Math.min(rawLines.length, 5); lIdx++) {
      const parts = rawLines[lIdx].split(/[\t,|;]+|\s{2,}/).map((p) => p.trim());
      const mapped = parts.map((p) => {
        const hindiMatch = mapHindiHeaderToEnglish(p);
        if (hindiMatch) return hindiMatch;
        const lowerP = p.toLowerCase();
        const directMatch = cleanedHeaders.find((h) => h === lowerP || h.includes(lowerP) || lowerP.includes(h));
        return directMatch || null;
      });

      const validCount = mapped.filter((m) => m !== null).length;
      if (validCount >= 2) {
        columnHeaderMap = mapped;
        startLineIdx = lIdx + 1;
        break;
      }
    }

    const rows: Record<string, string>[] = [];

    for (let i = startLineIdx; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (line.includes("विद्यालय") || line.includes("प्रवेश पंजी") || line.includes("शैक्षणिक सत्र")) continue;

      const cells = line.split(/[\t|;,]|\s{2,}/).map((c) => c.trim());
      if (cells.length < 2) continue;

      const rawRowObj: Record<string, string> = {};

      if (columnHeaderMap.length > 0) {
        columnHeaderMap.forEach((headerKey, colIndex) => {
          if (headerKey && colIndex < cells.length) {
            rawRowObj[headerKey] = cells[colIndex];
          }
        });
      }

      if (rawRowObj["name"] || rawRowObj["registration_no"] || Object.values(rawRowObj).some((v) => v.length > 0)) {
        const formattedRow = formatStudentRowPayload(rawRowObj);
        rows.push(formattedRow);
      }
    }

    if (rows.length === 0) {
      setParseError("Could not parse structured table rows from image text. Please try a clearer register photo.");
      setParsedData([]);
    } else {
      setParseError(null);
      setParsedData(rows);
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
        // Try recognizing with both English and Hindi for registers
        res = await Tesseract.recognize(imgFile, "hin+eng", {
          logger: (m: any) => {
            if (m.status === "recognizing text") {
              setOcrProgress(Math.round((m.progress || 0) * 100));
            }
          },
        });
      } catch (e) {
        // Fallback to English if Hindi traineddata download fails or is unsupported
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

  const handleDownloadTemplate = () => {
    const headerLine = templateHeaders.join(",");
    const rowsToExport = sampleRows && sampleRows.length > 0 ? sampleRows : [sampleRow];
    const dataLines = rowsToExport.map((row) =>
      templateHeaders.map((h) => {
        const val = row[h] || row[h.toLowerCase()] || "";
        return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headerLine, ...dataLines].join("\n");
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
              <p className="text-xs text-muted-foreground">Upload CSV file or scan an image to import records.</p>
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
          {/* Mode Selector Tabs */}
          {!result && (
            <div className="flex bg-muted/60 p-1 rounded-2xl border border-border">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("csv");
                  setParseError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "csv" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <FileSpreadsheet className="h-4 w-4" /> CSV File Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("image");
                  setParseError(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === "image" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <ImageIcon className="h-4 w-4 text-violet-500" /> Upload from Image (OCR)
              </button>
            </div>
          )}

          {/* Step 1: Download Template */}
          {activeTab === "csv" && (
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
          )}

          {/* Upload Area */}
          {!result ? (
            <div className="space-y-4">
              {activeTab === "csv" ? (
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
              ) : (
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
                          <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg border border-border object-contain" />
                        )}
                        <p className="text-sm font-bold text-foreground">{imageFile.name}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-semibold text-foreground">Click to select an Image file</p>
                        <p className="text-xs text-muted-foreground mt-1">Upload image containing tabular student records (PNG, JPG)</p>
                      </div>
                    )}
                  </div>

                  {isOcrProcessing && (
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs flex items-center gap-3">
                      <ScanLine className="h-4 w-4 text-violet-500 animate-spin" />
                      <div className="flex-1">
                        <div className="flex justify-between font-semibold text-foreground mb-1">
                          <span>Scanning image with OCR...</span>
                          <span>{ocrProgress}%</span>
                        </div>
                        <div className="w-full bg-violet-200 dark:bg-violet-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-violet-600 h-full transition-all duration-200" style={{ width: `${ocrProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {parseError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Data Preview */}
              {parsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wider">Preview ({parsedData.length} total rows detected)</p>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-border text-xs max-h-48">
                    <table className="w-full text-left">
                      <thead className="bg-muted text-muted-foreground font-semibold sticky top-0">
                        <tr>
                          {templateHeaders.slice(0, 5).map((h) => (
                            <th key={h} className="p-2 border-b border-border capitalize">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx} className="border-b border-border/40 hover:bg-muted/20">
                            {templateHeaders.slice(0, 5).map((h) => (
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
