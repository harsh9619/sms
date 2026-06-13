import React, { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../components/ui/Avatar";
import { fetchStudents } from "../../lib/api";
import type { Student } from "../../types";
import { useSchool } from "../../context/SchoolContext";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  Upload,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  ImagePlus,
  ChevronRight,
  Loader2,
  Table2,
} from "lucide-react";
import * as XLSX from "xlsx";
import Tesseract from "tesseract.js";
import { transliterateHindiToEnglish } from "../../lib/transliterate";


// ─── Types ───────────────────────────────────────────────────────────────────

interface BulkRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  section: string;
  rollNumber: string;
  parentName: string;
  parentPhone: string;
  address: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  bloodGroup?: string;
  photoFile?: File;
  photoPreview?: string;
  errors: string[];
}

// ─── Column alias map ─────────────────────────────────────────────────────────

const COLUMN_MAP: Record<string, keyof BulkRow> = {
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
  "name": "name",
  "full name": "name",
  "नाम": "name",
  "छात्र का नाम": "name",
  "विद्यार्थी का नाम": "name",
  "छात्र/छात्रा का नाम": "name",
  "email": "email",
  "email address": "email",
  "phone": "phone",
  "mobile": "phone",
  "phone number": "phone",
  "मोबाइल": "phone",
  "मोबाइल नंबर": "phone",
  "फ़ोन": "phone",
  "संपर्क नंबर": "phone",
  "class": "class",
  "grade": "class",
  "कक्षा": "class",
  "section": "section",
  "वर्ग": "section",
  "parent name": "parentName",
  "parentname": "parentName",
  "guardian name": "parentName",
  "पिता का नाम": "parentName",
  "माता का नाम": "parentName",
  "अभिभावक का नाम": "parentName",
  "parent phone": "parentPhone",
  "parentphone": "parentPhone",
  "address": "address",
  "पता": "address",
  "dob": "dateOfBirth",
  "date of birth": "dateOfBirth",
  "birthday": "dateOfBirth",
  "जन्म तिथि": "dateOfBirth",
  "जन्मतिथि": "dateOfBirth",
  "gender": "gender",
  "sex": "gender",
  "लिंग": "gender",
  "blood group": "bloodGroup",
  "bloodgroup": "bloodGroup",
  "blood type": "bloodGroup",
  "रक्त समूह": "bloodGroup",
};

function normalizeKey(raw: string): keyof BulkRow | null {
  const clean = raw.trim().toLowerCase().replace(/[_\-]/g, " ");
  return COLUMN_MAP[clean] ?? null;
}
function validateRow(row: Partial<BulkRow>): string[] {
  const errs: string[] = [];

  if (!row.name?.trim()) {
    errs.push("Student name required");
  }

  if (!row.rollNumber?.trim()) {
    errs.push("Roll number required");
  }

  if (!row.class?.trim()) {
    errs.push("Class required");
  }

  return errs;
}

// ─── Image → JSON via Claude Vision ──────────────────────────────────────────


// ─── Image → JSON via Claude Vision ──────────────────────────────────────────


