import React from "react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import {
  Sparkles,
  GraduationCap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Clock,
  DollarSign,
  Building,
  Star,
  Zap,
} from "lucide-react";
import { ClassFeeStructureItem, FeePaymentScheduleItem } from "../../../Services/fee.service";
import { MONTH_NAMES_MAP, MONTH_GRID_ITEMS } from "../../../constants/fee";

const formatCoveredMonths = (monthsStr?: string) => {
  if (!monthsStr) return "Regular Month";
  return monthsStr
    .split(",")
    .map((m) => {
      const code = m.trim().padStart(2, "0");
      return MONTH_NAMES_MAP[code] || code;
    })
    .join(" + ");
};

const formatCoveredMonthsWithCodes = (monthsStr?: string) => {
  if (!monthsStr) return "Regular Month";
  return monthsStr
    .split(",")
    .map((m) => {
      const code = m.trim().padStart(2, "0");
      const name = MONTH_NAMES_MAP[code] || `Month ${code}`;
      return `${name} (${code})`;
    })
    .join(" + ");
};

interface GenerateInvoicesModalProps {
  showGenerateModal: boolean;
  setShowGenerateModal: (show: boolean) => void;
  generateClassId?: string;
  setGenerateClassId?: (val: string) => void;
  generateDueDate?: string;
  setGenerateDueDate?: (val: string) => void;
  generateMonth?: string;
  setGenerateMonth?: (val: string) => void;
  generateScheduleId?: string;
  setGenerateScheduleId?: (val: string) => void;
  generateInstallmentName?: string;
  setGenerateInstallmentName?: (val: string) => void;
  generateMultiplier?: number;
  setGenerateMultiplier?: (val: number) => void;
  generateSessionStart?: string;
  setGenerateSessionStart?: (val: string) => void;
  generateFormat?: string;
  setGenerateFormat?: (val: string) => void;
  generateIsEntireYear?: boolean;
  setGenerateIsEntireYear?: (val: boolean) => void;
  handleGenerateInvoices?: () => void;
  isGenerating?: boolean;
  classes?: any[];
  classFeeStructures?: ClassFeeStructureItem[];
  feeSchedules?: FeePaymentScheduleItem[];
  students?: any[];
  handleCloseGenerateModal: () => void;
}

