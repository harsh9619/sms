/**
 * OcrTableParser.ts
 *
 * Production-oriented parser for Hindi School Admission Register OCR.
 *
 * Expected register columns:
 *
 * 0  Serial No
 * 1  Admission / Registration No
 * 2  Admission Date
 * 3  Student Name
 * 4  Father / Guardian Name
 * 5  Mother Name
 * 6  Date of Birth
 * 7  Class
 * 8  Gender
 * 9  Mobile Number
 * 10 Address
 * 11 Category
 *
 * Designed for Tesseract OCR output containing:
 * - Hindi / Devanagari
 * - English OCR fragments
 * - "|" table separators
 * - wrapped addresses
 * - repeated page headers
 * - OCR character corruption
 *
 * IMPORTANT:
 * This parser does NOT invent admission numbers.
 * If a value cannot be recovered confidently, it is left empty
 * and the row is marked needs_review.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface GenderResult {
    display: string;
    dbValue: "Male" | "Female";
}

export interface CategoryResult {
    hindiCategory: string;
    dbCategory: "General" | "OBC" | "SC" | "ST" | string;
    recognized?: boolean;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ReviewReason {
    field: string;
    reason: string;
}

export interface StudentOcrRow {
    serial_no: number;

    admission_no: string;
    admission_date: string;

    student_name: string;
    father_guardian_name: string;
    mother_name: string;

    date_of_birth: string;

    class: number;
    division: string;

    gender: "Male" | "Female";
    mobile_number: string;

    address: string;

    category: string;
    remarks: string;

    // OCR quality
    confidence: number;
    confidence_level: ConfidenceLevel;
    needs_review: boolean;
    review_reasons: ReviewReason[];

    // Duplicate information
    is_duplicate: boolean;
    duplicate_of_serial: number | null;

    // Useful during UI preview/debugging
    source_line?: string;
    source_cells?: string[];

    // Legacy aliases
    name: string;
    father_name: string;
    parentName: string;
    parentphone: string;
    parentPhone: string;

    registration_no: string;
    registrationNo: string;

    caste_category: string;
    casteCategory: string;

    academic_year: string;
    academicYear: string;

    dateOfBirth: string;
    dateofbirth: string;

    admissionDate: string;
    admissiondate: string;

    aadharNo: string;
}

export interface ParseOcrResult {
    rows: StudentOcrRow[];
    error: string | null;

    // Useful diagnostics
    total_candidates: number;
    valid_rows: number;
    duplicate_rows: number;
    review_rows: number;
}

interface ParsedRegisterCandidate {
    serial_no?: string;
    admission_no?: string;
    admission_date?: string;

    student_name?: string;
    father_guardian_name?: string;
    mother_name?: string;

    date_of_birth?: string;

    class?: string;
    gender?: string;
    mobile_number?: string;

    address?: string;
    category?: string;

    remarks?: string;

    source_line?: string;
    source_cells?: string[];
}

interface ParsedDate {
    value: string;
    year: number;
    index: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EXPECTED_REGISTER_COLUMNS = [
    "serial_no",
    "admission_no",
    "admission_date",
    "student_name",
    "father_guardian_name",
    "mother_name",
    "date_of_birth",
    "class",
    "gender",
    "mobile_number",
    "address",
    "category",
] as const;

const DEFAULT_CLASS = 5;
const DEFAULT_DIVISION = "A";
const DEFAULT_ACADEMIC_YEAR = "2025-2026";

const MIN_STUDENT_NAME_LENGTH = 2;

const HEADER_KEYWORDS = [
    "विद्यालय",
    "प्रवेश पंजी",
    "शैक्षणिक सत्र",
    "छात्र का नाम",
    "पिता",
    "संरक्षक",
    "माता का नाम",
    "कक्षा",
    "लिंग",
    "मोबाइल",
    "पता",
    "श्रेणी",
    "क्रमांक",
    "हस्ताक्षर",
    "प्रधानाचार्य",
    "प्रवेश प्रभारी",
];

const OCR_GARBAGE = [
    "Rie",
    "rie",
    "fom",
    "shaft",
    "awd",
    "mem",
    "YET",
    "fram",
    "fon",
    "frarn",
    "bee",
    "oem",
    "wh",
    "oh",
    "wf",
    "oy",
    "eh",
    "pen",
    "ts",
    "IMR",
    "mm",
    "riA",
    "gq",
    "ope",
    "hid",
    "TER",
    "wel",
    "RE",
    "FW",
    "NO",
    "SR",
    "SL",
    "OMAR",
    "essere",
    "wor0rs",
    "swssrason",
    "owas",
    "TEER",
    "osc",
    "लि के",
    "जज",
];

// ============================================================================
// DIGITS
// ============================================================================

export const normalizeDevanagariDigits = (text: string): string => {
    if (!text) return "";

    const map: Record<string, string> = {
        "०": "0",
        "१": "1",
        "२": "2",
        "३": "3",
        "४": "4",
        "५": "5",
        "६": "6",
        "७": "7",
        "८": "8",
        "९": "9",
    };

    return text.replace(/[०-९]/g, (char) => map[char] || char);
};

// ============================================================================
// BASIC TEXT NORMALIZATION
// ============================================================================

export const normalizeWhitespace = (text: string): string => {
    return (text || "")
        .replace(/\u00A0/g, " ")
        .replace(/[ \t]+/g, " ")
        .trim();
};

const removeTableArtifacts = (text: string): string => {
    return normalizeWhitespace(
        (text || "")
            .replace(/[|]+/g, " ")
            .replace(/[{}\[\]<>]/g, " ")
            .replace(/[~`]/g, " ")
    );
};

const normalizePunctuation = (text: string): string => {
    return normalizeWhitespace(
        (text || "")
            .replace(/[।]+/g, " ")
            .replace(/[,:;]+/g, " ")
            .replace(/\s+/g, " ")
    );
};

// ============================================================================
// OCR CHARACTER CORRECTION
// ============================================================================

/**
 * Conservative OCR corrections.
 *
 * We deliberately avoid aggressive Hindi substitutions because a wrong
 * correction can be worse than leaving the original OCR value for review.
 */
export const correctCommonOcrCharacters = (value: string): string => {
    if (!value) return "";

    let text = value;

    // Common Tesseract punctuation mistakes.
    text = text
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/…/g, "...")
        .replace(/\u00A0/g, " ");

    // Common OCR confusion around date separators.
    text = text
        .replace(/[।]/g, "-")
        .replace(/[,:]/g, "-");

    return normalizeWhitespace(text);
};

/**
 * OCR corrections specifically useful for numeric fields.
 *
 * Example:
 * o9456789010 -> 09456789010
 * O456789010 -> 0456789010
 *
 * We only use this when processing numeric candidates.
 */
const normalizeNumericOcr = (value: string): string => {
    if (!value) return "";

    return normalizeDevanagariDigits(value)
        .replace(/[Oo]/g, "0")
        .replace(/[Il|]/g, "1")
        .replace(/[Zz]/g, "2")
        .replace(/[Ss]/g, "5")
        .replace(/[GgqQ]/g, "9")
        .replace(/[Ee]/g, "3")
        .replace(/[Aa]/g, "4");
};

// ============================================================================
// HEADER DETECTION
// ============================================================================