async function extractStudentsFromImage(
  file: File
): Promise<BulkRow[]> {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(file, "hin+eng", {
      logger: (m) => {
        console.log(m);
      },
    });

    console.log("OCR RESULT:", text);

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);


    const students: BulkRow[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract phone number (10-digit)
      const cleanLineNoSpaces = line.replace(/[\s-]/g, "");
      const phoneMatch = cleanLineNoSpaces.match(/\d{10}/);
      if (!phoneMatch) continue;
      const phone = phoneMatch[0];

      // Split the line into tokens by whitespace and grid lines
      const tokens = line
        .split(/[\s|\[\]\/\\:;\t]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      // Filter out tokens that are just separators or noise
      const cleanTokens = tokens.filter((t) => {
        // Keep if it contains any alphanumeric character or Hindi character
        return /[a-zA-Z0-9\u0900-\u097F]/.test(t);
      });

      if (cleanTokens.length === 0) continue;

      // Extract landmarks
      let rollNumber = "";
      let name = "";
      let parentName = "";
      let dateOfBirth = "";
      let studentClass = "";
      let gender: "male" | "female" | "other" = "male";
      let address = "";
      const dates: string[] = [];

      // 1. Find all Dates
      for (const token of cleanTokens) {
        // Clean common OCR typos in the token for year
        const cleanToken = token
          .replace(/o/gi, "0")
          .replace(/[liI]/gi, "1")
          .replace(/[sS]/g, "5");
        const dateMatch = cleanToken.match(/\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4}/);
        if (dateMatch) {
          dates.push(dateMatch[0]);
        }
      }

      // Classify detected dates
      let admissionDate = "";
      for (const d of dates) {
        const partsOfDate = d.split(/[-\/.]/);
        const year = parseInt(partsOfDate[2]);
        if (year >= 2020) {
          admissionDate = d;
        } else if (year < 2020) {
          dateOfBirth = d;
        }
      }

      // 2. Find Roll/Admission Number (typo-resistant and merge-resistant)
      let rollNumberCandidates: string[] = [];

      for (let j = 0; j < cleanTokens.length; j++) {
        const token = cleanTokens[j];

        // Skip if it matches a date pattern or is in the dates array
        const normalizedForDate = token
          .replace(/o/gi, "0")
          .replace(/[liI]/gi, "1")
          .replace(/[sS]/g, "5");

        let isDate = false;
        if (/\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}/.test(normalizedForDate) || /\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}/.test(normalizedForDate)) {
          isDate = true;
        }
        for (const d of dates) {
          if (d.includes(token) || token.includes(d)) {
            isDate = true;
          }
        }
        if (isDate) continue;

        // Clean common OCR typos
        const normalized = token
          .replace(/o/gi, "0")
          .replace(/[liI]/gi, "1")
          .replace(/[sS]/g, "5")
          .replace(/[bB]/g, "8");

        // Extract digits only
        const digitOnly = normalized.replace(/\D/g, "");

        if (digitOnly && digitOnly.length >= 1 && digitOnly.length <= 6) {
          // Ensure it's not the phone number or a large chunk of the phone number
          if (digitOnly === phone) continue;
          if (phone.includes(digitOnly) && digitOnly.length >= 4) continue;

          rollNumberCandidates.push(digitOnly);
        }
      }

      // Choose the best roll number from candidates
      if (rollNumberCandidates.length > 0) {
        // Prioritize 3 or 4-digit candidates (typical for school roll/admission numbers)
        const schoolCodeCandidate = rollNumberCandidates.find(
          (c) => c.length === 4 || c.length === 3
        );
        if (schoolCodeCandidate) {
          rollNumber = schoolCodeCandidate;
        } else {
          // Fall back to the earliest candidate (often serial number like 1, 2, 3...)
          let foundEarly = false;
          for (let j = 0; j < Math.min(cleanTokens.length, 3); j++) {
            const token = cleanTokens[j];
            const normalized = token
              .replace(/o/gi, "0")
              .replace(/[liI]/gi, "1")
              .replace(/[sS]/g, "5")
              .replace(/[bB]/g, "8");
            const digitOnly = normalized.replace(/\D/g, "");
            if (rollNumberCandidates.includes(digitOnly)) {
              rollNumber = digitOnly;
              foundEarly = true;
              break;
            }
          }
          if (!foundEarly) {
            rollNumber = rollNumberCandidates[0];
          }
        }
      }

      // 3. Find Gender
      for (const token of cleanTokens) {
        const isFemale =
          token.includes("स्त्री") ||
          token.includes("महिला") ||
          token.includes("स्त्री.") ||
          /\b(f|female)\b/i.test(token);
        const isMale =
          token.includes("पु") ||
          token.includes("पु.") ||
          token.includes("पुरुष") ||
          /\b(m|male)\b/i.test(token);

        if (isFemale) {
          gender = "female";
          break;
        } else if (isMale) {
          gender = "male";
          break;
        }
      }

      // 4. Find Class (usually 5 or a digit, or Roman numeral)
      for (let j = 0; j < cleanTokens.length; j++) {
        const token = cleanTokens[j];
        if (/^[1-9]$/.test(token) && j > 1) {
          // Verify it's not part of any date
          let isPartOfDate = false;
          for (const d of dates) {
            if (d.includes(token)) isPartOfDate = true;
          }
          if (!isPartOfDate) {
            studentClass = token;
            break;
          }
        }
      }
      if (!studentClass) {
        studentClass = "5"; // Default fallback based on register page
      }

      // 5. Find Address (tokens immediately after the mobile number column)
      let phoneTokenIdx = -1;
      for (let j = 0; j < cleanTokens.length; j++) {
        const digits = cleanTokens[j].replace(/\D/g, "");
        if (digits === phone) {
          phoneTokenIdx = j;
          break;
        }
      }
      let addressTokens: string[] = [];
      if (phoneTokenIdx !== -1) {
        for (let j = phoneTokenIdx + 1; j < cleanTokens.length; j++) {
          const token = cleanTokens[j];
          // Stop if we hit category like "सामान्य" or OBC or remarks "—"
          if (
            token === "सामान्य" ||
            token === "OBC" ||
            token === "SC" ||
            token === "ST" ||
            token === "—"
          ) {
            break;
          }
          // Ignore purely numeric tokens
          if (!/^\d+$/.test(token) && token.length > 1) {
            addressTokens.push(token);
          }
        }
      }
      address = addressTokens.join(" ");

      // 6. Find Names (Student Name & Father's Name)
      // Locate the indices of the dates in cleanTokens
      let firstDateIdx = -1;
      let secondDateIdx = -1;
      for (let j = 0; j < cleanTokens.length; j++) {
        const token = cleanTokens[j];
        const cleanToken = token
          .replace(/o/gi, "0")
          .replace(/[liI]/gi, "1")
          .replace(/[sS]/g, "5");
        if (/\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4}/.test(cleanToken)) {
          if (firstDateIdx === -1) {
            firstDateIdx = j;
          } else if (secondDateIdx === -1) {
            secondDateIdx = j;
            break;
          }
        }
      }

      const nameTokens: string[] = [];
      if (firstDateIdx !== -1 && secondDateIdx !== -1) {
        for (let j = firstDateIdx + 1; j < secondDateIdx; j++) {
          const token = cleanTokens[j];
          // Filter out numbers
          if (/^\d+$/.test(token)) continue;
          // Filter out class single digit
          if (token === studentClass) continue;
          // Filter out gender
          if (
            token === "पु." ||
            token === "स्त्री" ||
            token === "पु" ||
            token === "स्त्री."
          )
            continue;
          // Filter out very short noise
          if (token.length <= 1 && !/[\u0900-\u097F]/.test(token)) continue;

          nameTokens.push(token);
        }
      }

      if (nameTokens.length >= 2) {
        name = nameTokens.slice(0, 2).join(" ").replace(/\.$/, "");
        if (nameTokens.length >= 4) {
          parentName = nameTokens.slice(2, 4).join(" ");
        } else {
          parentName = nameTokens.slice(2).join(" ");
        }
      }

      // Fallback for names if extraction was sparse or date indexes were missed
      if (!name || !parentName) {
        const fallbackTokens: string[] = [];
        let startCollect = false;
        for (let j = 0; j < cleanTokens.length; j++) {
          const token = cleanTokens[j];
          if (
            token === rollNumber ||
            (firstDateIdx !== -1 && j === firstDateIdx)
          ) {
            startCollect = true;
            continue;
          }
          if (startCollect) {
            // Stop at phone
            if (token.replace(/\D/g, "") === phone) break;
            // Skip dates
            if (/\d{1,2}[-\/.]\d{1,2}[-\/.]\d{4}/.test(token)) continue;
            if (
              token === "पु." ||
              token === "स्त्री" ||
              token === "पु" ||
              token === "स्त्री."
            )
              continue;
            if (/^\d+$/.test(token)) continue;
            if (token.length <= 1 && !/[\u0900-\u097F]/.test(token)) continue;
            if (
              token === "सामान्य" ||
              token === "OBC" ||
              token === "SC" ||
              token === "ST" ||
              token === "—"
            )
              continue;

            fallbackTokens.push(token);
          }
        }
        if (fallbackTokens.length > 0) {
          if (!name)
            name = fallbackTokens.slice(0, 2).join(" ").replace(/\.$/, "");
          if (!parentName && fallbackTokens.length > 2) {
            parentName = fallbackTokens.slice(2, 4).join(" ");
          }
        }
      }

      const row: BulkRow = {
        id: `ocr_${Date.now()}_${i}`,
        name: transliterateHindiToEnglish(name) || "Unknown Student",
        email: "",
        phone,
        class: studentClass,
        section: "A",
        rollNumber,
        parentName: transliterateHindiToEnglish(parentName) || "Parent",
        parentPhone: "",
        address: transliterateHindiToEnglish(address) || "",
        dateOfBirth: dateOfBirth,
        gender,
        bloodGroup: "",
        errors: [],
      };

      row.errors = validateRow(row);

      students.push(row);
    }

    return students;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// ─── BulkUploadModal ──────────────────────────────────────────────────────────

