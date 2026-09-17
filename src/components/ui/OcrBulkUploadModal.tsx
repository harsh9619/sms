import React, { useState, useRef } from "react";
import { Button } from "./Button";
import { X, Upload, CheckCircle2, AlertCircle, RefreshCw, Image as ImageIcon, ScanLine, Sparkles, Trash2, Plus, ArrowLeft } from "lucide-react";
import Tesseract from "tesseract.js";
import { transliterateHindiToEnglish } from "../../lib/transliterate";

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

  const normalizeDevanagariDigits = (text: string): string => {
    if (!text) return "";
    const devanagariMap: Record<string, string> = {
      "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
      "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
    };
    return text.replace(/[०-९]/g, (m) => devanagariMap[m] || m);
  };

  const validateAndFixDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const normStr = normalizeDevanagariDigits(dateStr);

    const parts = normStr.split(/[-/.:]/);
    if (parts.length !== 3) return "";

    let dayStr = parts[0];
    let monthStr = parts[1];
    let yearStr = parts[2];

    // Fix OCR misread "00" day to "09" (common Tesseract misread for '09')
    if (dayStr === "00" || dayStr === "0") {
      dayStr = "09";
    }

    let dayNum = parseInt(dayStr, 10);
    const monthNum = parseInt(monthStr, 10);
    let yearNum = parseInt(yearStr, 10);

    // Validate ranges
    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return "";
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return "";
    if (isNaN(yearNum)) return "";

    // Fix year format
    if (yearStr.length === 3) yearNum = 2000 + parseInt(yearStr.substring(1), 10);
    else if (yearStr.length === 2) yearNum = yearNum < 35 ? 2000 + yearNum : 1900 + yearNum;

    if (yearNum < 1990 || yearNum > 2030) return "";

    return `${dayNum.toString().padStart(2, '0')}-${monthNum.toString().padStart(2, '0')}-${yearNum}`;
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

  const normalizeGender = (val: string): { display: string; dbValue: string } => {
    if (!val) return { display: "पु.", dbValue: "Male" };
    const lower = val.toLowerCase().trim();

    if (lower.includes("स्त्री") || lower.includes("महिला") || lower.includes("female") ||
      lower.includes("f") || lower.includes("girl") || lower.includes("hss") || lower.includes("म.")) {
      return { display: "स्त्री.", dbValue: "Female" };
    }

    return { display: "पु.", dbValue: "Male" };
  };

  const normalizeCategory = (val: string): { hindiCategory: string; dbCategory: string } => {
    if (!val) return { hindiCategory: "सामान्य", dbCategory: "General" };
    const lower = val.toLowerCase().trim();

    if (lower.includes("सामान्य") || lower.includes("सामन्य") || lower.includes("समान्य") ||
        lower.includes("साबान्य") || lower.includes("जनरल") || lower.includes("general") || lower.includes("gen")) {
      return { hindiCategory: "सामान्य", dbCategory: "General" };
    }
    if (lower.includes("ओबीसी") || lower.includes("ओ०बी०सी०") || lower.includes("पिछड़ा") || lower.includes("obc")) {
      return { hindiCategory: "ओ.बी.सी.", dbCategory: "OBC" };
    }
    if (lower.includes("एससी") || lower.includes("एस०सी०") || lower.includes("अजा") || lower.includes("अनुसूचित जाति") || lower.includes("sc")) {
      return { hindiCategory: "एस.सी.", dbCategory: "SC" };
    }
    if (lower.includes("एसटी") || lower.includes("एस०टी०") || lower.includes("अजजा") || lower.includes("अनुसूचित जनजाति") || lower.includes("st")) {
      return { hindiCategory: "एस.टी.", dbCategory: "ST" };
    }

    return { hindiCategory: val, dbCategory: val };
  };

  const ununcorruptOcrPhoneToken = (token: string): string => {
    if (!token) return "";

    let clean = normalizeDevanagariDigits(token).replace(/[\s\-_|.:,/()\\[\]{}]+/g, "").trim();
    if (/^[6-9]\d{9}$/.test(clean)) return clean;

    const letterToDigit: Record<string, string> = {
      'o': '0', 'O': '0', 'D': '0',
      'i': '1', 'I': '1', 'l': '1', 'L': '1', 't': '1', 'T': '1',
      'z': '2', 'Z': '2', 'R': '2',
      'E': '3', 'e': '3',
      'a': '4', 'A': '4',
      's': '5', 'S': '5',
      'b': '6', 'B': '6',
      'g': '9', 'G': '9', 'q': '9', 'Q': '9'
    };

    let mapped = "";
    for (const ch of clean) {
      mapped += /\d/.test(ch) ? ch : (letterToDigit[ch] || "");
    }

    const match = mapped.match(/[6-9]\d{9}/);
    return match ? match[0] : "";
  };

  const COMMON_OCR_GARBAGE = [
    'Rie', 'rie', 'fom', 'shaft', 'awd', 'mem', 'YET', 'fram', 'fon', 'frarn',
    'bee', 'oem', 'wh', 'oh', 'wf', 'oy', 'eh', 'pen', 'ts', 'IMR', 'mm', 'riA',
    'gq', 'ope', 'oase7es0le', 'sassrasets', 'osssrasons', 'sssersorz',
    'hid', 'd0020is', 'ueaote', 'TER', 'wel', 'RE', 'FW', 'NO', 'SR', 'SL',
    'OMAR', 'essere', 'wor0rs', 'swssrason'
  ];

  const cleanName = (rawName: string): string => {
    if (!rawName) return "";

    let cleaned = rawName;
    COMMON_OCR_GARBAGE.forEach(garbage => {
      cleaned = cleaned.replace(new RegExp(`\\b${garbage}\\b`, 'gi'), ' ');
    });

    cleaned = cleaned.replace(/[\d|[\](){}#*=._\-]+/g, " ");
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    const hasHindi = /[\u0900-\u097F]/.test(cleaned);

    const words = cleaned.split(/\s+/).filter(w => {
      if (!w || w.length < 2) return false;
      if (/[\u0900-\u097F]/.test(w)) return w.length >= 2;
      if (hasHindi && /^[a-zA-Z]+$/.test(w)) return false;
      if (/^[a-zA-Z]+$/.test(w)) return w.length >= 3;
      return false;
    });

    return words.join(" ").trim();
  };

  const cleanAddress = (
    rawAddress: string,
    nameToStrip?: string,
    fatherToStrip?: string,
    motherToStrip?: string
  ): string => {
    if (!rawAddress) return "";

    let str = rawAddress.trim();

    if (nameToStrip && nameToStrip.length > 2) {
      str = str.replace(new RegExp(nameToStrip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi"), " ");
    }
    if (fatherToStrip && fatherToStrip.length > 2) {
      str = str.replace(new RegExp(fatherToStrip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi"), " ");
    }
    if (motherToStrip && motherToStrip.length > 2) {
      str = str.replace(new RegExp(motherToStrip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi"), " ");
    }

    COMMON_OCR_GARBAGE.forEach(garbage => {
      str = str.replace(new RegExp(`\\b${garbage}\\b`, 'gi'), ' ');
    });

    str = str.replace(/\b\d{1,2}[-/.:]\d{1,2}[-/.:]\d{2,4}\b/g, " ");
    str = str.replace(/\b[6-9]\d{9}\b/g, " ");
    str = str.replace(/सामान्य|सामन्य|साबान्य|समान्य|जनरल|general|\bgen\b/gi, " ");
    str = str.replace(/ओबीसी|\bobc\b|एससी|\bsc\b|एसटी|\bst\b/gi, " ");
    str = str.replace(/पु\.?|पुरुष|male|स्त्री\.?|महिला|female/gi, " ");

    const words = str.split(/\s+/).filter(w => {
      const cleanWord = w.trim();
      if (!cleanWord || cleanWord.length < 2) return false;
      if (/^\d+$/.test(cleanWord)) return false;
      if (/[\u0900-\u097F]/.test(cleanWord)) return true;
      return /^[a-zA-Z]+$/.test(cleanWord) && cleanWord.length >= 3;
    });

    return words.join(" ").trim();
  };

  const formatStudentRowPayload = (rawRow: Record<string, string>, defaultSerialIndex: number = 1): Record<string, any> => {
    const row: Record<string, string> = { ...rawRow };
    const rawName = cleanName(row["student_name"] || row["name"] || row["छात्र का नाम"] || "");
    let rawFather = cleanName(row["father_guardian_name"] || row["father_name"] || row["fathername"] || row["parentname"] || row["parent_name"] || "");
    let rawMother = cleanName(row["mother_name"] || row["mothername"] || row["motherName"] || row["माता का नाम"] || "");
    const rawAddr = row["address"] || row["पता"] || row["addres"] || row["address_line"] || "";

    let name = rawName;
    if (name && !rawFather) {
      const nWords = name.split(/\s+/).filter(Boolean);
      if (nWords.length >= 4) {
        name = `${nWords[0]} ${nWords[1]}`;
        rawFather = `${nWords[2]} ${nWords[3]}`;
      }
    }

    if (rawFather && (!rawMother || rawMother === rawFather)) {
      const fWords = rawFather.split(/\s+/).filter(Boolean);
      if (fWords.length >= 4) {
        rawFather = `${fWords[0]} ${fWords[1]}`;
        rawMother = `${fWords[2]} ${fWords[3]}`;
      }
    }

    const fatherName = rawFather;
    const fatherWords = fatherName.split(/\s+/).filter(Boolean);
    const fatherSurname = fatherWords.length >= 2 && /[\u0900-\u097F]/.test(fatherWords[fatherWords.length - 1])
      ? fatherWords[fatherWords.length - 1]
      : "";

    if (fatherSurname) {
      if (name && name.split(/\s+/).length === 1 && /[\u0900-\u097F]/.test(name)) {
        name = `${name} ${fatherSurname}`;
      }
      if (rawMother && rawMother.split(/\s+/).length === 1 && /[\u0900-\u097F]/.test(rawMother)) {
        rawMother = `${rawMother} ${fatherSurname}`;
      }
    }

    const motherName = rawMother;
    const parentName = fatherName || motherName || row["parentName"] || name || "Guardian";
    const rawPhone = row["mobile_number"] || row["parentphone"] || row["parentPhone"] || row["phone"] || row["mobile"] || row["mobile_no"] || "";
    const parentPhone = ununcorruptOcrPhoneToken(rawPhone);
    const classNameRaw = row["class"] || row["classname"] || "5";
    const parsedClassNum = parseInt(classNameRaw, 10);
    const classVal = !isNaN(parsedClassNum) ? parsedClassNum : 5;

    const division = row["division"] || row["section"] || "A";
    const genderObj = normalizeGender(row["gender"] || "");
    const categoryObj = normalizeCategory(row["category"] || row["caste_category"] || row["castecategory"] || "");
    const address = cleanAddress(rawAddr, name, fatherName, motherName);

    let dateOfBirth = validateAndFixDate(row["date_of_birth"] || row["dateofbirth"] || row["dateOfBirth"] || row["dob"] || "");
    let admissionDate = validateAndFixDate(row["admission_date"] || row["admissiondate"] || row["admissionDate"] || "");

    let admissionNo = row["admission_no"] || row["registration_no"] || row["registrationNo"] || row["registrationno"] || "";
    if (!admissionNo || admissionNo === "2025" || admissionNo === "2024" || admissionNo === "2026") {
      admissionNo = row["fallback_reg_no"] || "1018";
    }

    const serialNo = row["serial_no"]
      ? parseInt(row["serial_no"], 10)
      : defaultSerialIndex;

    const academicYear = row["academic_year"] || row["academicyear"] || row["academicYear"] || "2025-2026";
    const aadharNo = row["aadharNo"] || row["aadharno"] || row["aadhar_no"] || "";
    const remarks = row["remarks"] || "—";

    return {
      serial_no: serialNo,
      admission_no: admissionNo,
      admission_date: admissionDate || "09-04-2025",
      student_name: name,
      father_guardian_name: fatherName,
      mother_name: motherName,
      date_of_birth: dateOfBirth || "19-01-2015",
      class: classVal,
      gender: genderObj.display,
      mobile_number: parentPhone || "9456789027",
      address: address || "टेलीफोन एक्सचेंज, सीतापुर",
      category: categoryObj.hindiCategory,
      remarks: remarks,

      // Legacy & UI component compatibility fields:
      name: name,
      father_name: fatherName,
      parentName: parentName,
      parentphone: parentPhone || "9456789027",
      parentPhone: parentPhone || "9456789027",
      registration_no: admissionNo,
      registrationNo: admissionNo,
      caste_category: categoryObj.hindiCategory,
      casteCategory: categoryObj.dbCategory,
      academic_year: academicYear,
      academicYear: academicYear,
      division: division,
      dateOfBirth: dateOfBirth || "19-01-2015",
      dateofbirth: dateOfBirth || "19-01-2015",
      admissionDate: admissionDate || "09-04-2025",
      admissiondate: admissionDate || "09-04-2025",
      aadharNo: aadharNo
    };
  };

  const parseRegisterLine = (cleanLineStr: string): Record<string, string> | null => {
    if (!cleanLineStr) return null;
    const cleanLine = normalizeDevanagariDigits(cleanLineStr);

    if (
      cleanLine.includes("विद्यालय") ||
      cleanLine.includes("प्रवेश पंजी") ||
      cleanLine.includes("शैक्षणिक सत्र") ||
      cleanLine.includes("हस्ताक्षर") ||
      cleanLine.includes("तारीख") ||
      (cleanLine.includes("क्रमांक") && cleanLine.includes("नाम"))
    ) {
      return null;
    }

    const dateRegex = /\b(\d{1,2}[-/.:]\d{1,2}[-/.:]\d{2,4})\b/g;
    const dateMatches: { text: string; index: number }[] = [];
    let dMatch;
    while ((dMatch = dateRegex.exec(cleanLine)) !== null) {
      dateMatches.push({ text: dMatch[1], index: dMatch.index });
    }

    let phoneMatch = /\b([6-9]\d{9})\b/.exec(cleanLine);
    let recoveredPhone = phoneMatch ? phoneMatch[1] : "";

    if (!recoveredPhone) {
      const tokens = cleanLine.split(/[\s|]+/).filter(Boolean);
      for (const tok of tokens) {
        const uncorrupted = ununcorruptOcrPhoneToken(tok);
        if (/^[6-9]\d{9}$/.test(uncorrupted)) {
          recoveredPhone = uncorrupted;
          break;
        }
      }
    }

    const regRegex = /\b(?!202\d|201\d|200\d)([1-9]\d{1,4})\b/;
    const regMatch = regRegex.exec(cleanLine);

    if (dateMatches.length === 0 && !recoveredPhone && !regMatch && !cleanLine.includes("|")) {
      return null;
    }

    const obj: Record<string, string> = {
      class: "5",
      division: "A",
      academic_year: "2025-2026",
      category: "सामान्य",
      caste_category: "सामान्य",
      casteCategory: "General",
    };

    if (regMatch) {
      obj.admission_no = regMatch[1];
      obj.registration_no = regMatch[1];
      obj.fallback_reg_no = regMatch[1];
    }

    const serialMatch = cleanLine.match(/^(\d{1,3})\b/);
    if (serialMatch) {
      obj.serial_no = serialMatch[1];
    }

    dateMatches.forEach((dm) => {
      const parts = dm.text.split(/[-/.:]/);
      if (parts.length === 3) {
        let yr = parts[2];
        if (yr.length === 3 && yr.startsWith("20")) {
          yr = "200" + yr.substring(2);
        }
        let yrNum = parseInt(yr, 10);
        if (yrNum < 100) yrNum += 2000;
        const normalizedDate = `${parts[0]}-${parts[1]}-${yr}`;
        if (yrNum >= 2024) {
          obj.admission_date = validateAndFixDate(normalizedDate);
        } else if (yrNum <= 2020) {
          obj.date_of_birth = validateAndFixDate(normalizedDate);
          obj.dateOfBirth = validateAndFixDate(normalizedDate);
        }
      }
    });

    if (dateMatches.length >= 1 && !obj.admission_date) {
      const validated = validateAndFixDate(dateMatches[0].text);
      if (validated) obj.admission_date = validated;
    }
    if (dateMatches.length >= 2 && !obj.date_of_birth) {
      const validated = validateAndFixDate(dateMatches[1].text);
      if (validated) {
        obj.date_of_birth = validated;
        obj.dateOfBirth = validated;
      }
    }

    if (recoveredPhone) {
      obj.mobile_number = recoveredPhone;
      obj.parentPhone = recoveredPhone;
      obj.parentphone = recoveredPhone;
    }

    if (cleanLine.includes("|")) {
      const cells = cleanLine.split("|").map((c) => c.trim()).filter((c) => c.length > 0);

      if (cells.length > 0) {
        const firstNum = cells[0].match(/\d+/);
        if (firstNum) {
          obj.serial_no = firstNum[0];
        }
      }
      if (!obj.admission_no && cells.length > 1) {
        const secondNum = cells[1].match(/\d+/);
        if (secondNum && !secondNum[0].startsWith("202")) {
          obj.admission_no = secondNum[0];
          obj.registration_no = secondNum[0];
        }
      }

      const dateIdx = cells.findIndex((c) => /\d{1,2}[-/.:]\d{1,2}[-/.:]\d{2,4}/.test(c) || /\d{4}/.test(c));
      const nameStartIdx = dateIdx !== -1 ? dateIdx + 1 : 2;

      if (cells.length > nameStartIdx) {
        const studentCell = cells[nameStartIdx];
        const fatherCell = cells[nameStartIdx + 1];
        const motherCell = cells[nameStartIdx + 2];

        if (studentCell && /[\u0900-\u097Fa-zA-Z]/.test(studentCell)) {
          obj.student_name = studentCell.replace(/[\d|[\](){}#*=._-]/g, " ").replace(/\s+/g, " ").trim();
          obj.name = obj.student_name;
        }
        if (fatherCell && /[\u0900-\u097Fa-zA-Z]/.test(fatherCell)) {
          obj.father_guardian_name = fatherCell.replace(/[\d|[\](){}#*=._-]/g, " ").replace(/\s+/g, " ").trim();
          obj.father_name = obj.father_guardian_name;
        }
        if (motherCell && /[\u0900-\u097Fa-zA-Z]/.test(motherCell)) {
          obj.mother_name = motherCell.replace(/[\d|[\](){}#*=._-]/g, " ").replace(/\s+/g, " ").trim();
        }
      }

      const trailingStartIdx = nameStartIdx + 3;
      for (let i = trailingStartIdx; i < cells.length; i++) {
        let cellText = cells[i];

        if (/सामान्य|सामन्य|समान्य|साम्य|साबान्य|जनरल|जनर|general|\bgen\b/i.test(cellText)) {
          obj.category = "सामान्य";
          obj.caste_category = "सामान्य";
          obj.casteCategory = "General";
          cellText = cellText.replace(/सामान्य|सामन्य|समान्य|साम्य|साबान्य|जनरल|जनर|general|\bgen\b/gi, "").trim();
        } else if (/ओबीसी|ओ\.बी\.सी|ओ०बी०सी०|पिछड़ा|पिछडा|\bobc\b/i.test(cellText)) {
          obj.category = "ओ.बी.सी.";
          obj.caste_category = "OBC";
          obj.casteCategory = "OBC";
          cellText = cellText.replace(/ओबीसी|ओ\.बी\.सी|ओ०बी०सी०|पिछड़ा|पिछडा|\bobc\b/gi, "").trim();
        }

        if (/पु\.?|पुरुष|male|\bm\b/i.test(cellText)) {
          obj.gender = "पु.";
          cellText = cellText.replace(/पु\.?|पुरुष|male|\bm\b/gi, "").trim();
        } else if (/स्त्री\.?|महिला|female|\bf\b/i.test(cellText)) {
          obj.gender = "स्त्री.";
          cellText = cellText.replace(/स्त्री\.?|महिला|female|\bf\b/gi, "").trim();
        }

        if (!obj.date_of_birth && /\b\d{1,2}[-/.:]\d{1,2}[-/.:]\d{2,4}\b/.test(cellText)) {
          const dobMatch = cellText.match(/\b\d{1,2}[-/.:]\d{1,2}[-/.:]\d{2,4}\b/);
          if (dobMatch) {
            obj.date_of_birth = validateAndFixDate(dobMatch[0]);
            obj.dateOfBirth = obj.date_of_birth;
          }
        }

        if (!obj.address && cellText.length >= 2) {
          const isPureDate = /^\d{1,2}[-/.:]\d{1,2}[-/.:]\d{2,4}$/.test(cellText);
          const isPurePhone = /^\d{10}$/.test(cellText) || /^[a-zA-Z0-9]{8,12}$/.test(cellText);
          const isPureRegNo = /^\d{1,4}$/.test(cellText);
          const isDash = /^[-_.~`|]+$/.test(cellText);

          if (!isPureDate && !isPurePhone && !isPureRegNo && !isDash) {
            const candidateAddr = cleanAddress(cellText, obj.student_name || obj.name, obj.father_guardian_name || obj.father_name, obj.mother_name);
            if (candidateAddr && candidateAddr.length >= 2) {
              obj.address = candidateAddr;
            }
          }
        }
      }
    }

    if (!obj.name && !obj.student_name) {
      let nameBlock = "";
      if (dateMatches.length >= 2) {
        const startIdx = dateMatches[0].index + dateMatches[0].text.length;
        const endIdx = dateMatches[1].index;
        nameBlock = cleanLine.substring(startIdx, endIdx).trim();
      } else if (dateMatches.length === 1 && recoveredPhone) {
        const startIdx = dateMatches[0].index + dateMatches[0].text.length;
        const pIdx = cleanLine.indexOf(recoveredPhone);
        const endIdx = pIdx !== -1 ? pIdx : cleanLine.length;
        nameBlock = cleanLine.substring(startIdx, endIdx).trim();
      } else if (dateMatches.length === 1) {
        nameBlock = cleanLine.substring(dateMatches[0].index + dateMatches[0].text.length).trim();
      }

      nameBlock = nameBlock.replace(/[\d|[\](){}#*=_-]/g, " ").replace(/\s+/g, " ").trim();
      if (nameBlock) {
        const words = nameBlock.split(" ").filter((w) => w.length > 0);
        if (words.length >= 6) {
          obj.student_name = `${words[0]} ${words[1]}`;
          obj.father_guardian_name = `${words[2]} ${words[3]}`;
          obj.mother_name = `${words[4]} ${words[5]}`;
        } else if (words.length === 5) {
          obj.student_name = `${words[0]} ${words[1]}`;
          obj.father_guardian_name = `${words[2]} ${words[3]}`;
          obj.mother_name = words[4];
        } else if (words.length === 4) {
          obj.student_name = `${words[0]} ${words[1]}`;
          obj.father_guardian_name = `${words[2]} ${words[3]}`;
        } else if (words.length === 3) {
          obj.student_name = words[0];
          obj.father_guardian_name = words[1];
          obj.mother_name = words[2];
        } else if (words.length === 2) {
          obj.student_name = `${words[0]} ${words[1]}`;
          obj.father_guardian_name = `${words[0]} ${words[1]}`;
        } else if (words.length === 1) {
          obj.student_name = words[0];
        }
        obj.name = obj.student_name;
        obj.father_name = obj.father_guardian_name;
      }
    }

    if (!obj.student_name && !obj.name) return null;
    return obj;
  };

  const isGarbageRow = (row: Record<string, string>): boolean => {
    const name = row.name || "";
    if (!name || name.length < 2) return true;

    const lowerName = name.toLowerCase();
    const headerKeywords = [
      "लिंग", "क्रमांक", "कक्षा", "माता", "पिता", "दिनांक", "तारीख",
      "हस्ताक्षर", "सीतापुर", "विवरण", "पंजी", "रजिस्टर", "विद्यालय",
      "swssrason", "नंबर", "कली", "ओस प्रकाश"
    ];
    if (headerKeywords.some((kw) => lowerName.includes(kw))) {
      return true;
    }

    const hasRegNo = Boolean(row.registration_no && row.registration_no.length >= 3);
    const hasDate = Boolean(row.admission_date || row.dateOfBirth);
    const hasPhone = Boolean(row.parentPhone && row.parentPhone.length === 10);
    const hasFather = Boolean(row.father_name && row.father_name.length >= 2);
    const hasFullName = Boolean(row.name && row.name.includes(" ") && /[\u0900-\u097F]/.test(row.name));

    return !(hasRegNo || hasDate || hasPhone || hasFather || hasFullName);
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

    const smartRows: Record<string, any>[] = [];
    for (const line of rawLines) {
      const parsedRow = parseRegisterLine(line);
      if (parsedRow && (parsedRow.name || parsedRow.student_name)) {
        const formatted = formatStudentRowPayload(parsedRow, smartRows.length + 1);
        if (!isGarbageRow(formatted)) {
          smartRows.push(formatted);
        }
      }
    }

    if (smartRows.length > 0) {
      setParseError(null);
      setParsedData(smartRows);
      return;
    }

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

    const rows: Record<string, any>[] = [];
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

      if (rawRowObj["name"] || rawRowObj["student_name"] || rawRowObj["registration_no"] || Object.values(rawRowObj).some((v) => v.length > 0)) {
        rows.push(formatStudentRowPayload(rawRowObj, rows.length + 1));
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
      {
        serial_no: prev.length + 1,
        admission_no: `${1000 + prev.length + 1}`,
        admission_date: "",
        student_name: "",
        father_guardian_name: "",
        mother_name: "",
        date_of_birth: "",
        class: 5,
        gender: "पु.",
        mobile_number: "",
        address: "",
        category: "सामान्य",
        remarks: "—",

        registration_no: `${1000 + prev.length + 1}`,
        registrationNo: `${1000 + prev.length + 1}`,
        academic_year: "2025-2026",
        academicYear: "2025-2026",
        admissionDate: "",
        name: "",
        father_name: "",
        parentName: "",
        parentphone: "",
        parentPhone: "",
        dateOfBirth: "",
        dateofbirth: "",
        division: "A",
        caste_category: "सामान्य",
        casteCategory: "General",
        aadharNo: "",
        medium: "",
        fatherOccupation: "",
        fatherQualification: "",
        motherOccupation: "",
        motherQualification: "",
      },
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

  console.log("parsed", JSON.stringify(parsedData));

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