export const isHeaderLine = (line: string): boolean => {
    if (!line) return true;

    const text = normalizeWhitespace(line);

    if (!text) return true;

    if (
        text.includes("विद्यालय का नाम") ||
        text.includes("विद्यालय") && text.includes("शैक्षणिक सत्र") ||
        text.includes("प्रवेश पंजी") ||
        text.includes("हस्ताक्षर") ||
        text.includes("प्रधानाचार्य") ||
        text.includes("प्रवेश प्रभारी")
    ) {
        return true;
    }

    let matches = 0;

    for (const keyword of HEADER_KEYWORDS) {
        if (text.includes(keyword)) {
            matches++;
        }
    }

    // A line containing many column headings is definitely a header.
    if (matches >= 4) return true;

    return false;
};

// ============================================================================
// DATE PARSING
// ============================================================================

const DATE_REGEX =
    /(?<!\d)(\d{1,4})\s*[-/.:\s]\s*(\d{1,2})\s*[-/.:\s]\s*(\d{2,4})(?!\d)/g;

const DATE_SINGLE_REGEX =
    /(?<!\d)(\d{1,2})\s*[-/.]\s*(\d{1,2})\s*[-/.]\s*(\d{2,4})(?!\d)/;

export const validateAndFixDate = (dateStr: string): string => {
    if (!dateStr) return "";

    let value = normalizeDevanagariDigits(dateStr)
        .replace(/[।]/g, "-")
        .replace(/\s*[-/.:\s]\s*/g, "-")
        .trim();

    // Remove accidental non-date characters.
    value = value.replace(/[^\d-]/g, "");

    const parts = value.split("-").filter(Boolean);

    if (parts.length !== 3) return "";

    let day: number;
    let month: number;
    let year: number;

    const p0 = parts[0];
    const p1 = parts[1];
    const p2 = parts[2];

    // YYYY-MM-DD
    if (p0.length === 4) {
        year = parseInt(p0, 10);
        month = parseInt(p1, 10);
        day = parseInt(p2, 10);
    } else {
        day = parseInt(p0, 10);
        month = parseInt(p1, 10);
        year = parseInt(p2, 10);
    }

    // OCR sometimes produces 2-digit years.
    if (p2.length === 2) {
        year = year <= 35 ? 2000 + year : 1900 + year;
    }

    if (p2.length === 3) {
        if (p2.startsWith("20")) {
            year = 2000 + parseInt(p2.substring(2), 10);
        } else {
            year = 2000 + parseInt(p2.substring(1), 10);
        }
    }

    // OCR frequently turns 09 into 00.
    if ((p0 === "00" || p0 === "0") && month >= 1 && month <= 12) {
        day = 9;
    }

    // Swap only when obvious.
    if (month > 12 && day <= 12) {
        const temp = day;
        day = month;
        month = temp;
    }

    if (
        !Number.isFinite(day) ||
        !Number.isFinite(month) ||
        !Number.isFinite(year)
    ) {
        return "";
    }

    if (day < 1 || day > 31) return "";
    if (month < 1 || month > 12) return "";
    if (year < 1990 || year > 2030) return "";

    return `${String(day).padStart(2, "0")}-${String(month).padStart(
        2,
        "0"
    )}-${year}`;
};

const extractDates = (text: string): ParsedDate[] => {
    if (!text) return [];

    const normalized = normalizeDevanagariDigits(text);
    const result: ParsedDate[] = [];

    let match: RegExpExecArray | null;

    const regex = new RegExp(DATE_REGEX.source, "g");

    while ((match = regex.exec(normalized)) !== null) {
        const value = validateAndFixDate(match[0]);

        if (value) {
            result.push({
                value,
                year: parseInt(value.substring(6, 10), 10),
                index: match.index,
            });
        }
    }

    return result;
};

// ============================================================================
// PHONE PARSING
// ============================================================================

export const uncorruptOcrPhoneToken = (token: string): string => {
    if (!token) return "";

    let clean = normalizeNumericOcr(token)
        .replace(/[\s\-_|.:,/()[\]{}]/g, "")
        .trim();

    // Exact valid Indian mobile.
    if (/^[6-9]\d{9}$/.test(clean)) {
        return clean;
    }

    // Search for valid 10-digit sequence inside OCR token.
    const exact = clean.match(/[6-9]\d{9}/);

    if (exact) {
        return exact[0];
    }

    // OCR sometimes adds a leading 0.
    if (/^0[6-9]\d{9}$/.test(clean)) {
        return clean.substring(1);
    }

    return "";
};

export const extractPhone = (text: string): string => {
    if (!text) return "";

    const normalized = normalizeDevanagariDigits(text);

    // First try normal 10 digit number.
    const direct = normalized.match(/(?<!\d)[6-9]\d{9}(?!\d)/);

    if (direct) return direct[0];

    // Then process individual tokens.
    const tokens = normalized.split(/[\s|,;]+/);

    for (const token of tokens) {
        const phone = uncorruptOcrPhoneToken(token);

        if (phone) return phone;
    }

    // Last attempt: numeric OCR correction on a compact sequence.
    const compact = normalizeNumericOcr(normalized).replace(/\D/g, "");

    const match = compact.match(/[6-9]\d{9}/);

    return match ? match[0] : "";
};

// ============================================================================
// REGISTRATION / ADMISSION NUMBER
// ============================================================================

const isLikelyYear = (value: string): boolean => {
    return /^(19|20)\d{2}$/.test(value);
};

const cleanAdmissionNumber = (value: string): string => {
    if (!value) return "";

    const clean = normalizeNumericOcr(value)
        .replace(/[^\d]/g, "")
        .trim();

    if (!clean) return "";

    if (isLikelyYear(clean)) return "";

    // Register admission numbers are usually 1-5 digits.
    if (!/^\d{1,5}$/.test(clean)) return "";

    return clean;
};

// ============================================================================
// GENDER
// ============================================================================

export const normalizeGender = (value: string): GenderResult => {
    if (!value) {
        return {
            display: "पु.",
            dbValue: "Male",
        };
    }

    const lower = value.toLowerCase().trim();

    const femalePatterns = [
        "स्त्री",
        "महिला",
        "female",
        "girl",
        "लड़की",
        "लड़की",
        " कन्या",
        "f.",
    ];

    for (const pattern of femalePatterns) {
        if (lower.includes(pattern)) {
            return {
                display: "स्त्री.",
                dbValue: "Female",
            };
        }
    }

    // OCR may produce single-character f.
    if (/^f$/.test(lower)) {
        return {
            display: "स्त्री.",
            dbValue: "Female",
        };
    }

    return {
        display: "पु.",
        dbValue: "Male",
    };
};

const detectGender = (value: string): GenderResult | null => {
    if (!value) return null;

    const lower = value.toLowerCase();

    if (
        lower.includes("स्त्री") ||
        lower.includes("महिला") ||
        lower.includes("female") ||
        lower.includes("girl") ||
        /^f\.?$/.test(lower.trim())
    ) {
        return {
            display: "स्त्री.",
            dbValue: "Female",
        };
    }

    if (
        lower.includes("पु") ||
        lower.includes("पुरुष") ||
        lower.includes("male") ||
        /^m\.?$/.test(lower.trim())
    ) {
        return {
            display: "पु.",
            dbValue: "Male",
        };
    }

    return null;
};

// ============================================================================
// CATEGORY
// ============================================================================

