/**
 * OcrTableParser — Standalone OCR table parsing & normalization library.
 *
 * Extracted from OcrBulkUploadModal.tsx so the heavy data-transformation
 * logic lives outside any React component and can be unit-tested, reused,
 * or called from server-side code.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GenderResult {
  display: string;
  dbValue: string;
}

export interface CategoryResult {
  hindiCategory: string;
  dbCategory: string;
}

export interface ParseOcrResult {
  rows: Record<string, any>[];
  error: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const COMMON_OCR_GARBAGE: string[] = [
  'Rie', 'rie', 'fom', 'shaft', 'awd', 'mem', 'YET', 'fram', 'fon', 'frarn',
  'bee', 'oem', 'wh', 'oh', 'wf', 'oy', 'eh', 'pen', 'ts', 'IMR', 'mm', 'riA',
  'gq', 'ope', 'oase7es0le', 'sassrasets', 'osssrasons', 'sssersorz',
  'hid', 'd0020is', 'ueaote', 'TER', 'wel', 'RE', 'FW', 'NO', 'SR', 'SL',
  'OMAR', 'essere', 'wor0rs', 'swssrason', 'owas', 'TEER', 'osc', 'लि के', 'जज'
];

// ─── Helpers: Devanagari / Date ──────────────────────────────────────────────

/** Replace Devanagari digits (०-९) with their ASCII equivalents. */
export const normalizeDevanagariDigits = (text: string): string => {
  if (!text) return "";
  const devanagariMap: Record<string, string> = {
    "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
    "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"
  };
  return text.replace(/[०-९]/g, (m) => devanagariMap[m] || m);
};

/**
 * Validate a DD-MM-YYYY (or similar) date string extracted by OCR.
 * Returns a clean `DD-MM-YYYY` string or `""` on failure.
 */
export const validateAndFixDate = (dateStr: string): string => {
  if (!dateStr) return "";
  let normStr = normalizeDevanagariDigits(dateStr).trim();

  // Normalize delimiters and strip spaces around delimiters (e.g. "12 / 05 / 2015" -> "12/05/2015")
  normStr = normStr.replace(/\s*([-/.:])\s*/g, "$1");

  // Also support space-separated date tokens if 3 numeric tokens like "12 05 2015"
  let parts = normStr.split(/[-/.:]/);
  if (parts.length !== 3) {
    const spaceParts = normStr.split(/\s+/);
    if (spaceParts.length === 3 && spaceParts.every((p) => /^\d+$/.test(p))) {
      parts = spaceParts;
    } else {
      return "";
    }
  }

  let p0 = parts[0];
  let p1 = parts[1];
  let p2 = parts[2];

  let dayNum: number;
  let monthNum: number;
  let yearNum: number;

  // Case 1: YYYY-MM-DD or YYYY/MM/DD format (where 4-digit year comes first)
  if (p0.length === 4 || parseInt(p0, 10) > 1900) {
    yearNum = parseInt(p0, 10);
    monthNum = parseInt(p1, 10);
    dayNum = parseInt(p2, 10);
  } else {
    // Case 2: DD-MM-YYYY or MM-DD-YYYY format
    dayNum = parseInt(p0, 10);
    monthNum = parseInt(p1, 10);
    let yearStr = p2;

    // Fix OCR misread "00" day to "09" (common Tesseract misread for '09')
    if (p0 === "00" || p0 === "0") dayNum = 9;

    yearNum = parseInt(yearStr, 10);
    if (yearStr.length === 3) {
      if (yearStr.startsWith("20")) yearNum = 2000 + parseInt(yearStr.substring(2), 10);
      else yearNum = 2000 + parseInt(yearStr.substring(1), 10);
    } else if (yearStr.length === 2) {
      yearNum = yearNum <= 35 ? 2000 + yearNum : 1900 + yearNum;
    }
  }

  // Swap day & month if monthNum > 12 and dayNum <= 12
  if (monthNum > 12 && dayNum <= 12) {
    const temp = dayNum;
    dayNum = monthNum;
    monthNum = temp;
  }

  // Validate ranges
  if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) return "";
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return "";
  if (isNaN(yearNum) || yearNum < 1990 || yearNum > 2030) return "";

  return `${dayNum.toString().padStart(2, "0")}-${monthNum.toString().padStart(2, "0")}-${yearNum}`;
};

// ─── Header Mapping ──────────────────────────────────────────────────────────