interface BulkUploadModalProps {
  onClose: () => void;
  onImport: (students: Student[]) => void;
}

type SourceTab = "excel" | "image";

function BulkUploadModal({ onClose, onImport }: BulkUploadModalProps) {
  const [sourceTab, setSourceTab] = useState<SourceTab>("excel");
  const [step, setStep] = useState<"upload" | "preview" | "photos">("upload");
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Parse Excel ──────────────────────────────────────────────────────────

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
        const parsed: BulkRow[] = raw.map((r, i) => {
          const mapped: Partial<BulkRow> = {};
          for (const [k, v] of Object.entries(r)) {
            const field = normalizeKey(k);
            if (field) (mapped as Record<string, unknown>)[field] = v;
          }
          const g = (mapped.gender as string | undefined)?.toLowerCase();
          mapped.gender = g === "female" || g === "f" ? "female" : g === "other" ? "other" : "male";
          const errors = validateRow(mapped);
          return { id: `bulk_${Date.now()}_${i}`, name: "", email: "", phone: "", class: "", section: "", rollNumber: "", parentName: "", parentPhone: "", address: "", dateOfBirth: "", gender: "male", errors, ...mapped } as BulkRow;
        });
        setRows(parsed);
        setStep("preview");
      } catch {
        alert("Failed to parse Excel file. Please check the format.");
      } finally {
        setProcessing(false);
        setProcessingMsg("");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Parse Image via Claude Vision ─────────────────────────────────────────

  const parseImage = async (file: File) => {
    setImageError(null);

    setImagePreview(
      URL.createObjectURL(file)
    );

    setFileName(file.name);

    setProcessing(true);

    setProcessingMsg(
      "Reading Hindi admission register..."
    );

    try {
      const extracted =
        await extractStudentsFromImage(file);

      if (extracted.length === 0) {
        setImageError(
          "No student records detected."
        );
        return;
      }

      setRows(extracted);

      setStep("preview");
    } catch (err) {
      console.error(err);

      setImageError(
        "Failed to process image."
      );
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

  // ── Photo assignment ─────────────────────────────────────────────────────

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const updated = [...rows];
    files.forEach((file) => {
      const base = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
      const idx = updated.findIndex(
        (r) =>
          base.includes(r.rollNumber.toLowerCase()) ||
          base.includes(r.name.toLowerCase().replace(/\s+/g, "_")) ||
          base.includes(r.name.toLowerCase().replace(/\s+/g, ""))
      );
      if (idx !== -1) {
        updated[idx].photoFile = file;
        updated[idx].photoPreview = URL.createObjectURL(file);
      }
    });
    setRows(updated);
  };

  // ── Finalize ─────────────────────────────────────────────────────────────

  const handleImport = () => {
    const valid = rows.filter((r) => r.errors.length === 0);
    const students: Student[] = valid.map((r) => ({
      id: `s${Date.now()}_${r.rollNumber}`,
      name: r.name,
      email: r.email,
      phone: r.phone,
      class: r.class,
      section: r.section,
      rollNumber: r.rollNumber,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      address: r.address,
      dateOfBirth: r.dateOfBirth,
      gender: r.gender,
      bloodGroup: r.bloodGroup,
      admissionDate: new Date().toISOString().split("T")[0],
    }));
    onImport(students);
    onClose();
  };

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.length - validCount;

  // ── Reset to upload ───────────────────────────────────────────────────────

  const resetUpload = () => {
    setStep("upload");
    setRows([]);
    setFileName("");
    setImagePreview(null);
    setImageError(null);
  };

  // ── Template download ────────────────────────────────────────────────────

  const downloadTemplate = () => {
    const template = [{ "Roll No": "101", "Full Name": "Aarav Sharma", Email: "aarav@example.com", Phone: "9876543210", Class: "10", Section: "A", "Parent Name": "Rakesh Sharma", "Parent Phone": "9876543211", Address: "123 MG Road, Mumbai", "Date of Birth": "2008-05-15", Gender: "male", "Blood Group": "B+" }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(template), "Students");
    XLSX.writeFile(wb, "bulk_upload_template.xlsx");
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
              <h2 className="text-lg font-semibold">Bulk Upload Students</h2>
              <p className="text-xs text-muted-foreground">Import from Excel or scan an image · Review & confirm</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            {(["upload", "preview", "photos"] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${step === s ? "bg-primary text-primary-foreground" : rows.length > 0 && i < ["upload", "preview", "photos"].indexOf(step) ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  <span>{i + 1}</span>
                  <span className="capitalize">{s}</span>
                </div>
                {i < 2 && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── STEP 1: Upload ── */}
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
                  Image / Photo
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">AI</span>
                </button>
              </div>

              {/* ── Excel tab ── */}
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
                      <p className="text-xs text-blue-600">Download our Excel template with correct column headers</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={downloadTemplate} className="border-blue-200 text-blue-700 hover:bg-blue-100">
                      <Download className="h-4 w-4 mr-2" /> Template
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Accepted Column Names</p>
                    <div className="flex flex-wrap gap-2">
                      {["Roll No", "Full Name", "Email", "Phone", "Class", "Section", "Parent Name", "Parent Phone", "Address", "Date of Birth", "Gender", "Blood Group"].map((c) => (
                        <span key={c} className="px-2 py-1 bg-muted text-xs rounded-md font-mono">{c}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Image tab ── */}
              {sourceTab === "image" && (
                <>
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="h-8 w-8 rounded-lg bg-purple-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GraduationCap className="h-4 w-4 text-purple-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900">AI-Powered Extraction</p>
                      <p className="text-xs text-purple-700 mt-0.5">
                        Upload a photo of a student register, printed list, handwritten sheet, or any document with student data. Claude AI will read and extract all records automatically.
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
                            <img src={imagePreview} alt="Uploaded" className="h-32 w-48 object-cover rounded-xl opacity-60" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2 shadow-md">
                                <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                                <span className="text-xs font-medium text-purple-800">{processingMsg}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium text-muted-foreground">Claude is reading your image…</p>
                          <p className="text-xs text-muted-foreground mt-1">This may take a few seconds</p>
                        </div>
                      </div>
                    ) : imagePreview ? (
                      <div className="p-6 flex items-center gap-4">
                        <img src={imagePreview} alt="Preview" className="h-24 w-32 object-cover rounded-xl ring-2 ring-purple-300" />
                        <div>
                          <p className="font-medium text-sm">{fileName}</p>
                          <p className="text-xs text-muted-foreground mt-1">Click or drop to replace</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-12 flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl bg-purple-100 flex items-center justify-center">
                          <ImagePlus className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-base">Drop your image here</p>
                          <p className="text-sm text-muted-foreground mt-1">JPG, PNG, WebP · Click to browse</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {imageError && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Extraction failed</p>
                        <p className="text-xs text-red-600 mt-0.5">{imageError}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Works best with</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { icon: "📋", label: "Student register pages" },
                        { icon: "🖨️", label: "Printed admission forms" },
                        { icon: "✍️", label: "Handwritten lists" },
                        { icon: "📸", label: "Photos of notice boards" },
                      ].map((item) => (
                        <div key={item.label} className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-2xl mb-1">{item.icon}</div>
                          <p className="text-xs text-muted-foreground leading-tight">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{validCount}</span> valid
                </div>
                {errorCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{errorCount}</span> with errors
                  </div>
                )}
                {sourceTab === "image" && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
                    <ImagePlus className="h-3.5 w-3.5" /> Extracted by AI
                  </div>
                )}
                <button onClick={resetUpload} className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                  ← Change file
                </button>
              </div>

              {sourceTab === "image" && imagePreview && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                  <img src={imagePreview} alt="Source" className="h-16 w-24 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-medium">{fileName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Claude extracted {rows.length} record{rows.length !== 1 ? "s" : ""} from this image</p>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                      <tr>
                        {["#", "Name", "Roll No", "Class", "Phone", "Gender", "Status"].map((h) => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <tr key={row.id} className={`border-t border-border ${row.errors.length > 0 ? "bg-red-50/50" : "hover:bg-muted/20"}`}>
                          <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                          <td className="px-4 py-2.5 font-medium whitespace-nowrap">{row.name || <span className="text-red-400 italic">missing</span>}</td>
                          <td className="px-4 py-2.5"><Badge variant="outline">{row.rollNumber || "—"}</Badge></td>
                          <td className="px-4 py-2.5">{row.class}{row.section ? `-${row.section}` : ""}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{row.phone || "—"}</td>
                          <td className="px-4 py-2.5"><Badge variant={row.gender === "female" ? "secondary" : "info"}>{row.gender}</Badge></td>
                          <td className="px-4 py-2.5">
                            {row.errors.length === 0 ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle className="h-3.5 w-3.5" /> OK</span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-500 text-xs" title={row.errors.join(", ")}><AlertCircle className="h-3.5 w-3.5" />{row.errors[0]}</span>
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

          {/* ── STEP 3: Photos ── */}
          {step === "photos" && (
            <div className="space-y-5">
              <div onClick={() => photoInputRef.current?.click()} className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-all">
                <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                    <ImagePlus className="h-7 w-7 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold">Upload Student Photos</p>
                    <p className="text-sm text-muted-foreground mt-1">Name files by <strong>roll number</strong> or <strong>student name</strong> for auto-matching</p>
                    <p className="text-xs text-muted-foreground mt-0.5">e.g. <code className="bg-muted px-1 rounded">101.jpg</code> or <code className="bg-muted px-1 rounded">aarav_sharma.png</code></p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {rows.filter((r) => r.errors.length === 0).map((row) => (
                  <div key={row.id} className={`rounded-xl border p-3 flex flex-col items-center gap-2 text-center transition-all ${row.photoPreview ? "border-green-300 bg-green-50/40" : "border-border bg-muted/20"}`}>
                    {row.photoPreview ? (
                      <img src={row.photoPreview} alt={row.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-green-400" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                        {row.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium leading-tight">{row.name}</p>
                      <p className="text-[10px] text-muted-foreground">{row.rollNumber}</p>
                    </div>
                    {row.photoPreview && <span className="text-[10px] text-green-600 flex items-center gap-0.5"><CheckCircle className="h-3 w-3" /> Matched</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between flex-shrink-0 gap-3">
          <div className="text-sm text-muted-foreground">
            {step === "preview" && `${validCount} of ${rows.length} rows ready to import`}
            {step === "photos" && `${rows.filter((r) => r.photoPreview).length} of ${validCount} photos matched`}
          </div>
          <div className="flex gap-2">
            {step !== "upload" && (
              <Button variant="outline" onClick={() => setStep(step === "photos" ? "preview" : "upload")}>Back</Button>
            )}
            {step === "upload" && <Button variant="outline" onClick={onClose}>Cancel</Button>}
            {step === "preview" && (
              <>
                <Button variant="outline" onClick={() => setStep("photos")}>
                  <ImagePlus className="h-4 w-4 mr-2" /> Add Photos
                </Button>
                <Button onClick={handleImport} disabled={validCount === 0}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Import {validCount} Students
                </Button>
              </>
            )}
            {step === "photos" && (
              <Button onClick={handleImport} disabled={validCount === 0}>
                <CheckCircle className="h-4 w-4 mr-2" /> Import {validCount} Students
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



// ─── StudentsPage ─────────────────────────────────────────────────────────────

export function StudentsPage() {
  const { activeSchool } = useSchool();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    visible: boolean;
    success: boolean;
    message: string;
  }>({ visible: false, success: false, message: "" });

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNumber.includes(searchQuery);
      const matchesClass = !filterClass || s.class === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, filterClass]);

  const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  React.useEffect(() => {
    let mounted = true;
    fetchStudents()
      .then((d) => { if (mounted) setStudents(d); })
      .catch(() => { });
    return () => { mounted = false; };
  }, [activeSchool]);

  const handleBulkImport = (newStudents: Student[]) => {
    setStudents((prev) => [...prev, ...newStudents]);
    setImportStatus({
      visible: true,
      success: true,
      message: `Successfully imported ${newStudents.length} student${newStudents.length !== 1 ? "s" : ""}!`,
    });
    setTimeout(() => setImportStatus((s) => ({ ...s, visible: false })), 4000);
  };

  const handleExportExcel = () => {
    const data = filteredStudents.map((s) => ({
      "Roll No": s.rollNumber,
      Name: s.name,
      Email: s.email,
      Phone: s.phone,
      Class: s.class,
      Section: s.section,
      "Parent Name": s.parentName,
      "Parent Phone": s.parentPhone,
      Address: s.address,
      "Date of Birth": s.dateOfBirth,
      Gender: s.gender,
      "Blood Group": s.bloodGroup || "",
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_data.xlsx");
  };

  const handleSave = () => {
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...s, ...formData } as Student : s))
      );
    } else {
      const newStudent: Student = {
        id: `s${Date.now()}`,
        name: formData.name || "",
        email: formData.email || "",
        phone: formData.phone || "",
        class: formData.class || "",
        section: formData.section || "",
        rollNumber: formData.rollNumber || "",
        parentName: formData.parentName || "",
        parentPhone: formData.parentPhone || "",
        address: formData.address || "",
        dateOfBirth: formData.dateOfBirth || "",
        gender: (formData.gender as "male" | "female" | "other") || "male",
        admissionDate: new Date().toISOString().split("T")[0],
        bloodGroup: formData.bloodGroup,
      };
      setStudents((prev) => [...prev, newStudent]);
    }
    setShowModal(false);
    setEditingStudent(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowModal(true);
  };

  const openAdd = () => {
    setEditingStudent(null);
    setFormData({});
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            Students Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredStudents.length} students found
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" /> Export Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkUpload(true)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, or roll number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
              {(searchQuery || filterClass) && (
                <Button variant="ghost" size="icon" onClick={() => { setSearchQuery(""); setFilterClass(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roll No</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Class</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gender</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, i) => (
                  <tr
                    key={student.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm">
                          <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{student.rollNumber}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{student.class}-{student.section}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{student.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{student.parentName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={student.gender === "male" ? "info" : "secondary"}>
                        {student.gender}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setShowDetail(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(student)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)} className="hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No students found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try{" "}
                <button onClick={() => setShowBulkUpload(true)} className="text-primary underline underline-offset-2">
                  bulk uploading
                </button>{" "}
                from an Excel file
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onClose={() => setShowBulkUpload(false)}
          onImport={handleBulkImport}
        />
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editingStudent ? "Edit Student" : "Add New Student"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Student name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email *</label>
                  <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email address" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Roll Number *</label>
                  <Input value={formData.rollNumber || ""} onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })} placeholder="Roll number" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class *</label>
                  <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={formData.class || ""} onChange={(e) => setFormData({ ...formData, class: e.target.value })}>
                    <option value="">Select Class</option>
                    {["8", "9", "10", "11", "12"].map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Section *</label>
                  <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={formData.section || ""} onChange={(e) => setFormData({ ...formData, section: e.target.value })}>
                    <option value="">Select Section</option>
                    {["A", "B", "C", "D"].map((s) => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth</label>
                  <Input type="date" value={formData.dateOfBirth || ""} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gender</label>
                  <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={formData.gender || ""} onChange={(e) => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" })}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Name</label>
                  <Input value={formData.parentName || ""} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} placeholder="Parent/Guardian name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Phone</label>
                  <Input value={formData.parentPhone || ""} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} placeholder="Parent phone" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <Input value={formData.address || ""} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blood Group</label>
                  <select className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" value={formData.bloodGroup || ""} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}>
                    <option value="">Select</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingStudent ? "Update" : "Add"} Student</Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetail(null)}>
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg m-4 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-semibold">Student Details</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowDetail(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avatar size="xl">
                  <AvatarFallback>{getInitials(showDetail.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{showDetail.name}</h3>
                  <p className="text-sm text-muted-foreground">Roll No: {showDetail.rollNumber}</p>
                  <Badge variant="info" className="mt-1">Class {showDetail.class}-{showDetail.section}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: showDetail.email },
                  { icon: Phone, label: "Phone", value: showDetail.phone },
                  { icon: MapPin, label: "Address", value: showDetail.address },
                  { icon: Calendar, label: "Date of Birth", value: showDetail.dateOfBirth },
                  { icon: User, label: "Parent", value: `${showDetail.parentName} (${showDetail.parentPhone})` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Status Toast */}
      {importStatus.visible && (
        <div
          className={`fixed bottom-4 right-4 max-w-md p-4 rounded-lg shadow-lg flex gap-3 items-start animate-slide-up ${importStatus.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            }`}
        >
          {importStatus.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${importStatus.success ? "text-green-900" : "text-red-900"}`}>
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