export const GenerateInvoicesModal: React.FC<GenerateInvoicesModalProps> = ({
  showGenerateModal,
  generateClassId = "",
  setGenerateClassId,
  generateDueDate = "",
  setGenerateDueDate,
  generateMonth = new Date().toISOString().slice(0, 7),
  setGenerateMonth,
  generateScheduleId = "",
  setGenerateScheduleId,
  generateInstallmentName = "",
  setGenerateInstallmentName,
  generateMultiplier = 1,
  setGenerateMultiplier,
  generateSessionStart = "april",
  setGenerateSessionStart,
  generateFormat = "monthly",
  setGenerateFormat,
  generateIsEntireYear = false,
  setGenerateIsEntireYear,
  handleGenerateInvoices,
  isGenerating = false,
  classes = [],
  classFeeStructures = [],
  feeSchedules = [],
  students = [],
  handleCloseGenerateModal,
}) => {
  if (!showGenerateModal) return null;

  const isEntireYear = Boolean(generateIsEntireYear || generateScheduleId === "entire_year");
  const isAllClasses = !generateClassId || generateClassId === "all";

  // Selected schedule item if any (for single installment mode)
  const selectedScheduleItem = feeSchedules.find((s) => String(s.id) === String(generateScheduleId));

  const cls = !isAllClasses
    ? classes.find(
        (c) => String(c.classMasterId) === String(generateClassId) || c.name === generateClassId
      )
    : null;
  const targetName = cls ? cls.name || cls.className : isAllClasses ? "All Classes" : generateClassId;

  // Term Fee & Covered Months Detection from Selected Installment
  const notesStr = (selectedScheduleItem?.notes || "").toLowerCase();
  const instNameStr = (selectedScheduleItem?.monthPayable || "").toLowerCase();

  const isTerm2Applicable = Boolean(
    /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(notesStr) ||
    /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(instNameStr)
  );

  const isTerm1Applicable = Boolean(
    !isTerm2Applicable && (
      /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(notesStr) ||
      /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(instNameStr) ||
      /(^|[^\w])i\s*term\b/i.test(notesStr) ||
      /(^|[^\w])i\s*term\b/i.test(instNameStr)
    )
  );

  const coveredMonthCodes = selectedScheduleItem?.feeForMonths
    ? selectedScheduleItem.feeForMonths.split(",").map((m) => m.trim().padStart(2, "0"))
    : [];

  // Fee calculation with multiplier
  const multiplier = Number(
    selectedScheduleItem?.monthMultiplier || generateMultiplier || (selectedScheduleItem?.installmentFormat === "quarterly" ? 3 : 1)
  );

  // Filter class fee items matching schedule covered months and term fee rules
  const relevantStructures = (
    isAllClasses
      ? classFeeStructures
      : classFeeStructures.filter(
          (s) =>
            String((s as any).classId || (s as any).class_id) === String(generateClassId) ||
            (s.className && targetName && s.className.toLowerCase() === targetName.toLowerCase())
        )
  ).filter((s) => {
    if (!selectedScheduleItem) return true;

    const feeNameLower = (s.feeName || (s as any).fee_name || "").toLowerCase();
    const feeTypeLower = (s.feeType || (s as any).fee_type || "").toLowerCase();
    const freqLower = (s.frequency || "").toLowerCase();
    const structMonth = (s.month || "").trim().padStart(2, "0");

    const isTerm2Struct =
      /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(feeNameLower) ||
      (feeTypeLower === "term" && structMonth === "02");

    const isTerm1Struct =
      !isTerm2Struct && (
        /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(feeNameLower) ||
        /(^|[^\w])i\s*term\b/i.test(feeNameLower) ||
        (feeTypeLower === "term" && structMonth === "01")
      );

    const isGenericTermStruct =
      feeTypeLower === "term" ||
      freqLower === "term" ||
      feeNameLower.includes("term fee") ||
      feeNameLower.includes("term exam");

    if (isTerm1Struct) return isTerm1Applicable;
    if (isTerm2Struct) return isTerm2Applicable;
    if (isGenericTermStruct) return isTerm1Applicable || isTerm2Applicable;

    // Monthly recurring fees
    if (!s.month || s.month === "all" || s.month === "every_month" || freqLower === "monthly") {
      return true;
    }

    // Specific month matching schedule covered months
    if (coveredMonthCodes.length > 0 && coveredMonthCodes.includes(structMonth)) {
      return true;
    }

    return false;
  });

  const totalFeePerStudent = relevantStructures.reduce((sum, item) => {
    let itemAmt = Number(item.amount || 0);
    if (item.frequency === "monthly" && multiplier > 1) {
      itemAmt = itemAmt * multiplier;
    }
    return sum + itemAmt;
  }, 0);

  const matchedStudents = isAllClasses
    ? students
    : students.filter(
        (st) =>
          String(st.classMasterId) === String(generateClassId) ||
          (st.class && targetName && String(st.class).toLowerCase() === String(targetName).toLowerCase())
      );

  const totalBatchEstimatedBilling = isAllClasses
    ? students.length * 3000 * multiplier // approximate representative average if all classes
    : totalFeePerStudent * (matchedStudents.length || 0);

  // Full-year schedules list for Entire Year mode preview
  const entireYearSchedules = React.useMemo(() => {
    const activeSession = generateSessionStart || "april";
    const activeFormat = generateFormat || "monthly";
    const matched = feeSchedules.filter(
      (s) => s.sessionStart === activeSession && s.installmentFormat === activeFormat
    );
    if (matched.length > 0) return matched;

    // Fallback if no schedules configured yet
    if (activeSession === "april") {
      if (activeFormat === "quarterly") {
        return [
          { id: "def_q1", orderSeq: 1, monthPayable: "Q1", dueDay: 10, feeForMonths: "04,05,06", monthMultiplier: 3, notes: "April - June" },
          { id: "def_q2", orderSeq: 2, monthPayable: "Q2", dueDay: 10, feeForMonths: "07,08,09", monthMultiplier: 3, notes: "July - September" },
          { id: "def_q3", orderSeq: 3, monthPayable: "Q3", dueDay: 10, feeForMonths: "10,11,12", monthMultiplier: 3, notes: "October - December" },
          { id: "def_q4", orderSeq: 4, monthPayable: "Q4", dueDay: 10, feeForMonths: "01,02,03", monthMultiplier: 3, notes: "January - March" },
        ] as any[];
      }
      return [
        { id: "def_1", orderSeq: 1, monthPayable: "April", dueDay: 10, feeForMonths: "06", monthMultiplier: 1, notes: "June + I Term" },
        { id: "def_2", orderSeq: 2, monthPayable: "June", dueDay: 10, feeForMonths: "07", monthMultiplier: 1, notes: "July" },
        { id: "def_3", orderSeq: 3, monthPayable: "July", dueDay: 10, feeForMonths: "08", monthMultiplier: 1, notes: "August" },
        { id: "def_4", orderSeq: 4, monthPayable: "August", dueDay: 10, feeForMonths: "09", monthMultiplier: 1, notes: "September" },
        { id: "def_5", orderSeq: 5, monthPayable: "September", dueDay: 10, feeForMonths: "10", monthMultiplier: 1, notes: "October + II Term" },
        { id: "def_6", orderSeq: 6, monthPayable: "October", dueDay: 10, feeForMonths: "11", monthMultiplier: 1, notes: "November" },
        { id: "def_7", orderSeq: 7, monthPayable: "November", dueDay: 10, feeForMonths: "12", monthMultiplier: 1, notes: "December" },
        { id: "def_8", orderSeq: 8, monthPayable: "December", dueDay: 10, feeForMonths: "01", monthMultiplier: 1, notes: "January" },
        { id: "def_9", orderSeq: 9, monthPayable: "January", dueDay: 10, feeForMonths: "02,03", monthMultiplier: 2, notes: "February + March" },
        { id: "def_10", orderSeq: 10, monthPayable: "February", dueDay: 10, feeForMonths: "04", monthMultiplier: 1, notes: "April" },
        { id: "def_11", orderSeq: 11, monthPayable: "March", dueDay: 10, feeForMonths: "05", monthMultiplier: 1, notes: "May" },
      ] as any[];
    } else {
      return [
        { id: "def_j1", orderSeq: 1, monthPayable: "July", dueDay: 10, feeForMonths: "07", monthMultiplier: 1, notes: "July + I Term" },
        { id: "def_j2", orderSeq: 2, monthPayable: "August", dueDay: 10, feeForMonths: "08", monthMultiplier: 1, notes: "August" },
        { id: "def_j3", orderSeq: 3, monthPayable: "September", dueDay: 10, feeForMonths: "09", monthMultiplier: 1, notes: "September" },
        { id: "def_j4", orderSeq: 4, monthPayable: "October", dueDay: 10, feeForMonths: "10", monthMultiplier: 1, notes: "October" },
        { id: "def_j5", orderSeq: 5, monthPayable: "November", dueDay: 10, feeForMonths: "11", monthMultiplier: 1, notes: "November" },
        { id: "def_j6", orderSeq: 6, monthPayable: "December", dueDay: 10, feeForMonths: "12", monthMultiplier: 1, notes: "December + II Term" },
        { id: "def_j7", orderSeq: 7, monthPayable: "January", dueDay: 10, feeForMonths: "01", monthMultiplier: 1, notes: "January" },
        { id: "def_j8", orderSeq: 8, monthPayable: "February", dueDay: 10, feeForMonths: "02", monthMultiplier: 1, notes: "February" },
        { id: "def_j9", orderSeq: 9, monthPayable: "March", dueDay: 10, feeForMonths: "03", monthMultiplier: 1, notes: "March" },
        { id: "def_j10", orderSeq: 10, monthPayable: "April", dueDay: 10, feeForMonths: "04", monthMultiplier: 1, notes: "April" },
        { id: "def_j11", orderSeq: 11, monthPayable: "May", dueDay: 10, feeForMonths: "05,06", monthMultiplier: 2, notes: "May + June" },
      ] as any[];
    }
  }, [feeSchedules, generateSessionStart, generateFormat]);

  const entireYearEstimatedBilling = React.useMemo(() => {
    const activeStudentsCount = matchedStudents.length || 0;
    const studentClassStructures = isAllClasses ? classFeeStructures : relevantStructures;
    
    const annualFeePerStudent = studentClassStructures.reduce((sum, item) => {
      const amt = Number(item.amount || 0);
      if (item.frequency === "monthly") {
        return sum + amt * 12;
      }
      return sum + amt;
    }, 0);

    if (isAllClasses) {
      return (annualFeePerStudent || 36000) * (students.length || 1);
    }
    return annualFeePerStudent * activeStudentsCount;
  }, [isAllClasses, matchedStudents.length, classFeeStructures, relevantStructures, students.length]);

  // Auto-set due date when schedule item changes
  const handleSelectScheduleItem = (schedId: string) => {
    if (schedId === "entire_year") {
      if (setGenerateIsEntireYear) setGenerateIsEntireYear(true);
      if (setGenerateScheduleId) setGenerateScheduleId("entire_year");
      return;
    }

    if (setGenerateIsEntireYear) setGenerateIsEntireYear(false);
    if (setGenerateScheduleId) setGenerateScheduleId(schedId);

    const sched = feeSchedules.find((s) => String(s.id) === String(schedId));
    if (sched) {
      if (setGenerateInstallmentName) setGenerateInstallmentName(sched.monthPayable);
      if (setGenerateSessionStart) setGenerateSessionStart(sched.sessionStart);
      const mult = sched.monthMultiplier || (sched.installmentFormat === "quarterly" ? 3 : 1);
      if (setGenerateMultiplier) setGenerateMultiplier(mult);

      // Auto-set billing month from first month code
      if (sched.feeForMonths) {
        const firstMonthCode = sched.feeForMonths.split(",")[0].trim();
        const curYear = new Date().getFullYear();
        if (setGenerateMonth) setGenerateMonth(`${curYear}-${firstMonthCode}`);
      }

      // Auto-set due date
      const dueDay = sched.dueDay || 10;
      const today = new Date();
      const dueDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        dueDay
      ).padStart(2, "0")}`;
      if (setGenerateDueDate) setGenerateDueDate(dueDateStr);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleCloseGenerateModal}
    >
      <div
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-scale-in text-left dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md mb-1">
              <Sparkles className="h-3 w-3 text-yellow-300" />
              Fee Generator V2
            </div>
            <h3 className="font-bold text-lg text-white">
              {isEntireYear ? "Generate Entire Academic Year Invoices" : "Generate Fee Invoices"}
            </h3>
          </div>
          <button
            onClick={handleCloseGenerateModal}
            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Mode Switcher Tabs: Single Installment vs Entire Academic Year */}
          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                if (setGenerateIsEntireYear) setGenerateIsEntireYear(false);
                if (generateScheduleId === "entire_year" && setGenerateScheduleId) setGenerateScheduleId("");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                !isEntireYear
                  ? "bg-white text-indigo-700 shadow-xs dark:bg-gray-900 dark:text-indigo-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Single Installment</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (setGenerateIsEntireYear) setGenerateIsEntireYear(true);
                if (setGenerateScheduleId) setGenerateScheduleId("entire_year");
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                isEntireYear
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span>Entire Year (All Installments)</span>
            </button>
          </div>

          {/* Target Class Selection */}
          <div className="space-y-1.5 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
            <label className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 uppercase tracking-wide">
              <GraduationCap className="h-4 w-4 text-indigo-600" /> Target Grade / Class Level *
            </label>

            <select
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
              value={generateClassId}
              onChange={(e) => setGenerateClassId && setGenerateClassId(e.target.value)}
            >
              <option value="all">⚡ All Active Classes (School-Wide Mass Billing)</option>
              {classes.length > 0
                ? classes.map((c: any) => (
                    <option key={c.id} value={c.classMasterId}>
                      {c.name || c.className}
                    </option>
                  ))
                : [
                    { id: "1", name: "LKG" },
                    { id: "2", name: "UKG" },
                    { id: "3", name: "Class 1" },
                    { id: "4", name: "Class 2" },
                    { id: "5", name: "Class 3" },
                    { id: "6", name: "Class 4" },
                    { id: "7", name: "Class 5" },
                    { id: "8", name: "Class 6" },
                    { id: "9", name: "Class 7" },
                    { id: "10", name: "Class 8" },
                    { id: "11", name: "Class 9" },
                    { id: "12", name: "Class 10" },
                  ].map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
            </select>
            <p className="text-[10px] text-gray-500">
              Select a specific class level or &quot;All Active Classes&quot; to bill every student simultaneously.
            </p>
          </div>

          {/* Entire Academic Year Mode Content */}
          {isEntireYear ? (
            <div className="space-y-3.5">
              {/* Session Start & Billing Format Controls */}
              <div className="grid grid-cols-2 gap-3 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="space-y-1">
                  <label className="font-bold text-indigo-900 dark:text-indigo-200 block text-[11px] uppercase tracking-wide">
                    Academic Cycle
                  </label>
                  <select
                    className="w-full h-9 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 px-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={generateSessionStart}
                    onChange={(e) => setGenerateSessionStart && setGenerateSessionStart(e.target.value)}
                  >
                    <option value="april">April to March (CBSE / ICSE)</option>
                    <option value="july">July to June (State / Intl)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-indigo-900 dark:text-indigo-200 block text-[11px] uppercase tracking-wide">
                    Installment Format
                  </label>
                  <select
                    className="w-full h-9 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 px-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={generateFormat}
                    onChange={(e) => setGenerateFormat && setGenerateFormat(e.target.value)}
                  >
                    <option value="monthly">Monthly Plan (11 Installments)</option>
                    <option value="quarterly">Quarterly Plan (4 Quarters)</option>
                  </select>
                </div>
              </div>

              {/* Visual Schedule Preview: List of all installments to be generated */}
              <div className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 bg-white dark:bg-gray-800/60">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Full-Year Installments ({entireYearSchedules.length} Cycles)
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Auto-Due Dates
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100 dark:divide-gray-800">
                  {entireYearSchedules.map((s, idx) => {
                    const notesLower = (s.notes || "").toLowerCase();
                    const nameLower = (s.monthPayable || "").toLowerCase();
                    const isT2 =
                      /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(notesLower) ||
                      /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(nameLower);
                    const isT1 =
                      !isT2 && (
                        /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(notesLower) ||
                        /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(nameLower) ||
                        /(^|[^\w])i\s*term\b/i.test(notesLower) ||
                        /(^|[^\w])i\s*term\b/i.test(nameLower)
                      );
                    const mult = Number(s.monthMultiplier || (s.installmentFormat === "quarterly" ? 3 : 1));

                    return (
                      <div
                        key={s.id || idx}
                        className="pt-1.5 flex items-center justify-between text-[11px] text-gray-700 dark:text-gray-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 h-5 w-5 rounded-full flex items-center justify-center font-bold">
                            {s.orderSeq || idx + 1}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-gray-100">
                            {s.monthPayable}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            (Due Day {s.dueDay || 10})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isT1 && (
                            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
                              <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                              Term 1
                            </span>
                          )}
                          {isT2 && (
                            <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <Star className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" />
                              Term 2
                            </span>
                          )}
                          {mult > 1 && (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">
                              {mult}x Rate
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {formatCoveredMonths(s.feeForMonths)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mass Annual Generation Summary Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-xl dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-indigo-950/30 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white text-xs flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                    Target: {matchedStudents.length} Students {isAllClasses ? "(All Grades)" : `(${targetName})`} × {entireYearSchedules.length} Installments
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    Est. Annual Invoices: ~{matchedStudents.length * entireYearSchedules.length} Invoices (~₹{entireYearEstimatedBilling.toLocaleString("en-IN")})
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    ✓ Existing invoices for any installment are safely preserved to prevent double-billing.
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>
          ) : (
            /* Single Installment Mode Content */
            <div className="space-y-4">
              {/* Payment Schedule Selector */}
              <div className="space-y-1.5 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5 uppercase tracking-wide">
                    <Calendar className="h-4 w-4 text-indigo-600" /> Linked Payment Schedule Installment
                  </label>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                    School-Wise V2
                  </span>
                </div>

                <select
                  className="w-full h-10 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-800 px-3 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={generateScheduleId}
                  onChange={(e) => handleSelectScheduleItem(e.target.value)}
                >
                  <option value="">-- Choose Payment Schedule Installment --</option>
                  <option value="entire_year" className="font-bold text-indigo-600">
                    🌟 Entire Academic Year (Generate All 11 Installments in 1-Click)
                  </option>
                  {feeSchedules.map((s) => {
                    const notesLower = (s.notes || "").toLowerCase();
                    const nameLower = (s.monthPayable || "").toLowerCase();
                    const isT2 =
                      /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(notesLower) ||
                      /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(nameLower);
                    const isT1 =
                      !isT2 && (
                        /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(notesLower) ||
                        /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(nameLower) ||
                        /(^|[^\w])i\s*term\b/i.test(notesLower) ||
                        /(^|[^\w])i\s*term\b/i.test(nameLower)
                      );
                    const termBadge = isT1 ? " | ★ Term 1 Fee" : isT2 ? " | ★ Term 2 Fee" : "";
                    const multBadge =
                      s.monthMultiplier && s.monthMultiplier > 1 ? ` | ⚡ ${s.monthMultiplier}x Double Fee` : "";

                    return (
                      <option key={s.id} value={s.id}>
                        {s.orderSeq ? `#${s.orderSeq} ` : ""}{s.monthPayable} (Due Day {s.dueDay}) ➔ Covers: {formatCoveredMonths(s.feeForMonths)}{termBadge}{multBadge}
                      </option>
                    );
                  })}
                </select>

                {selectedScheduleItem && (
                  <div className="mt-2.5 p-3 rounded-lg bg-indigo-100/60 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                      <span className="font-bold text-indigo-900 dark:text-indigo-100">
                        {selectedScheduleItem.monthPayable}
                      </span>
                      <span className="rounded bg-indigo-200/80 dark:bg-indigo-900 px-2 py-0.5 font-bold text-indigo-800 dark:text-indigo-200 text-[10px]">
                        Due Day: {selectedScheduleItem.dueDay || 10}th of month
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <span className="font-semibold text-gray-500 dark:text-gray-400">Months Covered:</span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-300">
                        {formatCoveredMonthsWithCodes(selectedScheduleItem.feeForMonths)}
                      </span>
                    </div>

                    {/* Term Fee Status */}
                    {isTerm1Applicable && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800/60 p-2 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        <span>★ Term 1 Fee Applicable: Term 1 fee components will be billed with this installment</span>
                      </div>
                    )}
                    {isTerm2Applicable && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/60 p-2 rounded-md">
                        <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500 shrink-0" />
                        <span>★ Term 2 Fee Applicable: Term 2 fee components will be billed with this installment</span>
                      </div>
                    )}
                    {!isTerm1Applicable && !isTerm2Applicable && (
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                        Regular installment: Standard monthly tuition applies (no term fee attached).
                      </div>
                    )}

                    {multiplier > 1 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-300 dark:border-purple-800/60 p-2 rounded-md">
                        <Zap className="h-3.5 w-3.5 fill-purple-500 text-purple-500 shrink-0" />
                        <span>⚡ {multiplier}x Multiplier Active (Double month tuition fee)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Month & Due Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Billing Month Label</label>
                  <select
                    className="w-full h-9 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={generateMonth}
                    onChange={(e) => setGenerateMonth && setGenerateMonth(e.target.value)}
                  >
                    {MONTH_GRID_ITEMS.map((m) => {
                      const yr = new Date().getFullYear();
                      const fullVal = `${yr}-${m.value}`;
                      return (
                        <option key={m.value} value={fullVal}>
                          {m.fullLabel} {yr} {m.badge ? `(${m.badge})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 dark:text-gray-300">Invoice Due Date *</label>
                  <Input
                    type="date"
                    required
                    className="h-9 text-xs font-bold"
                    value={generateDueDate}
                    onChange={(e) => setGenerateDueDate && setGenerateDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Fee Components Preview */}
              <div className="space-y-2 border border-gray-200 dark:border-gray-800 rounded-xl p-3.5 bg-white dark:bg-gray-800/60">
                <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-indigo-500" />
                    Fee Breakdown {!isAllClasses && `for ${targetName}`}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm">
                    {!isAllClasses ? `₹${totalFeePerStudent.toLocaleString("en-IN")} / student` : "Class-wise"}
                  </span>
                </div>

                {!isAllClasses && relevantStructures.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {relevantStructures.map((item) => {
                      let effectiveAmount = Number(item.amount || 0);
                      if (item.frequency === "monthly" && multiplier > 1) {
                        effectiveAmount = effectiveAmount * multiplier;
                      }
                      return (
                        <div key={item.id} className="flex items-center justify-between py-0.5 text-gray-600 dark:text-gray-300">
                          <span>
                            • {item.feeName}{" "}
                            <span className="text-[10px] text-gray-400">
                              ({item.feeType}{multiplier > 1 && item.frequency === "monthly" ? ` x ${multiplier} mo` : ""})
                            </span>
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{effectiveAmount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : isAllClasses ? (
                  <p className="text-gray-500 dark:text-gray-400 py-1">
                    Invoices will be auto-calculated for each enrolled student using their grade&apos;s configured fee structure.
                  </p>
                ) : (
                  <div className="text-amber-600 dark:text-amber-400 font-semibold py-1 flex items-center gap-1 text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    No fee components configured for this class grade yet.
                  </div>
                )}
              </div>

              {/* Summary Estimation Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white text-xs">
                    Target: {matchedStudents.length} Students {isAllClasses ? "(All Grades)" : `(${targetName})`}
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                    Estimated Billing: ~₹{totalBatchEstimatedBilling.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex items-center justify-between">
          <Button variant="outline" onClick={handleCloseGenerateModal} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
            className={`font-bold px-5 text-white shadow transition-all ${
              isEntireYear
                ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isGenerating ? (
              isEntireYear ? "Generating Entire Year Invoices..." : "Generating Invoices..."
            ) : isEntireYear ? (
              `Generate Entire Year (${entireYearSchedules.length} Installments)`
            ) : (
              "Generate Invoices Now"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