/** Map a Hindi/English header label to its canonical English field key. */
export const mapHindiHeaderToEnglish = (headerText: string): string | null => {
  const text = headerText.toLowerCase().trim();

  // Registration / Admission Number
  if (
    (text.includes("प्रवेश") && (text.includes("क्रमांक") || text.includes("सं") || text.includes("नंबर") || text.includes("नं"))) ||
    text.includes("registration_no") || text.includes("admission_no") || text.includes("reg_no") || text.includes("sr_no") || text.includes("s.r.")
  ) return "registration_no";

  // Admission Date
  if (
    ((text.includes("प्रवेश") || text.includes("admission") || text.includes("adm")) &&
      (text.includes("तिथि") || text.includes("दिनांक") || text.includes("दिनाँक") || text.includes("तारीख") || text.includes("date") || text.includes("dt"))) ||
    text.includes("admission_date") || text.includes("admissiondate") || text.includes("date of admission") || text.includes("doa") || text.includes("d.o.a")
  ) return "admission_date";

  // Date of Birth
  if (
    ((text.includes("जन्म") || text.includes("birth") || text.includes("dob") || text.includes("d.o.b")) &&
      (text.includes("तिथि") || text.includes("दिनांक") || text.includes("दिनाँक") || text.includes("तारीख") || text.includes("date") || text.includes("dt") || text.includes("dob") || text.includes("birth") || text.includes("जन्म"))) ||
    text.includes("date_of_birth") || text.includes("dateofbirth") || text.includes("date of birth") || text.includes("dob") || text.includes("d.o.b")
  ) return "dateOfBirth";

  // Student Name
  if (
    text.includes("छात्र") || text.includes("विद्यार्थी") || text.includes("student") ||
    (text.includes("नाम") && !text.includes("पिता") && !text.includes("माता") && !text.includes("संरक्षक"))
  ) return "name";

  // Father Name
  if (text.includes("पिता") || text.includes("संरक्षक") || text.includes("father") || text.includes("guardian")) return "father_name";

  // Mother Name
  if (text.includes("माता") || text.includes("mother")) return "mother_name";

  // Class
  if (text.includes("कक्षा") || text.includes("class")) return "class";

  // Gender
  if (text.includes("लिंग") || text.includes("gender") || text.includes("sex")) return "gender";

  // Phone / Mobile
  if (text.includes("मोबाइल") || text.includes("फोन") || text.includes("phone") || text.includes("mobile") || text.includes("contact")) return "parent_phone";

  // Address
  if (text.includes("पता") || text.includes("address")) return "address";

  // Category
  if (text.includes("श्रेणी") || text.includes("जाति") || text.includes("category") || text.includes("caste")) return "caste_category";

  // Academic Year
  if (text.includes("शैक्षणिक सत्र") || text.includes("academic_year") || text.includes("session")) return "academic_year";

  return null;
};

// ─── Normalizers ─────────────────────────────────────────────────────────────

/** Normalize gender text to a display + database value pair. */
export const normalizeGender = (val: string): GenderResult => {
  if (!val) return { display: "पु.", dbValue: "Male" };
  const lower = val.toLowerCase().trim();

  if (lower.includes("स्त्री") || lower.includes("महिला") || lower.includes("female") ||
    lower.includes("f") || lower.includes("girl") || lower.includes("hss") || lower.includes("म.")) {
    return { display: "स्त्री.", dbValue: "Female" };
  }

  return { display: "पु.", dbValue: "Male" };
};

