import {
  GraduationCap,
  FileText,
  CreditCard,
  Layers,
  Sparkles,
  DollarSign,
  Smartphone,
  Building2,
  Wallet,
} from "lucide-react";

// ============================================================================
// 1. Fee Component Types & Default Items
// ============================================================================

export interface FeeComponentDefinition {
  id: string;
  label: string;
  icon: any;
  defaultAmount?: string;
  category?: string;
}

export const BASE_FEE_COMPONENTS: FeeComponentDefinition[] = [
  { id: "tuition", label: "Tuition Fee", icon: GraduationCap },
  { id: "exam", label: "Exam Fee", icon: FileText },
  { id: "transport", label: "Transport Fee", icon: CreditCard },
  { id: "library", label: "Library Fee", icon: Layers },
  { id: "sports", label: "Sports Fee", icon: Sparkles },
  { id: "hostel", label: "Hostel Fee", icon: DollarSign },
  { id: "lab", label: "Science Lab Fee", icon: DollarSign },
  { id: "annual", label: "Annual Charges", icon: Sparkles },
  { id: "uniforms", label: "Uniform Charge", icon: Layers },
  { id: "other", label: "Other Component Fee", icon: DollarSign },
];

export const DEFAULT_FEE_TYPES = [
  { id: "tuition", label: "Tuition Fee" },
  { id: "lab", label: "Science Lab Fee" },
  { id: "uniforms", label: "Uniform Charge" },
  { id: "exam", label: "Exam Fee" },
  { id: "transport", label: "Transport Fee" },
  { id: "library", label: "Library Fee" },
  { id: "sports", label: "Sports Fee" },
  { id: "other", label: "Other Component Fee" },
];

export const DEFAULT_SELECTED_FEE_ITEMS = [
  { feeType: "tuition", label: "Tuition Fee", amount: "", selected: true },
  { feeType: "lab", label: "Science Lab Fee", amount: "", selected: false },
  { feeType: "uniforms", label: "Uniform Charge", amount: "", selected: false },
  { feeType: "exam", label: "Exam Fee", amount: "", selected: false },
  { feeType: "transport", label: "Transport Fee", amount: "", selected: false },
  { feeType: "library", label: "Library Fee", amount: "", selected: false },
  { feeType: "sports", label: "Sports Fee", amount: "", selected: false },
  { feeType: "other", label: "Other Component Fee", amount: "", selected: false },
];

// ============================================================================
// 2. Fee Status Options & Badges
// ============================================================================

export const FEE_STATUSES = ["paid", "pending", "overdue"] as const;
export type FeeStatusType = (typeof FEE_STATUSES)[number];

export const FEE_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
];