export const normalizeCategory = (value: string): CategoryResult => {
    if (!value) {
        return {
            hindiCategory: "सामान्य",
            dbCategory: "General",
            recognized: false,
        };
    }

    const lower = value.toLowerCase().trim();

    if (
        lower.includes("सामान्य") ||
        lower.includes("सामन्य") ||
        lower.includes("समान्य") ||
        lower.includes("साबान्य") ||
        lower.includes("जनरल") ||
        lower.includes("general") ||
        /\bgen\b/.test(lower)
    ) {
        return {
            hindiCategory: "सामान्य",
            dbCategory: "General",
            recognized: true,
        };
    }

    if (
        lower.includes("ओबीसी") ||
        lower.includes("ओ.बी.सी") ||
        lower.includes("ओ०बी०सी०") ||
        lower.includes("पिछड़ा") ||
        lower.includes("पिछडा") ||
        lower.includes("obc")
    ) {
        return {
            hindiCategory: "ओ.बी.सी.",
            dbCategory: "OBC",
            recognized: true,
        };
    }

    if (
        lower.includes("एससी") ||
        lower.includes("एस.सी") ||
        lower.includes("एस०सी०") ||
        lower.includes("अजा") ||
        lower.includes("अनुसूचित जाति") ||
        /\bsc\b/.test(lower)
    ) {
        return {
            hindiCategory: "एस.सी.",
            dbCategory: "SC",
            recognized: true,
        };
    }

    if (
        lower.includes("एसटी") ||
        lower.includes("एस.टी") ||
        lower.includes("एस०टी०") ||
        lower.includes("अजजा") ||
        lower.includes("अनुसूचित जनजाति") ||
        /\bst\b/.test(lower)
    ) {
        return {
            hindiCategory: "एस.टी.",
            dbCategory: "ST",
            recognized: true,
        };
    }

    // Unrecognized value: almost always OCR noise ("-", "I", "[ 20", "age",
    // etc.) rather than a genuine 5th category. Don't let it leak into the
    // record as-is; default to General and let the caller flag it for review.
    return {
        hindiCategory: "सामान्य",
        dbCategory: "General",
        recognized: false,
    };
};

// ============================================================================
// NAME CLEANING
// ============================================================================

const escapeRegex = (value: string): string => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const removeKnownGarbage = (text: string): string => {
    let result = text;

    for (const garbage of OCR_GARBAGE) {
        result = result.replace(
            new RegExp(`\\b${escapeRegex(garbage)}\\b`, "gi"),
            " "
        );
    }

    return result;
};