/** Normalize caste/category text to Hindi display + database value pair. */
export const normalizeCategory = (val: string): CategoryResult => {
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

// ─── Phone Cleaning ──────────────────────────────────────────────────────────

/**
 * Attempt to recover a valid 10-digit Indian mobile number from an
 * OCR-corrupted token (letter→digit substitution, stripping noise).
 */
export const uncorruptOcrPhoneToken = (token: string): string => {
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

// ─── Name / Address Cleaning ─────────────────────────────────────────────────

/** Strip OCR garbage tokens, digits, and stray Latin fragments from a name. */
export const cleanName = (rawName: string): string => {
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

/**
 * Clean an address field by stripping known names, OCR garbage, dates,
 * phone numbers, category / gender keywords, and pure-digit tokens.
 */
export const cleanAddress = (
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

  str = str.replace(/\b\d{1,2}[-/.:]\\d{1,2}[-/.:]\\d{2,4}\b/g, " ");
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

// ─── Row Formatting ──────────────────────────────────────────────────────────

/**
 * Take a raw key→value object (from any parsing path) and produce a
 * fully-normalised student row with every legacy / compatibility alias set.
 */
export const formatStudentRowPayload = (rawRow: Record<string, string>, defaultSerialIndex: number = 1): Record<string, any> => {
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
  const parentPhone = uncorruptOcrPhoneToken(rawPhone);
  const classNameRaw = row["class"] || row["classname"] || "5";
  const parsedClassNum = parseInt(classNameRaw, 10);
  const classVal = !isNaN(parsedClassNum) ? parsedClassNum : 5;

  const division = row["division"] || row["section"] || "A";
  const genderObj = normalizeGender(row["gender"] || "");
  const categoryObj = normalizeCategory(row["category"] || row["caste_category"] || row["castecategory"] || "");
  const address = cleanAddress(rawAddr, name, fatherName, motherName);

  let dateOfBirth = validateAndFixDate(row["date_of_birth"] || row["dateofbirth"] || row["dateOfBirth"] || row["dob"] || row["birth_date"] || row["birthdate"] || row["जन्म तिथि"] || row["जन्म दिनांक"] || row["जन्म तारीख"] || "");
  let admissionDate = validateAndFixDate(row["admission_date"] || row["admissiondate"] || row["admissionDate"] || row["admission_dt"] || row["प्रवेश तिथि"] || row["प्रवेश दिनांक"] || row["प्रवेश तारीख"] || "");

  let admissionNo = row["admission_no"] || row["registration_no"] || row["registrationNo"] || row["registrationno"] || "";
  if (!admissionNo || admissionNo === "2025" || admissionNo === "2024" || admissionNo === "2026") {
    admissionNo = row["fallback_reg_no"] || "1018";
  }

  const serialNo = row["serial_no"] && !isNaN(parseInt(row["serial_no"], 10))
    ? parseInt(row["serial_no"], 10)
    : defaultSerialIndex;

  const academicYear = row["academic_year"] || row["academicyear"] || row["academicYear"] || "";
  const aadharNo = row["aadharNo"] || row["aadharno"] || row["aadhar_no"] || "";
  const remarks = row["remarks"] || "—";

  return {
    serial_no: serialNo,
    admission_no: admissionNo,
    admission_date: admissionDate || "",
    student_name: name,
    father_guardian_name: fatherName,
    mother_name: motherName,
    date_of_birth: dateOfBirth || "",
    class: classVal,
    gender: genderObj.dbValue,
    mobile_number: parentPhone || "",
    address: address || "",
    category: categoryObj.dbCategory,
    remarks: remarks,

    // Legacy & UI component compatibility fields:
    name: name,
    father_name: fatherName,
    parentName: parentName,
    parentphone: parentPhone || "",
    parentPhone: parentPhone || "",
    registration_no: admissionNo,
    registrationNo: admissionNo,
    caste_category: categoryObj.hindiCategory,
    casteCategory: categoryObj.dbCategory,
    academic_year: academicYear,
    academicYear: academicYear,
    division: division,
    dateOfBirth: dateOfBirth || "",
    dateofbirth: dateOfBirth || "",
    admissionDate: admissionDate || "",
    admissiondate: admissionDate || "",
    aadharNo: aadharNo
  };
};

// ─── Line-Level Parsing (Register Format) ────────────────────────────────────

/**
 * Parse a single OCR text line from a school register into a raw
 * key→value record. Returns `null` if the line is a header or garbage.
 */
export const parseRegisterLine = (cleanLineStr: string): Record<string, string> | null => {
  if (!cleanLineStr) return null;
  const cleanLine = normalizeDevanagariDigits(cleanLineStr);

  if (
    cleanLine.includes("विद्यालय") ||
    cleanLine.includes("प्रवेश पंजी") ||
    cleanLine.includes("शैक्षणिक सत्र") ||
    cleanLine.includes("हस्ताक्षर") ||
    (cleanLine.includes("तारीख") && cleanLine.includes("विवरण")) ||
    (cleanLine.includes("क्रमांक") && cleanLine.includes("नाम"))
  ) {
    return null;
  }

  const dateRegex = /\b(\d{1,2}\s*[-/.:]\s*\d{1,2}\s*[-/.:]\s*\d{2,4})\b/g;
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
      const uncorrupted = uncorruptOcrPhoneToken(tok);
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

  // Parse and assign dates based on year heuristic & date count
  const parsedDates: { text: string; validated: string; yearNum: number }[] = [];
  dateMatches.forEach((dm) => {
    const validated = validateAndFixDate(dm.text);
    if (validated) {
      const yr = parseInt(validated.split("-")[2], 10);
      parsedDates.push({ text: dm.text, validated, yearNum: yr });
    }
  });

  if (parsedDates.length >= 2) {
    const d1 = parsedDates[0];
    const d2 = parsedDates[1];
    // In student records, Date of Birth is earlier year than Admission Date
    if (d1.yearNum < d2.yearNum) {
      obj.date_of_birth = d1.validated;
      obj.dateOfBirth = d1.validated;
      obj.admission_date = d2.validated;
      obj.admissionDate = d2.validated;
    } else if (d2.yearNum < d1.yearNum) {
      obj.date_of_birth = d2.validated;
      obj.dateOfBirth = d2.validated;
      obj.admission_date = d1.validated;
      obj.admissionDate = d1.validated;
    } else {
      // Same year: first date in register column layout is typically Admission Date
      obj.admission_date = d1.validated;
      obj.admissionDate = d1.validated;
      obj.date_of_birth = d2.validated;
      obj.dateOfBirth = d2.validated;
    }
  } else if (parsedDates.length === 1) {
    const d = parsedDates[0];
    if (d.yearNum <= 2021) {
      obj.date_of_birth = d.validated;
      obj.dateOfBirth = d.validated;
    } else {
      obj.admission_date = d.validated;
      obj.admissionDate = d.validated;
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

    const dateIdx = cells.findIndex((c) => /\d{1,2}\s*[-/.:]\s*\d{1,2}\s*[-/.:]\s*\d{2,4}/.test(c) || /\d{4}/.test(c));
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

      if (/\b\d{1,2}\s*[-/.:]\s*\d{1,2}\s*[-/.:]\s*\d{2,4}\b/.test(cellText)) {
        const dateMatch = cellText.match(/\b\d{1,2}\s*[-/.:]\s*\d{1,2}\s*[-/.:]\s*\d{2,4}\b/);
        if (dateMatch) {
          const validated = validateAndFixDate(dateMatch[0]);
          if (validated) {
            const yr = parseInt(validated.split("-")[2], 10);
            if (yr <= 2021 && !obj.date_of_birth) {
              obj.date_of_birth = validated;
              obj.dateOfBirth = validated;
            } else if (yr >= 2022 && !obj.admission_date) {
              obj.admission_date = validated;
              obj.admissionDate = validated;
            } else if (!obj.admission_date) {
              obj.admission_date = validated;
              obj.admissionDate = validated;
            } else if (!obj.date_of_birth) {
              obj.date_of_birth = validated;
              obj.dateOfBirth = validated;
            }
          }
        }
      }

      if (!obj.address && cellText.length >= 2) {
        const isPureDate = /^\d{1,2}[-/.:]\\d{1,2}[-/.:]\\d{2,4}$/.test(cellText);
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

// ─── Garbage Row Detection ───────────────────────────────────────────────────

/** Return `true` if a formatted row looks like OCR noise / a header row. */
export const isGarbageRow = (row: Record<string, string>): boolean => {
  const name = row.name || "";
  if (!name || name.length < 2) return true;

  const lowerName = name.toLowerCase();
  const headerKeywords = [
    "लिंग", "क्रमांक", "कक्षा", "माता", "पिता", "दिनांक", "तारीख",
    "हस्ताक्षर", "विवरण", "पंजी", "रजिस्टर", "विद्यालय",
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

// ─── Top-Level OCR Text → Rows Parser ────────────────────────────────────────

/**
 * Parse raw OCR text into an array of normalised student row objects.
 *
 * This is the main entry-point: give it the full text blob from
 * Tesseract and the expected template headers, and it returns parsed rows
 * (or an error message).
 */
export const parseOcrTextToRows = (
  ocrText: string,
  templateHeaders: string[]
): ParseOcrResult => {
  const rawLines = ocrText
    .split(/\r\n|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length === 0) {
    return { rows: [], error: "No text found in the image." };
  }

  // ── Strategy 1: smart register-line parsing ──
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
    return { rows: smartRows, error: null };
  }

  // ── Strategy 2: header-mapped column parsing ──
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
    return { rows: [], error: "Could not parse structured table rows from image text. Please try a clearer register photo." };
  }

  return { rows, error: null };
};

// ─── Empty Row Template ──────────────────────────────────────────────────────

/** Return a blank student row with all expected fields initialised. */
export const createEmptyStudentRow = (serialNo: number): Record<string, any> => ({
  serial_no: serialNo,
  admission_no: "",
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

  registration_no: "",
  registrationNo: "",
  academic_year: "",
  academicYear: "",
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
});