export const FEE_STATUS_BADGE_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "destructive" | "outline" }
> = {
  paid: { label: "Paid", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  overdue: { label: "Overdue", variant: "destructive" },
};

// ============================================================================
// 3. Payment Methods & Checkout Gateways
// ============================================================================

export interface PaymentOption {
  id: string;
  name: string;
  desc: string;
  icon: any;
  badge?: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "razorpay",
    name: "Razorpay Gateway",
    desc: "Cards, UPI, NetBanking, Wallets",
    icon: CreditCard,
    badge: "Test Mode",
  },
  {
    id: "upi",
    name: "UPI / QR Code",
    desc: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
    badge: "Instant",
  },
  {
    id: "credit_card",
    name: "Credit / Debit Card",
    desc: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  {
    id: "net_banking",
    name: "Net Banking",
    desc: "SBI, HDFC, ICICI & 50+ Banks",
    icon: Building2,
  },
  {
    id: "wallet",
    name: "Mobile Wallet",
    desc: "Amazon Pay, Mobikwik",
    icon: Wallet,
  },
];

export const PAYMENT_METHOD_LABEL_MAP: Record<string, string> = {
  razorpay: "Razorpay Gateway (Test Mode)",
  credit_card: "Credit / Debit Card",
  upi: "UPI / QR Code",
  net_banking: "Net Banking",
  wallet: "Mobile Wallet",
  cash: "Direct Cash / Settlement",
};

// ============================================================================
// 4. Months & Academic Session Calendars
// ============================================================================

export const MONTH_NAMES_MAP: Record<string, string> = {
  "01": "January",
  "02": "February",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "August",
  "09": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

export const MONTH_SHORT_NAMES_MAP: Record<string, string> = {
  "01": "Jan",
  "02": "Feb",
  "03": "Mar",
  "04": "Apr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Aug",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dec",
};

export const MONTH_GRID_ITEMS = [
  { value: "04", label: "Apr", fullLabel: "April", badge: "April Start" },
  { value: "05", label: "May", fullLabel: "May", badge: "" },
  { value: "06", label: "Jun", fullLabel: "June", badge: "Q1 End" },
  { value: "07", label: "Jul", fullLabel: "July", badge: "July Start" },
  { value: "08", label: "Aug", fullLabel: "August", badge: "" },
  { value: "09", label: "Sep", fullLabel: "September", badge: "Mid Year" },
  { value: "10", label: "Oct", fullLabel: "October", badge: "" },
  { value: "11", label: "Nov", fullLabel: "November", badge: "" },
  { value: "12", label: "Dec", fullLabel: "December", badge: "Winter" },
  { value: "01", label: "Jan", fullLabel: "January", badge: "New Year" },
  { value: "02", label: "Feb", fullLabel: "February", badge: "" },
  { value: "03", label: "Mar", fullLabel: "March", badge: "Year End" },
];

export const APRIL_START_MONTHS = [
  { value: "04", label: "Apr", fullLabel: "April", order: 1, quarter: "Q1" },
  { value: "05", label: "May", fullLabel: "May", order: 2, quarter: "Q1" },
  { value: "06", label: "Jun", fullLabel: "June", order: 3, quarter: "Q1" },
  { value: "07", label: "Jul", fullLabel: "July", order: 4, quarter: "Q2" },
  { value: "08", label: "Aug", fullLabel: "August", order: 5, quarter: "Q2" },
  { value: "09", label: "Sep", fullLabel: "September", order: 6, quarter: "Q2" },
  { value: "10", label: "Oct", fullLabel: "October", order: 7, quarter: "Q3" },
  { value: "11", label: "Nov", fullLabel: "November", order: 8, quarter: "Q3" },
  { value: "12", label: "Dec", fullLabel: "December", order: 9, quarter: "Q3" },
  { value: "01", label: "Jan", fullLabel: "January", order: 10, quarter: "Q4" },
  { value: "02", label: "Feb", fullLabel: "February", order: 11, quarter: "Q4" },
  { value: "03", label: "Mar", fullLabel: "March", order: 12, quarter: "Q4" },
];

export const JULY_START_MONTHS = [
  { value: "07", label: "Jul", fullLabel: "July", order: 1, quarter: "Q1" },
  { value: "08", label: "Aug", fullLabel: "August", order: 2, quarter: "Q1" },
  { value: "09", label: "Sep", fullLabel: "September", order: 3, quarter: "Q1" },
  { value: "10", label: "Oct", fullLabel: "October", order: 4, quarter: "Q2" },
  { value: "11", label: "Nov", fullLabel: "November", order: 5, quarter: "Q2" },
  { value: "12", label: "Dec", fullLabel: "December", order: 6, quarter: "Q2" },
  { value: "01", label: "Jan", fullLabel: "January", order: 7, quarter: "Q3" },
  { value: "02", label: "Feb", fullLabel: "February", order: 8, quarter: "Q3" },
  { value: "03", label: "Mar", fullLabel: "March", order: 9, quarter: "Q3" },
  { value: "04", label: "Apr", fullLabel: "April", order: 10, quarter: "Q4" },
  { value: "05", label: "May", fullLabel: "May", order: 11, quarter: "Q4" },
  { value: "06", label: "Jun", fullLabel: "June", order: 12, quarter: "Q4" },
];

export const APRIL_QUARTERS = [
  { name: "Quarter 1 (Apr - Jun)", code: "04,05,06", months: "Apr, May, Jun", multiplier: 3 },
  { name: "Quarter 2 (Jul - Sep)", code: "07,08,09", months: "Jul, Aug, Sep", multiplier: 3 },
  { name: "Quarter 3 (Oct - Dec)", code: "10,11,12", months: "Oct, Nov, Dec", multiplier: 3 },
  { name: "Quarter 4 (Jan - Mar)", code: "01,02,03", months: "Jan, Feb, Mar", multiplier: 3 },
];

export const JULY_QUARTERS = [
  { name: "Quarter 1 (Jul - Sep)", code: "07,08,09", months: "Jul, Aug, Sep", multiplier: 3 },
  { name: "Quarter 2 (Oct - Dec)", code: "10,11,12", months: "Oct, Nov, Dec", multiplier: 3 },
  { name: "Quarter 3 (Jan - Mar)", code: "01,02,03", months: "Jan, Feb, Mar", multiplier: 3 },
  { name: "Quarter 4 (Apr - Jun)", code: "04,05,06", months: "Apr, May, Jun", multiplier: 3 },
];

export const SESSION_CYCLES = [
  { value: "april", label: "April Cycle (Apr - Mar)", defaultStartMonth: "04" },
  { value: "july", label: "July Cycle (Jul - Jun)", defaultStartMonth: "07" },
];

// ============================================================================
// 5. Fee Frequencies
// ============================================================================

export const FEE_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "half_yearly", label: "Half Yearly" },
  { value: "annually", label: "Annually" },
  { value: "one_time", label: "One Time" },
];