export const cleanName = (rawName: string): string => {
    if (!rawName) return "";

    let value = correctCommonOcrCharacters(rawName);

    value = removeKnownGarbage(value);

    // Remove table / numeric artifacts.
    value = value
        .replace(/[|[\]{}#*=._\-]+/g, " ")
        .replace(/\d+/g, " ");

    value = normalizeWhitespace(value);

    if (!value) return "";

    const words = value.split(/\s+/).filter(Boolean);

    // Real names in this register are written in Devanagari. When a field
    // has at least one Devanagari word, any bare Latin-script token riding
    // alongside it (e.g. "संजय anf", "पलक ACT", "अंशुमान vita") is almost
    // always OCR noise bled in from a neighbouring cell, not part of the
    // name — so once we've seen Hindi in this field, Latin words are
    // dropped rather than kept.
    const hasHindi = words.some((word) => /[\u0900-\u097F]/.test(word));

    const cleanedWords: string[] = [];

    for (const word of words) {
        if (word.length < 2) continue;

        // Keep Hindi words.
        if (/[\u0900-\u097F]/.test(word)) {
            cleanedWords.push(word);
            continue;
        }

        // Keep meaningful English OCR words only if there is no Hindi at
        // all in this field (a fully English-OCR'd name).
        if (!hasHindi && /^[A-Za-z]+$/.test(word) && word.length >= 3) {
            cleanedWords.push(word);
        }
    }

    return cleanedWords.join(" ").trim();
};

// ============================================================================
// ADDRESS CLEANING
// ============================================================================

export const cleanAddress = (
    rawAddress: string,
    nameToStrip?: string,
    fatherToStrip?: string,
    motherToStrip?: string
): string => {
    if (!rawAddress) return "";

    let value = correctCommonOcrCharacters(rawAddress);

    const namesToStrip = [
        nameToStrip,
        fatherToStrip,
        motherToStrip,
    ].filter(Boolean) as string[];

    for (const name of namesToStrip) {
        if (name.length > 2) {
            value = value.replace(
                new RegExp(escapeRegex(name), "gi"),
                " "
            );
        }
    }

    value = removeKnownGarbage(value);

    // Remove dates.
    value = value.replace(
        /\b\d{1,2}\s*[-/.]\s*\d{1,2}\s*[-/.]\s*\d{2,4}\b/g,
        " "
    );

    // Remove phone numbers.
    value = value.replace(/\b[6-9]\d{9}\b/g, " ");

    // Remove category / gender labels.
    value = value
        .replace(
            /सामान्य|सामन्य|समान्य|साबान्य|जनरल|general|\bgen\b/gi,
            " "
        )
        .replace(
            /ओबीसी|ओ\.बी\.सी|obc|एससी|sc|एसटी|st/gi,
            " "
        )
        .replace(
            /पु\.?|पुरुष|male|स्त्री\.?|महिला|female/gi,
            " "
        );

    value = value
        .replace(/[|[\]{}#*=]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const words = value.split(/\s+/).filter(Boolean);

    const output: string[] = [];

    for (const word of words) {
        if (word.length < 2) continue;

        if (/^\d+$/.test(word)) continue;

        if (/[\u0900-\u097F]/.test(word)) {
            output.push(word);
            continue;
        }

        if (/^[A-Za-z]+$/.test(word) && word.length >= 3) {
            output.push(word);
        }
    }

    return output.join(" ").trim();
};

// ============================================================================
// CLASS
// ============================================================================

const parseClass = (value: string): number => {
    if (!value) return DEFAULT_CLASS;

    const normalized = normalizeNumericOcr(value);

    const match = normalized.match(/\d{1,2}/);

    if (!match) return DEFAULT_CLASS;

    const num = parseInt(match[0], 10);

    if (num >= 1 && num <= 12) {
        return num;
    }

    return DEFAULT_CLASS;
};

// ============================================================================
// CELL NORMALIZATION
// ============================================================================

const splitPipeCells = (line: string): string[] => {
    if (!line.includes("|")) return [];

    return line
        .split("|")
        .map((cell) => normalizeWhitespace(cell))
        .filter(Boolean);
};

const cleanCell = (value: string): string => {
    return normalizeWhitespace(
        correctCommonOcrCharacters(value)
            .replace(/^[|]+|[|]+$/g, "")
            .trim()
    );
};

// ============================================================================
// REGISTER ROW DETECTION
// ============================================================================

const startsWithSerialNumber = (line: string): boolean => {
    return /^\s*\|?\s*\d{1,3}\s*\|/.test(line);
};

const findSerialNumber = (cells: string[]): string => {
    if (!cells.length) return "";

    const first = normalizeNumericOcr(cells[0]);

    const match = first.match(/\d{1,3}/);

    return match ? match[0] : "";
};

// ============================================================================
// FIX OCR COLUMN SHIFT
// ============================================================================

/**
 * Detects whether a cell looks like a date.
 */
const looksLikeDate = (value: string): boolean => {
    if (!value) return false;

    return Boolean(
        validateAndFixDate(value) ||
        DATE_SINGLE_REGEX.test(normalizeDevanagariDigits(value))
    );
};

const looksLikePhone = (value: string): boolean => {
    return Boolean(extractPhone(value));
};

const looksLikeGender = (value: string): boolean => {
    return Boolean(detectGender(value));
};

const looksLikeCategory = (value: string): boolean => {
    if (!value) return false;

    const lower = value.toLowerCase();

    return (
        lower.includes("सामान्य") ||
        lower.includes("सामन्य") ||
        lower.includes("समान्य") ||
        lower.includes("जनरल") ||
        lower.includes("general") ||
        lower.includes("ओबीसी") ||
        lower.includes("obc") ||
        lower.includes("एससी") ||
        lower.includes("sc") ||
        lower.includes("एसटी") ||
        lower.includes("st")
    );
};

/**
 * Recover columns when OCR accidentally merges/splits cells.
 */
const recoverColumns = (cells: string[]): string[] => {
    const result = [...cells];

    // Typical expected minimum is 12 cells.
    //
    // OCR may omit an empty cell, resulting in 11.
    // We don't blindly pad because that could shift the entire row.
    //
    // Instead, use recognizable values to determine where important columns
    // belong.

    // --------------------------------------------------------------------------
    // Find admission date around column 2.
    // --------------------------------------------------------------------------

    if (result.length >= 3) {
        const dateAt2 = looksLikeDate(result[2]);

        if (!dateAt2) {
            for (let i = 1; i <= Math.min(4, result.length - 1); i++) {
                if (looksLikeDate(result[i])) {
                    const dateCell = result.splice(i, 1)[0];
                    result.splice(2, 0, dateCell);
                    break;
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Find DOB around column 6.
    // --------------------------------------------------------------------------

    if (result.length >= 7) {
        if (!looksLikeDate(result[6])) {
            for (let i = 4; i <= Math.min(8, result.length - 1); i++) {
                if (looksLikeDate(result[i])) {
                    const dateCell = result.splice(i, 1)[0];
                    result.splice(6, 0, dateCell);
                    break;
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Find gender around column 8.
    // --------------------------------------------------------------------------

    if (result.length >= 9 && !looksLikeGender(result[8])) {
        for (let i = 7; i <= Math.min(10, result.length - 1); i++) {
            if (looksLikeGender(result[i])) {
                const genderCell = result.splice(i, 1)[0];
                result.splice(8, 0, genderCell);
                break;
            }
        }
    }

    // --------------------------------------------------------------------------
    // Find phone around column 9.
    // --------------------------------------------------------------------------

    if (result.length >= 10 && !looksLikePhone(result[9])) {
        for (let i = 8; i <= Math.min(11, result.length - 1); i++) {
            if (looksLikePhone(result[i])) {
                const phoneCell = result.splice(i, 1)[0];
                result.splice(9, 0, phoneCell);
                break;
            }
        }
    }

    // --------------------------------------------------------------------------
    // Find category near the end.
    // --------------------------------------------------------------------------

    if (result.length >= 10) {
        const categoryIndex = result.findIndex(
            (cell, index) => index >= 9 && looksLikeCategory(cell)
        );

        if (categoryIndex > 11) {
            const categoryCell = result.splice(categoryIndex, 1)[0];
            result.splice(11, 0, categoryCell);
        }
    }

    return result;
};

// ============================================================================
// PARSE ONE TABLE ROW
// ============================================================================

export const parseRegisterTableRow = (
    rawLine: string
): ParsedRegisterCandidate | null => {
    if (!rawLine) return null;

    if (isHeaderLine(rawLine)) return null;

    const cells = splitPipeCells(rawLine);

    if (cells.length < 3) {
        return null;
    }

    const recovered = recoverColumns(cells);

    const serial = findSerialNumber(recovered);

    // A valid register row normally starts with a serial.
    if (!serial) {
        return null;
    }

    const candidate: ParsedRegisterCandidate = {
        serial_no: serial,

        admission_no: cleanAdmissionNumber(recovered[1] || ""),

        admission_date: validateAndFixDate(recovered[2] || ""),

        student_name: cleanName(recovered[3] || ""),

        father_guardian_name: cleanName(recovered[4] || ""),

        mother_name: cleanName(recovered[5] || ""),

        date_of_birth: validateAndFixDate(recovered[6] || ""),

        class: String(parseClass(recovered[7] || "")),

        gender: recovered[8] || "",

        mobile_number: extractPhone(recovered[9] || ""),

        address: cleanAddress(
            recovered[10] || "",
            cleanName(recovered[3] || ""),
            cleanName(recovered[4] || ""),
            cleanName(recovered[5] || "")
        ),

        category: recovered[11] || "",

        remarks: "—",

        source_line: rawLine,

        source_cells: recovered,
    };

    // --------------------------------------------------------------------------
    // Secondary recovery from complete row text.
    // --------------------------------------------------------------------------

    const completeText = recovered.join(" | ");

    if (!candidate.admission_date) {
        const dates = extractDates(completeText);

        if (dates.length > 0) {
            candidate.admission_date = dates[0].value;
        }
    }

    if (!candidate.date_of_birth) {
        const dates = extractDates(completeText);

        if (dates.length >= 2) {
            const sorted = [...dates].sort((a, b) => a.year - b.year);

            candidate.date_of_birth = sorted[0].value;

            if (!candidate.admission_date) {
                candidate.admission_date = sorted[sorted.length - 1].value;
            }
        }
    }

    if (!candidate.mobile_number) {
        candidate.mobile_number = extractPhone(completeText);
    }

    if (!candidate.gender) {
        const genderCell = recovered.find(looksLikeGender);

        if (genderCell) {
            candidate.gender = genderCell;
        }
    }

    if (!candidate.category) {
        const categoryCell = recovered.find(looksLikeCategory);

        if (categoryCell) {
            candidate.category = categoryCell;
        }
    }

    // --------------------------------------------------------------------------
    // If OCR shifted name columns, attempt recovery from positions.
    // --------------------------------------------------------------------------

    if (!candidate.student_name) {
        for (let i = 3; i < Math.min(7, recovered.length); i++) {
            const value = cleanName(recovered[i]);

            if (value.length >= MIN_STUDENT_NAME_LENGTH) {
                candidate.student_name = value;
                break;
            }
        }
    }

    if (!candidate.father_guardian_name) {
        const possible = recovered[4] || "";

        candidate.father_guardian_name = cleanName(possible);
    }

    if (!candidate.mother_name) {
        const possible = recovered[5] || "";

        candidate.mother_name = cleanName(possible);
    }

    // --------------------------------------------------------------------------
    // Reject obvious header/garbage rows.
    // --------------------------------------------------------------------------

    if (
        !candidate.student_name &&
        !candidate.admission_no &&
        !candidate.admission_date
    ) {
        return null;
    }

    return candidate;
};

// ============================================================================
// LINE PARSER FALLBACK
// ============================================================================

export const parseRegisterLine = (
    cleanLineStr: string
): Record<string, string> | null => {
    const line = normalizeWhitespace(cleanLineStr);

    if (!line) return null;

    if (isHeaderLine(line)) {
        return null;
    }

    const parsed = parseRegisterTableRow(line);

    if (!parsed) {
        return null;
    }

    return {
        serial_no: parsed.serial_no || "",
        admission_no: parsed.admission_no || "",
        registration_no: parsed.admission_no || "",

        admission_date: parsed.admission_date || "",

        student_name: parsed.student_name || "",
        name: parsed.student_name || "",

        father_guardian_name: parsed.father_guardian_name || "",
        father_name: parsed.father_guardian_name || "",

        mother_name: parsed.mother_name || "",

        date_of_birth: parsed.date_of_birth || "",

        class: parsed.class || String(DEFAULT_CLASS),

        gender: parsed.gender || "",

        mobile_number: parsed.mobile_number || "",
        parentPhone: parsed.mobile_number || "",
        parentphone: parsed.mobile_number || "",

        address: parsed.address || "",

        category: parsed.category || "सामान्य",
        caste_category: parsed.category || "सामान्य",

        academic_year: DEFAULT_ACADEMIC_YEAR,

        remarks: "—",
    };
};

// ============================================================================
// HEADER MAPPING
// ============================================================================

export const mapHindiHeaderToEnglish = (
    headerText: string
): string | null => {
    if (!headerText) return null;

    const text = normalizeWhitespace(headerText).toLowerCase();

    if (
        text.includes("प्रवेश") &&
        (
            text.includes("क्रमांक") ||
            text.includes("सं") ||
            text.includes("नंबर") ||
            text.includes("नं")
        )
    ) {
        return "admission_no";
    }

    if (
        (
            text.includes("प्रवेश") ||
            text.includes("admission") ||
            text.includes("adm")
        ) &&
        (
            text.includes("तिथि") ||
            text.includes("दिनांक") ||
            text.includes("तारीख") ||
            text.includes("date") ||
            text.includes("dt")
        )
    ) {
        return "admission_date";
    }

    if (
        text.includes("जन्म") ||
        text.includes("birth") ||
        text.includes("dob") ||
        text.includes("date of birth")
    ) {
        return "date_of_birth";
    }

    if (
        text.includes("छात्र") ||
        text.includes("विद्यार्थी") ||
        text.includes("student")
    ) {
        return "student_name";
    }

    if (
        text.includes("पिता") ||
        text.includes("संरक्षक") ||
        text.includes("father") ||
        text.includes("guardian")
    ) {
        return "father_guardian_name";
    }

    if (
        text.includes("माता") ||
        text.includes("mother")
    ) {
        return "mother_name";
    }

    if (
        text.includes("कक्षा") ||
        text.includes("class")
    ) {
        return "class";
    }

    if (
        text.includes("लिंग") ||
        text.includes("gender") ||
        text.includes("sex")
    ) {
        return "gender";
    }

    if (
        text.includes("मोबाइल") ||
        text.includes("फोन") ||
        text.includes("phone") ||
        text.includes("mobile") ||
        text.includes("contact")
    ) {
        return "mobile_number";
    }

    if (
        text.includes("पता") ||
        text.includes("address")
    ) {
        return "address";
    }

    if (
        text.includes("श्रेणी") ||
        text.includes("जाति") ||
        text.includes("category") ||
        text.includes("caste")
    ) {
        return "category";
    }

    return null;
};

// ============================================================================
// VALIDATION
// ============================================================================

const containsHeaderWord = (value: string): boolean => {
    if (!value) return false;

    const lower = value.toLowerCase();

    return HEADER_KEYWORDS.some((keyword) =>
        lower.includes(keyword.toLowerCase())
    );
};

const isValidStudentName = (name: string): boolean => {
    if (!name || name.length < MIN_STUDENT_NAME_LENGTH) {
        return false;
    }

    if (containsHeaderWord(name)) {
        return false;
    }

    // A name should normally contain Hindi or meaningful English.
    return /[\u0900-\u097F]/.test(name) || /^[A-Za-z ]+$/.test(name);
};

const isValidMobile = (phone: string): boolean => {
    return /^[6-9]\d{9}$/.test(phone);
};

const isValidAdmissionDate = (date: string): boolean => {
    if (!date) return false;

    const normalized = validateAndFixDate(date);

    if (!normalized) return false;

    const year = parseInt(normalized.substring(6, 10), 10);

    return year >= 2020 && year <= 2030;
};

const isValidDob = (date: string): boolean => {
    if (!date) return false;

    const normalized = validateAndFixDate(date);

    if (!normalized) return false;

    const year = parseInt(normalized.substring(6, 10), 10);

    return year >= 1990 && year <= 2021;
};

// ============================================================================
// CONFIDENCE
// ============================================================================

const calculateConfidence = (
    row: {
        admission_no: string;
        admission_date: string;
        student_name: string;
        father_guardian_name: string;
        mother_name: string;
        date_of_birth: string;
        class: number;
        gender: "Male" | "Female";
        mobile_number: string;
        address: string;
        category: string;
    },
    reviewReasons: ReviewReason[]
): number => {
    let score = 0;

    // Core identity fields.
    if (row.student_name) score += 20;
    if (row.father_guardian_name) score += 10;
    if (row.mother_name) score += 10;

    // Dates.
    if (isValidAdmissionDate(row.admission_date)) score += 10;
    if (isValidDob(row.date_of_birth)) score += 10;

    // Admission number.
    if (row.admission_no) score += 10;

    // Phone.
    if (isValidMobile(row.mobile_number)) score += 10;

    // Class.
    if (row.class >= 1 && row.class <= 12) score += 5;

    // Gender/category/address.
    if (row.gender) score += 5;
    if (row.category) score += 5;
    if (row.address) score += 5;

    // Penalize uncertain fields.
    score -= Math.min(reviewReasons.length * 5, 30);

    return Math.max(0, Math.min(100, score));
};

const getConfidenceLevel = (
    confidence: number
): ConfidenceLevel => {
    if (confidence >= 85) return "high";
    if (confidence >= 65) return "medium";
    return "low";
};

// ============================================================================
// FORMAT STUDENT ROW
// ============================================================================

export const formatStudentRowPayload = (
    rawRow: Record<string, any>,
    defaultSerialIndex = 1
): StudentOcrRow => {
    let studentName = cleanName(
        rawRow.student_name ||
        rawRow.studentName ||
        rawRow.name ||
        rawRow["छात्र का नाम"] ||
        ""
    );

    let fatherName = cleanName(
        rawRow.father_guardian_name ||
        rawRow.father_name ||
        rawRow.fathername ||
        rawRow.parentname ||
        rawRow.parent_name ||
        rawRow["पिता का नाम"] ||
        ""
    );

    let motherName = cleanName(
        rawRow.mother_name ||
        rawRow.mothername ||
        rawRow.motherName ||
        rawRow["माता का नाम"] ||
        ""
    );

    // --------------------------------------------------------------------------
    // Recovery when OCR merged names into one field.
    // --------------------------------------------------------------------------

    if (!fatherName && studentName) {
        const words = studentName.split(/\s+/).filter(Boolean);

        if (words.length >= 4) {
            studentName = `${words[0]} ${words[1]}`;
            fatherName = `${words[2]} ${words[3]}`;
        }
    }

    if (
        fatherName &&
        !motherName
    ) {
        const words = fatherName.split(/\s+/).filter(Boolean);

        if (words.length >= 4) {
            fatherName = `${words[0]} ${words[1]}`;
            motherName = `${words[2]} ${words[3]}`;
        }
    }

    // --------------------------------------------------------------------------
    // Add surname from father when OCR gives only first name.
    // --------------------------------------------------------------------------

    const fatherWords = fatherName.split(/\s+/).filter(Boolean);

    if (
        studentName &&
        fatherWords.length >= 2 &&
        studentName.split(/\s+/).length === 1
    ) {
        const surname = fatherWords[fatherWords.length - 1];

        if (/[\u0900-\u097F]/.test(surname)) {
            studentName = `${studentName} ${surname}`;
        }
    }

    if (
        motherName &&
        fatherWords.length >= 2 &&
        motherName.split(/\s+/).length === 1
    ) {
        const surname = fatherWords[fatherWords.length - 1];

        if (/[\u0900-\u097F]/.test(surname)) {
            motherName = `${motherName} ${surname}`;
        }
    }

    // --------------------------------------------------------------------------
    // Dates.
    // --------------------------------------------------------------------------

    let admissionDate = validateAndFixDate(
        rawRow.admission_date ||
        rawRow.admissionDate ||
        rawRow.admissiondate ||
        ""
    );

    let dateOfBirth = validateAndFixDate(
        rawRow.date_of_birth ||
        rawRow.dateOfBirth ||
        rawRow.dateofbirth ||
        rawRow.dob ||
        rawRow.birth_date ||
        rawRow.birthdate ||
        ""
    );

    // If both are absent, inspect any available date-like fields.
    if (!admissionDate || !dateOfBirth) {
        const combined = Object.values(rawRow).join(" ");
        const dates = extractDates(combined);

        if (dates.length >= 2) {
            const admissionCandidate = dates.find(
                (d) => d.year >= 2022
            );

            const dobCandidate = dates.find(
                (d) => d.year <= 2021
            );

            if (!admissionDate && admissionCandidate) {
                admissionDate = admissionCandidate.value;
            }

            if (!dateOfBirth && dobCandidate) {
                dateOfBirth = dobCandidate.value;
            }
        } else if (dates.length === 1) {
            const d = dates[0];

            if (d.year >= 2022 && !admissionDate) {
                admissionDate = d.value;
            }

            if (d.year <= 2021 && !dateOfBirth) {
                dateOfBirth = d.value;
            }
        }
    }

    // --------------------------------------------------------------------------
    // Admission number.
    //
    // IMPORTANT: Never use a fake fallback like 1018.
    // --------------------------------------------------------------------------

    const admissionNo = cleanAdmissionNumber(
        rawRow.admission_no ||
        rawRow.registration_no ||
        rawRow.registrationNo ||
        rawRow.registrationno ||
        ""
    );

    // --------------------------------------------------------------------------
    // Phone.
    // --------------------------------------------------------------------------

    const phone = extractPhone(
        rawRow.mobile_number ||
        rawRow.parentphone ||
        rawRow.parentPhone ||
        rawRow.phone ||
        rawRow.mobile ||
        rawRow.mobile_no ||
        ""
    );

    // --------------------------------------------------------------------------
    // Class.
    // --------------------------------------------------------------------------

    const classValue = parseClass(
        rawRow.class ||
        rawRow.classname ||
        rawRow.className ||
        String(DEFAULT_CLASS)
    );

    // --------------------------------------------------------------------------
    // Gender.
    // --------------------------------------------------------------------------

    const genderObj = normalizeGender(
        rawRow.gender || ""
    );

    // --------------------------------------------------------------------------
    // Category.
    // --------------------------------------------------------------------------

    const categoryObj = normalizeCategory(
        rawRow.category ||
        rawRow.caste_category ||
        rawRow.castecategory ||
        ""
    );

    // --------------------------------------------------------------------------
    // Address.
    // --------------------------------------------------------------------------

    const address = cleanAddress(
        rawRow.address ||
        rawRow["पता"] ||
        rawRow.addres ||
        rawRow.address_line ||
        "",
        studentName,
        fatherName,
        motherName
    );

    // --------------------------------------------------------------------------
    // Academic year.
    // --------------------------------------------------------------------------

    const academicYear =
        rawRow.academic_year ||
        rawRow.academicYear ||
        rawRow.academicyear ||
        DEFAULT_ACADEMIC_YEAR;

    // --------------------------------------------------------------------------
    // Serial.
    // --------------------------------------------------------------------------

    const parsedSerial = parseInt(
        rawRow.serial_no || "",
        10
    );

    const serialNo =
        Number.isFinite(parsedSerial) && parsedSerial > 0
            ? parsedSerial
            : defaultSerialIndex;

    // --------------------------------------------------------------------------
    // Review reasons.
    // --------------------------------------------------------------------------

    const reviewReasons: ReviewReason[] = [];

    if (!isValidStudentName(studentName)) {
        reviewReasons.push({
            field: "student_name",
            reason: "Student name is missing or appears to contain OCR noise.",
        });
    }

    if (!admissionNo) {
        reviewReasons.push({
            field: "admission_no",
            reason: "Admission number could not be confidently recovered.",
        });
    }

    if (!isValidAdmissionDate(admissionDate)) {
        reviewReasons.push({
            field: "admission_date",
            reason: "Admission date is missing or could not be validated.",
        });
    }

    if (!fatherName) {
        reviewReasons.push({
            field: "father_guardian_name",
            reason: "Father/guardian name is missing.",
        });
    }

    if (!motherName) {
        reviewReasons.push({
            field: "mother_name",
            reason: "Mother name is missing.",
        });
    }

    if (!isValidDob(dateOfBirth)) {
        reviewReasons.push({
            field: "date_of_birth",
            reason: "Date of birth is missing or could not be validated.",
        });
    }

    if (!isValidMobile(phone)) {
        reviewReasons.push({
            field: "mobile_number",
            reason: "Valid 10-digit mobile number could not be recovered.",
        });
    }

    if (!address) {
        reviewReasons.push({
            field: "address",
            reason: "Address could not be confidently extracted.",
        });
    }

    if (!categoryObj.recognized && (rawRow.category || rawRow.caste_category || rawRow.castecategory)) {
        reviewReasons.push({
            field: "category",
            reason: "Category value was not recognized and was defaulted to General.",
        });
    }

    const confidence = calculateConfidence(
        {
            admission_no: admissionNo,
            admission_date: admissionDate,
            student_name: studentName,
            father_guardian_name: fatherName,
            mother_name: motherName,
            date_of_birth: dateOfBirth,
            class: classValue,
            gender: genderObj.dbValue,
            mobile_number: phone,
            address,
            category: categoryObj.dbCategory,
        },
        reviewReasons
    );

    return {
        serial_no: serialNo,

        admission_no: admissionNo,
        admission_date: admissionDate,

        student_name: studentName,
        father_guardian_name: fatherName,
        mother_name: motherName,

        date_of_birth: dateOfBirth,

        class: classValue,
        division: rawRow.division || rawRow.section || DEFAULT_DIVISION,

        gender: genderObj.dbValue,

        mobile_number: phone,

        address,

        category: categoryObj.dbCategory,

        remarks: rawRow.remarks || "—",

        confidence,
        confidence_level: getConfidenceLevel(confidence),
        needs_review: reviewReasons.length > 0,
        review_reasons: reviewReasons,

        is_duplicate: false,
        duplicate_of_serial: null,

        source_line: rawRow.source_line,
        source_cells: Array.isArray(rawRow.source_cells) ? rawRow.source_cells : (typeof rawRow.source_cells === "string" ? [rawRow.source_cells] : []),

        // Legacy aliases.
        name: studentName,
        father_name: fatherName,

        parentName:
            fatherName ||
            motherName ||
            rawRow.parentName ||
            studentName ||
            "Guardian",

        parentphone: phone,
        parentPhone: phone,

        registration_no: admissionNo,
        registrationNo: admissionNo,

        caste_category: categoryObj.hindiCategory,
        casteCategory: categoryObj.dbCategory,

        academic_year: academicYear,
        academicYear: academicYear,

        dateOfBirth: dateOfBirth,
        dateofbirth: dateOfBirth,

        admissionDate: admissionDate,
        admissiondate: admissionDate,

        aadharNo:
            rawRow.aadharNo ||
            rawRow.aadharno ||
            rawRow.aadhar_no ||
            "",
    };
};

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

const normalizeForDuplicate = (value: string): string => {
    return normalizeWhitespace(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]/gu, "");
};

const makeDuplicateKey = (
    row: StudentOcrRow
): string => {
    const admission = normalizeForDuplicate(row.admission_no);

    const phone = normalizeForDuplicate(row.mobile_number);

    const name = normalizeForDuplicate(row.student_name);

    const father = normalizeForDuplicate(
        row.father_guardian_name
    );

    // Admission number is the strongest identifier.
    if (admission) {
        return `admission:${admission}`;
    }

    // Phone + student name.
    if (phone && name) {
        return `phone:${phone}|name:${name}`;
    }

    // Name + father.
    if (name && father) {
        return `name:${name}|father:${father}`;
    }

    return `name:${name}`;
};

export const detectDuplicates = (
    rows: StudentOcrRow[]
): StudentOcrRow[] => {
    const seen = new Map<string, number>();

    return rows.map((row) => {
        const key = makeDuplicateKey(row);

        if (!key || key === "name:") {
            return row;
        }

        const existingSerial = seen.get(key);

        if (existingSerial !== undefined) {
            return {
                ...row,
                is_duplicate: true,
                duplicate_of_serial: existingSerial,
                needs_review: true,
                review_reasons: [
                    ...row.review_reasons,
                    {
                        field: "duplicate",
                        reason: `Possible duplicate of serial number ${existingSerial}.`,
                    },
                ],
                confidence: Math.max(0, row.confidence - 15),
                confidence_level: getConfidenceLevel(
                    Math.max(0, row.confidence - 15)
                ),
            };
        }

        seen.set(key, row.serial_no);

        return row;
    });
};

// ============================================================================
// ADDRESS CONTINUATION
// ============================================================================

/**
 * OCR frequently produces:
 *
 * | 1 | ... | रामपुर |
 * सीतापुर
 *
 * The second line is actually part of the address.
 *
 * This function merges continuation lines into the previous row.
 */
const mergeAddressContinuationLines = (
    lines: string[]
): string[] => {
    const result: string[] = [];

    for (const line of lines) {
        const clean = normalizeWhitespace(line);

        if (!clean) continue;

        // A real table row starts with serial + pipe.
        const isNewRow = startsWithSerialNumber(clean);

        if (isNewRow || isHeaderLine(clean)) {
            result.push(clean);
            continue;
        }

        // If this is not a row/header and previous line exists,
        // it is very likely wrapped address text.
        if (result.length > 0) {
            const previous = result[result.length - 1];

            // Do not append arbitrary signature/footer text.
            if (
                !clean.includes("हस्ताक्षर") &&
                !clean.includes("प्रधानाचार्य") &&
                !clean.includes("तारीख")
            ) {
                result[result.length - 1] =
                    `${previous} ${clean}`.trim();
                continue;
            }
        }

        result.push(clean);
    }

    return result;
};

// ============================================================================
// NON-PIPE ROW RECOVERY
// ============================================================================

/**
 * Some OCR engines occasionally remove "|" completely.
 *
 * This parser tries to recover a row from whitespace-separated content.
 */
const parseWhitespaceRegisterRow = (
    line: string
): ParsedRegisterCandidate | null => {
    if (!line) return null;

    if (isHeaderLine(line)) return null;

    const normalized = normalizeDevanagariDigits(line);

    const serialMatch = normalized.match(
        /^\s*(\d{1,3})\s+/
    );

    if (!serialMatch) return null;

    const serial = serialMatch[1];

    const dates = extractDates(normalized);

    if (dates.length === 0) {
        return null;
    }

    const phone = extractPhone(normalized);

    if (!phone) {
        return null;
    }

    // Get text between first date and phone.
    const firstDateIndex = dates[0].index;

    const phoneIndex = normalized.indexOf(phone);

    if (phoneIndex <= firstDateIndex) {
        return null;
    }

    const middle = normalized
        .substring(
            firstDateIndex + dates[0].value.length,
            phoneIndex
        )
        .replace(/[|]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const words = middle.split(/\s+/).filter(Boolean);

    const meaningfulWords = words
        .map((word) => cleanName(word))
        .filter(Boolean);

    const candidate: ParsedRegisterCandidate = {
        serial_no: serial,

        admission_date:
            dates.find((d) => d.year >= 2022)?.value ||
            dates[0]?.value ||
            "",

        date_of_birth:
            dates.find((d) => d.year <= 2021)?.value ||
            "",

        mobile_number: phone,

        class: String(DEFAULT_CLASS),

        gender: "",

        category: "सामान्य",

        source_line: line,
    };

    // The whitespace parser cannot reliably determine all names.
    // Only assign names when we have enough structure.
    if (meaningfulWords.length >= 6) {
        candidate.student_name =
            `${meaningfulWords[0]} ${meaningfulWords[1]}`;

        candidate.father_guardian_name =
            `${meaningfulWords[2]} ${meaningfulWords[3]}`;

        candidate.mother_name =
            `${meaningfulWords[4]} ${meaningfulWords[5]}`;
    } else if (meaningfulWords.length >= 3) {
        candidate.student_name = meaningfulWords[0];
        candidate.father_guardian_name = meaningfulWords[1];
        candidate.mother_name = meaningfulWords[2];
    }

    return candidate.student_name
        ? candidate
        : null;
};

// ============================================================================
// CANDIDATE FILTERING
// ============================================================================

export const isGarbageRow = (
    row: Partial<StudentOcrRow>
): boolean => {
    const name = row.student_name || row.name || "";

    if (!name || name.length < 2) {
        return true;
    }

    if (containsHeaderWord(name)) {
        return true;
    }

    const garbageNamePatterns = [
        "विद्यालय",
        "प्रवेश पंजी",
        "शैक्षणिक सत्र",
        "छात्र का नाम",
        "हस्ताक्षर",
        "प्रधानाचार्य",
    ];

    const lowerName = name.toLowerCase();

    if (
        garbageNamePatterns.some((pattern) =>
            lowerName.includes(pattern.toLowerCase())
        )
    ) {
        return true;
    }

    return false;
};

// ============================================================================
// SERIAL ORDER / ROW RECOVERY
// ============================================================================

const sortRowsBySerial = (
    rows: StudentOcrRow[]
): StudentOcrRow[] => {
    return [...rows].sort(
        (a, b) => a.serial_no - b.serial_no
    );
};

/**
 * Keep the first occurrence of a serial number.
 *
 * OCR can sometimes process the same row twice.
 */
const removeExactSerialDuplicates = (
    rows: StudentOcrRow[]
): StudentOcrRow[] => {
    const seen = new Set<number>();

    const result: StudentOcrRow[] = [];

    for (const row of rows) {
        if (seen.has(row.serial_no)) {
            continue;
        }

        seen.add(row.serial_no);
        result.push(row);
    }

    return result;
};

// ============================================================================
// TOP LEVEL OCR PARSER
// ============================================================================

export const parseOcrTextToRows = (
    ocrText: string,
    templateHeaders: string[] = []
): ParseOcrResult => {
    if (!ocrText || !ocrText.trim()) {
        return {
            rows: [],
            error: "No text found in the image.",
            total_candidates: 0,
            valid_rows: 0,
            duplicate_rows: 0,
            review_rows: 0,
        };
    }

    // --------------------------------------------------------------------------
    // 1. Normalize raw OCR lines.
    // --------------------------------------------------------------------------

    const rawLines = ocrText
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map((line) =>
            normalizeWhitespace(
                correctCommonOcrCharacters(line)
            )
        )
        .filter(Boolean);

    // --------------------------------------------------------------------------
    // 2. Merge address continuation lines.
    // --------------------------------------------------------------------------

    const lines = mergeAddressContinuationLines(
        rawLines
    );

    // --------------------------------------------------------------------------
    // 3. Parse pipe-based register rows.
    // --------------------------------------------------------------------------

    const candidates: ParsedRegisterCandidate[] = [];

    for (const line of lines) {
        if (isHeaderLine(line)) {
            continue;
        }

        let candidate = parseRegisterTableRow(line);

        if (!candidate) {
            candidate = parseWhitespaceRegisterRow(line);
        }

        if (candidate) {
            candidates.push(candidate);
        }
    }

    // --------------------------------------------------------------------------
    // 4. If parser did not find rows, try a more aggressive pipe scan.
    // --------------------------------------------------------------------------

    if (candidates.length === 0) {
        for (const rawLine of rawLines) {
            if (!rawLine.includes("|")) continue;

            const cells = splitPipeCells(rawLine);

            if (cells.length < 4) continue;

            const serial = findSerialNumber(cells);

            if (!serial) continue;

            const allText = cells.join(" ");

            const dates = extractDates(allText);

            const phone = extractPhone(allText);

            // Find candidate Hindi names after admission date.
            let nameCandidates: string[] = [];

            if (dates.length > 0) {
                const dateIndex = allText.indexOf(
                    dates[0].value
                );

                const afterDate = allText.substring(
                    dateIndex + dates[0].value.length
                );

                nameCandidates = afterDate
                    .split("|")
                    .map((v) => cleanName(v))
                    .filter(Boolean);
            }

            candidates.push({
                serial_no: serial,
                admission_no: cleanAdmissionNumber(
                    cells[1] || ""
                ),
                admission_date: dates.find(
                    (d) => d.year >= 2022
                )?.value || "",
                student_name: nameCandidates[0] || "",
                father_guardian_name:
                    nameCandidates[1] || "",
                mother_name:
                    nameCandidates[2] || "",
                date_of_birth:
                    dates.find(
                        (d) => d.year <= 2021
                    )?.value || "",
                class: String(DEFAULT_CLASS),
                gender: "",
                mobile_number: phone,
                address: "",
                category: "सामान्य",
                source_line: rawLine,
                source_cells: cells,
            });
        }
    }

    // --------------------------------------------------------------------------
    // 5. Format candidates.
    // --------------------------------------------------------------------------

    let rows: StudentOcrRow[] = [];

    for (let index = 0; index < candidates.length; index++) {
        const candidate = candidates[index];

        const row = formatStudentRowPayload(
            {
                ...candidate,
                source_line:
                    candidate.source_line || "",
                source_cells:
                    Array.isArray(candidate.source_cells) ? candidate.source_cells : (typeof candidate.source_cells === "string" ? [candidate.source_cells] : []),
            },
            index + 1
        );

        if (!isGarbageRow(row)) {
            rows.push(row);
        }
    }

    // --------------------------------------------------------------------------
    // 6. Sort.
    // --------------------------------------------------------------------------

    rows = sortRowsBySerial(rows);

    // --------------------------------------------------------------------------
    // 7. Remove exact duplicate serial rows.
    // --------------------------------------------------------------------------

    rows = removeExactSerialDuplicates(rows);

    // --------------------------------------------------------------------------
    // 8. Detect actual duplicate students.
    // --------------------------------------------------------------------------

    rows = detectDuplicates(rows);

    // --------------------------------------------------------------------------
    // 9. Re-number only when serial number is missing.
    //
    // Existing OCR serial numbers are preserved.
    // --------------------------------------------------------------------------

    rows = rows.map((row, index) => {
        if (!row.serial_no || row.serial_no <= 0) {
            return {
                ...row,
                serial_no: index + 1,
            };
        }

        return row;
    });

    // --------------------------------------------------------------------------
    // 10. 20-row sanity check.
    //
    // We don't reject >20 because another register page may be supplied.
    // We only expose the diagnostic.
    // --------------------------------------------------------------------------

    const reviewRows = rows.filter(
        (row) => row.needs_review
    ).length;

    const duplicateRows = rows.filter(
        (row) => row.is_duplicate
    ).length;

    if (rows.length === 0) {
        return {
            rows: [],
            error:
                "Could not parse structured student rows from the OCR text. Please try a clearer register image.",
            total_candidates: candidates.length,
            valid_rows: 0,
            duplicate_rows: 0,
            review_rows: 0,
        };
    }

    return {
        rows,
        error: null,

        total_candidates: candidates.length,
        valid_rows: rows.length,
        duplicate_rows: duplicateRows,
        review_rows: reviewRows,
    };
};

// ============================================================================
// CLEAN DB JSON
// ============================================================================

/**
 * Use this when you don't want OCR metadata in your API request.
 */
export const toCleanStudentJson = (
    rows: StudentOcrRow[]
): Record<string, any>[] => {
    return rows.map((row) => ({
        serial_no: row.serial_no,

        admission_no: row.admission_no,
        admission_date: row.admission_date,

        student_name: row.student_name,
        father_guardian_name:
            row.father_guardian_name,
        mother_name: row.mother_name,

        date_of_birth: row.date_of_birth,

        class: row.class,
        division: row.division,

        gender: row.gender,

        mobile_number: row.mobile_number,

        address: row.address,

        category: row.category,

        remarks: row.remarks,
    }));
};

// ============================================================================
// EMPTY ROW
// ============================================================================

export const createEmptyStudentRow = (
    serialNo: number
): StudentOcrRow => ({
    serial_no: serialNo,

    admission_no: "",
    admission_date: "",

    student_name: "",
    father_guardian_name: "",
    mother_name: "",

    date_of_birth: "",

    class: DEFAULT_CLASS,
    division: DEFAULT_DIVISION,

    gender: "Male",

    mobile_number: "",

    address: "",

    category: "General",

    remarks: "—",

    confidence: 0,
    confidence_level: "low",

    needs_review: true,

    review_reasons: [
        {
            field: "row",
            reason: "Empty student row.",
        },
    ],

    is_duplicate: false,
    duplicate_of_serial: null,

    source_line: "",
    source_cells: [],

    name: "",
    father_name: "",

    parentName: "",
    parentphone: "",
    parentPhone: "",

    registration_no: "",
    registrationNo: "",

    caste_category: "सामान्य",
    casteCategory: "General",

    academic_year: DEFAULT_ACADEMIC_YEAR,
    academicYear: DEFAULT_ACADEMIC_YEAR,

    dateOfBirth: "",
    dateofbirth: "",

    admissionDate: "",
    admissiondate: "",

    aadharNo: "",
});

// ============================================================================
// EXPECTED 20 ROW HELPER
// ============================================================================

/**
 * Returns a 20-row preview.
 *
 * Missing serial numbers are represented by empty rows and marked
 * needs_review.
 */
export const ensureTwentyRows = (
    rows: StudentOcrRow[]
): StudentOcrRow[] => {
    const bySerial = new Map<number, StudentOcrRow>();

    for (const row of rows) {
        if (
            row.serial_no >= 1 &&
            row.serial_no <= 20
        ) {
            bySerial.set(row.serial_no, row);
        }
    }

    const result: StudentOcrRow[] = [];

    for (let serial = 1; serial <= 20; serial++) {
        const existing = bySerial.get(serial);

        if (existing) {
            result.push(existing);
        } else {
            result.push(
                createEmptyStudentRow(serial)
            );
        }
    }

    return result;
};

// ============================================================================
// DEBUG / SUMMARY
// ============================================================================

export const getOcrParseSummary = (
    result: ParseOcrResult
) => {
    return {
        totalCandidates: result.total_candidates,
        validRows: result.valid_rows,
        duplicateRows: result.duplicate_rows,
        reviewRows: result.review_rows,

        highConfidenceRows: result.rows.filter(
            (row) =>
                row.confidence_level === "high"
        ).length,

        mediumConfidenceRows: result.rows.filter(
            (row) =>
                row.confidence_level === "medium"
        ).length,

        lowConfidenceRows: result.rows.filter(
            (row) =>
                row.confidence_level === "low"
        ).length,

        cleanRows: result.rows.filter(
            (row) => !row.needs_review
        ).length,
    };
};