// ============================================================================
// 6. Class Options & Multi-Class Selection Presets
// ============================================================================

export const ALL_CLASS_OPTIONS = [
  { id: "1", label: "LKG" },
  { id: "2", label: "UKG" },
  { id: "3", label: "Class 1" },
  { id: "4", label: "Class 2" },
  { id: "5", label: "Class 3" },
  { id: "6", label: "Class 4" },
  { id: "7", label: "Class 5" },
  { id: "8", label: "Class 6" },
  { id: "9", label: "Class 7" },
  { id: "10", label: "Class 8" },
  { id: "11", label: "Class 9" },
  { id: "12", label: "Class 10" },
  { id: "13", label: "Class 11" },
  { id: "14", label: "Class 12" },
];

export const PRIMARY_CLASS_IDS = ["3", "4", "5", "6", "7"];
export const SECONDARY_CLASS_IDS = ["8", "9", "10", "11", "12"];

// ============================================================================
// 7. Fee Preset Templates for Fast Configuration
// ============================================================================

export const FEE_PRESET_TEMPLATES = [
  {
    name: "Monthly Tuition Fee",
    feeType: "tuition",
    amount: "3000",
    frequency: "monthly",
    month: "all",
    description: "Standard monthly tuition fee component",
    badge: "Popular",
  },
  {
    name: "Uniform Set Charge",
    feeType: "uniforms",
    amount: "1500",
    frequency: "one_time",
    month: "anytime",
    description: "Uniform set charge - payable any time in year",
    badge: "Any Time in Year",
  },
  {
    name: "Science Lab Fee",
    feeType: "lab",
    amount: "1200",
    frequency: "one_time",
    month: "anytime",
    description: "Science & practical lab fee - payable any time in year",
    badge: "Any Time in Year",
  },
  {
    name: "Other Component Fee",
    feeType: "other",
    amount: "500",
    frequency: "one_time",
    month: "anytime",
    description: "General / miscellaneous component fee - payable any time in year",
    badge: "Any Time in Year",
  },
  {
    name: "Term 1 Mid-Term Exam Fee",
    feeType: "exam",
    amount: "500",
    frequency: "one_time",
    month: "07",
    description: "July term examination fee",
    badge: "July Exam",
  },
  {
    name: "Term 2 Mid-Term Exam Fee",
    feeType: "exam",
    amount: "500",
    frequency: "one_time",
    month: "11",
    description: "November term examination fee",
    badge: "November Exam",
  },
  {
    name: "Bus Transport Fee",
    feeType: "transport",
    amount: "800",
    frequency: "monthly",
    month: "all",
    description: "Optional monthly bus transport charge",
    badge: "Monthly",
  },
  {
    name: "Computer & IT Fee",
    feeType: "computer",
    amount: "400",
    frequency: "monthly",
    month: "all",
    description: "Monthly CS lab access charge",
    badge: "Lab Access",
  },
  {
    name: "Annual Activity Fee",
    feeType: "annual",
    amount: "1000",
    frequency: "annually",
    month: "04",
    description: "Annual academic activity and sports fee",
    badge: "April Annual",
  },
];

// ============================================================================
// 8. Navigation Sub-Tabs & Pagination Defaults
// ============================================================================

export const FEE_SUB_TABS = [
  { id: "invoices", label: "Invoices & Ledger" },
  { id: "schedules", label: "Schedules Master (V2)" },
  { id: "structures", label: "Class Fees Structures" },
  { id: "analytics", label: "Analytics" },
] as const;

export type FeeSubTab = (typeof FEE_SUB_TABS)[number]["id"];

export const DEFAULT_FEE_PAGE_LIMIT = 50;
export const FEE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ============================================================================
// 9. Remark Parsing Helpers
// ============================================================================

export interface FeeBreakupItem {
  name: string;
  amount: number;
  multiplier?: string;
  raw: string;
}

export interface ParsedFeeRemarks {
  coveredMonthsText: string;
  componentLabel: string;
  componentType: string;
  extractedAmount: string;
  breakup: FeeBreakupItem[];
}

export function parseFeeRemarks(remarks?: string): ParsedFeeRemarks {
  if (!remarks) {
    return {
      coveredMonthsText: "",
      componentLabel: "",
      componentType: "",
      extractedAmount: "",
      breakup: [],
    };
  }

  // 1. Extract parenthesized coverage like "(Covers: Month 04, 05, 06)" or "(April + May + June)" or "(Apr - Jun)"
  let coveredMonthsText = "";
  const parenMatch = remarks.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    coveredMonthsText = parenMatch[1].trim();
  }

  // 2. Extract component label after colon like ": Tuition Fee (₹9000)"
  let componentLabel = "";
  if (remarks.includes(":")) {
    const parts = remarks.split(":");
    componentLabel = parts.slice(1).join(":").trim();
  }

  // 3. Detect known fee type from remarks
  const lower = remarks.toLowerCase();
  let componentType = "";
  if (lower.includes("tuition")) componentType = "tuition";
  else if (lower.includes("exam")) componentType = "exam";
  else if (lower.includes("transport") || lower.includes("bus")) componentType = "transport";
  else if (lower.includes("library")) componentType = "library";
  else if (lower.includes("sports")) componentType = "sports";
  else if (lower.includes("hostel")) componentType = "hostel";
  else if (lower.includes("lab") || lower.includes("computer")) componentType = "lab";
  else if (lower.includes("annual")) componentType = "annual";
  else if (lower.includes("uniform")) componentType = "uniforms";

  // 4. Extract amount if present in remarks like "(₹9000)" or "₹9,000"
  let extractedAmount = "";
  const amtMatch = remarks.match(/₹\s*([\d,]+)/);
  if (amtMatch && amtMatch[1]) {
    extractedAmount = amtMatch[1].replace(/,/g, "");
  }

  // 5. Parse itemized amount breakup (e.g. "Tuition Fee (3x = ₹1500) + Term Fee (₹500) + Sports Fee (₹200)")
  const breakup: FeeBreakupItem[] = [];

  let componentsStr = remarks;
  if (remarks.includes(":")) {
    const parts = remarks.split(":");
    componentsStr = parts.slice(1).join(":").trim();
  }

  // Remove leading coverage parentheses if still present
  componentsStr = componentsStr.replace(/^\s*\([^)]*\)\s*[:]?\s*/, "");

  // Split into component chunks by '+' or by ',' if multiple '₹' are found
  let rawChunks: string[] = [];
  if (componentsStr.includes("+")) {
    rawChunks = componentsStr.split("+").map((s) => s.trim()).filter(Boolean);
  } else if ((componentsStr.match(/₹/g) || []).length > 1 && componentsStr.includes(",")) {
    rawChunks = componentsStr.split(",").map((s) => s.trim()).filter(Boolean);
  } else if (componentsStr.trim()) {
    rawChunks = [componentsStr.trim()];
  }

  for (const chunk of rawChunks) {
    const chunkAmtMatch = chunk.match(/(?:₹|INR|Rs\.?)\s*([\d,]+(?:\.\d+)?)/i);
    const amountVal = chunkAmtMatch ? parseFloat(chunkAmtMatch[1].replace(/,/g, "")) : 0;

    const multMatch = chunk.match(/(\d+x|\d+\s*months?)/i);
    const multiplier = multMatch ? multMatch[1] : undefined;

    let name = chunk
      .replace(/\([^)]*\)/g, "")
      .replace(/[:=–-].*$/, "")
      .trim();

    if (!name) {
      name = chunk.replace(/(?:₹|INR|Rs\.?)\s*[\d,]+(?:\.\d+)?/i, "").trim();
    }

    if (name || amountVal > 0) {
      breakup.push({
        name: name || "Fee Component",
        amount: amountVal,
        multiplier,
        raw: chunk,
      });
    }
  }

  return {
    coveredMonthsText,
    componentLabel,
    componentType,
    extractedAmount,
    breakup,
  };
}
