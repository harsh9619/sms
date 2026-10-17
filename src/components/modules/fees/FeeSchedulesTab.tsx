import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  RefreshCw,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  DollarSign,
  ChevronRight,
  Sliders,
  FileText,
  ShieldCheck,
  Star,
  Info,
} from "lucide-react";
import type { FeePaymentScheduleItem, SchoolFeeSettings } from "./types";

interface FeeSchedulesTabProps {
  schedules: FeePaymentScheduleItem[];
  schoolSettings?: SchoolFeeSettings | null;
  onGenerateDefaults: (sessionStart: "april" | "july", format: "monthly" | "quarterly") => void;
  onSaveScheduleItem: (data: any) => void;
  onDeleteScheduleItem: (id: string) => void;
  onUpdateSchoolSettings?: (settings: { feeSessionStart?: string; feeFrequency?: string }) => void;
  onOpenGenerateInvoices?: (preset?: {
    scheduleId?: string;
    installmentName?: string;
    month?: string;
    multiplier?: number;
    sessionStart?: string;
    format?: string;
    isEntireYear?: boolean;
  }) => void;
  isGenerating?: boolean;
}

import { MONTH_NAMES_MAP } from "../../../constants/fee";

export const FeeSchedulesTab: React.FC<FeeSchedulesTabProps> = ({
  schedules = [],
  schoolSettings,
  onGenerateDefaults,
  onSaveScheduleItem,
  onDeleteScheduleItem,
  onUpdateSchoolSettings,
  onOpenGenerateInvoices,
  isGenerating = false,
}) => {
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FeePaymentScheduleItem | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // School Primary Cycle & Billing Frequency detection
  const primarySession: "april" | "july" =
    schoolSettings?.feeSessionStart?.toLowerCase() === "july" ? "july" : "april";
  const primaryFrequency: "monthly" | "quarterly" =
    schoolSettings?.feeFrequency?.toLowerCase() === "quarterly" ? "quarterly" : "monthly";
  const alternateSession: "april" | "july" = primarySession === "april" ? "july" : "april";

  // Generator preset view toggle: Defaults directly to the School's configured Primary Cycle
  const [generatorCycleView, setGeneratorCycleView] = useState<"primary" | "alternate" | "all">("primary");

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    scheduleName: string;
    sessionStart: string;
    installmentFormat: string;
    orderSeq: number;
    monthPayable: string;
    feeForMonths: string;
    monthMultiplier: number;
    dueDay: number;
    extensionDays: number;
    lateFeeDay: number;
    lateFeeAmount: number;
    notes: string;
    isActive: boolean;
  }>({
    id: "",
    scheduleName: "",
    sessionStart: primarySession,
    installmentFormat: primaryFrequency,
    orderSeq: 1,
    monthPayable: "",
    feeForMonths: "",
    monthMultiplier: primaryFrequency === "quarterly" ? 3 : 1,
    dueDay: 10,
    extensionDays: 5,
    lateFeeDay: 15,
    lateFeeAmount: primaryFrequency === "quarterly" ? 100 : 50,
    notes: "",
    isActive: true,
  });

  const [settingsFormData, setSettingsFormData] = useState({
    feeSessionStart: schoolSettings?.feeSessionStart || "april",
    feeFrequency: schoolSettings?.feeFrequency || "monthly",
  });

  // Schedules sorted by chronological order sequence
  const filteredSchedules = [...schedules].sort((a, b) => (a.orderSeq || 0) - (b.orderSeq || 0));

  const aprilCount = schedules.filter((s) => s.sessionStart === "april").length;
  const julyCount = schedules.filter((s) => s.sessionStart === "july").length;
  const monthlyCount = schedules.filter((s) => s.installmentFormat === "monthly").length;
  const quarterlyCount = schedules.filter((s) => s.installmentFormat === "quarterly").length;

  const handleOpenAdd = (sessionStart: "april" | "july" = primarySession, format: "monthly" | "quarterly" = primaryFrequency) => {
    setEditingItem(null);
    setFormData({
      id: "",
      scheduleName: `${sessionStart === "april" ? "April" : "July"}-Start ${format === "monthly" ? "Monthly" : "Quarterly"} Plan`,
      sessionStart,
      installmentFormat: format,
      orderSeq: filteredSchedules.length + 1,
      monthPayable: "",
      feeForMonths: "",
      monthMultiplier: format === "quarterly" ? 3 : 1,
      dueDay: 10,
      extensionDays: 5,
      lateFeeDay: 15,
      lateFeeAmount: format === "quarterly" ? 100 : 50,
      notes: "",
      isActive: true,
    });
    setShowEditModal(true);
  };

  const handleOpenEdit = (item: FeePaymentScheduleItem) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      scheduleName: item.scheduleName || "",
      sessionStart: item.sessionStart || "april",
      installmentFormat: item.installmentFormat || "monthly",
      orderSeq: item.orderSeq || 1,
      monthPayable: item.monthPayable || "",
      feeForMonths: item.feeForMonths || "",
      monthMultiplier: item.monthMultiplier || (item.installmentFormat === "quarterly" ? 3 : 1),
      dueDay: item.dueDay || 10,
      extensionDays: item.extensionDays || 5,
      lateFeeDay: item.lateFeeDay || 15,
      lateFeeAmount: item.lateFeeAmount || 0,
      notes: item.notes || "",
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setShowEditModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveScheduleItem(formData);
    setShowEditModal(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSchoolSettings) {
      onUpdateSchoolSettings(settingsFormData);
    }
    setShowSettingsModal(false);
  };

  const allPresets = [
    {
      id: "april-monthly",
      session: "april" as const,
      format: "monthly" as const,
      title: "April-Start Monthly Plan (11 Months)",
      cycleLabel: "April to March (11 Installments)",
      duration: "11 Installments",
      description: "11 installments as per school mode of payment (May vacation skipped). Advance cycle: April pays June+Term 1, January pays Feb+March (2x), etc.",
      multiplier: "Standard Monthly Fee (Jan 2x)",
      lateFee: "5-day grace (up to 15th) • ₹100 from 16th",
      coverage: [
        { payable: "April", covers: "June + I Term", mult: "1x" },
        { payable: "June", covers: "July", mult: "1x" },
        { payable: "July", covers: "August", mult: "1x" },
        { payable: "August", covers: "September", mult: "1x" },
        { payable: "September", covers: "October + II Term", mult: "1x" },
        { payable: "October", covers: "November", mult: "1x" },
        { payable: "November", covers: "December", mult: "1x" },
        { payable: "December", covers: "January", mult: "1x" },
        { payable: "January", covers: "February + March", mult: "2x" },
        { payable: "February", covers: "April", mult: "1x" },
        { payable: "March", covers: "May", mult: "1x" },
      ],
      months: ["Apr", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
    },
    {
      id: "april-quarterly",
      session: "april" as const,
      format: "quarterly" as const,
      title: "April-Start Quarterly Plan",
      cycleLabel: "April to March",
      duration: "4 Quarters",
      description: "4 quarters: Q1 (Apr-Jun), Q2 (Jul-Sep), Q3 (Oct-Dec), Q4 (Jan-Mar). 3x monthly fee multiplier.",
      multiplier: "3x Monthly Fee Multiplier",
      lateFee: "5-day grace (up to 15th) • ₹100 from 16th",
      quarters: [
        { name: "Q1", range: "Apr–Jun" },
        { name: "Q2", range: "Jul–Sep" },
        { name: "Q3", range: "Oct–Dec" },
        { name: "Q4", range: "Jan–Mar" },
      ],
    },
    {
      id: "july-monthly",
      session: "july" as const,
      format: "monthly" as const,
      title: "July-Start Monthly Plan (11 Months)",
      cycleLabel: "July to June (11 Installments)",
      duration: "11 Installments",
      description: "11 installments as per July school start. Advance cycle structure (March covers April+May 2x).",
      multiplier: "Standard Monthly Fee (Mar 2x)",
      lateFee: "5-day grace (up to 15th) • ₹100 from 16th",
      coverage: [
        { payable: "July", covers: "August + I Term", mult: "1x" },
        { payable: "August", covers: "September", mult: "1x" },
        { payable: "September", covers: "October", mult: "1x" },
        { payable: "October", covers: "November", mult: "1x" },
        { payable: "November", covers: "December + II Term", mult: "1x" },
        { payable: "December", covers: "January", mult: "1x" },
        { payable: "January", covers: "February", mult: "1x" },
        { payable: "February", covers: "March", mult: "1x" },
        { payable: "March", covers: "April + May", mult: "2x" },
        { payable: "April", covers: "June", mult: "1x" },
        { payable: "May", covers: "July", mult: "1x" },
      ],
      months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    },
    {
      id: "july-quarterly",
      session: "july" as const,
      format: "quarterly" as const,
      title: "July-Start Quarterly Plan",
      cycleLabel: "July to June",
      duration: "4 Quarters",
      description: "4 quarters: Q1 (Jul-Sep), Q2 (Oct-Dec), Q3 (Jan-Mar), Q4 (Apr-Jun). 3x monthly fee multiplier.",
      multiplier: "3x Monthly Fee Multiplier",
      lateFee: "5-day grace (up to 15th) • ₹100 from 16th",
      quarters: [
        { name: "Q1", range: "Jul–Sep" },
        { name: "Q2", range: "Oct–Dec" },
        { name: "Q3", range: "Jan–Mar" },
        { name: "Q4", range: "Apr–Jun" },
      ],
    },
  ];

  const displayedPresets = allPresets.filter((p) => {
    if (generatorCycleView === "primary") return p.session === primarySession;
    if (generatorCycleView === "alternate") return p.session === alternateSession;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top School Policy Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 sm:p-6 text-white shadow-xl">
        <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 h-48 w-48 rounded-full bg-indigo-900/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-yellow-300" />
              <span>Payment Schedules Master V2.0</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              School Payment Schedules & Installment Cycles
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm text-blue-100 hidden sm:block">
              Configure school-wise fee payment schedules with built-in provisions for{" "}
              <strong className="text-white underline decoration-yellow-400 decoration-2">
                April-start (CBSE/ICSE)
              </strong>{" "}
              and{" "}
              <strong className="text-white underline decoration-emerald-400 decoration-2">
                July-start (State/Intl)
              </strong>{" "}
              academic years in Monthly (11 installments as per school start) or Quarterly (4 installments) frequencies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setSettingsFormData({
                  feeSessionStart: schoolSettings?.feeSessionStart || "april",
                  feeFrequency: schoolSettings?.feeFrequency || "monthly",
                });
                setShowSettingsModal(true);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/15 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/25 hover:shadow-lg border border-white/20 active:scale-95"
            >
              <Sliders className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>School Policy</span>
            </button>

            <button
              onClick={() => handleOpenAdd(primarySession, primaryFrequency)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-blue-50 hover:shadow-lg active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Add Installment</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 pt-4 text-xs">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-blue-200">School Primary Cycle</div>
            <div className="text-base font-bold text-white capitalize flex items-center gap-1.5 mt-0.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              {schoolSettings?.feeSessionStart || "April"} Start ({schoolSettings?.feeFrequency || "Monthly"})
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-blue-200">Total Configured Plans</div>
            <div className="text-base font-bold text-white mt-0.5">
              {schedules.length} Installments
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-blue-200">April-Start Cycles</div>
            <div className="text-base font-bold text-white mt-0.5">
              {aprilCount} Installments
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <div className="text-blue-200">July-Start Cycles</div>
            <div className="text-base font-bold text-white mt-0.5">
              {julyCount} Installments
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Schedule Generator Presets Card (Adaptive to School Primary Cycle) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                1-Click Standard Schedule Generators
              </h3>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                School Primary Cycle Aligned
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Instantly generate standardized installment schedules tailored to your school's configured academic calendar and billing policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isGenerating && (
              <div className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Generating Schedule...
              </div>
            )}

            {/* Cycle Selector Tabs */}
            <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setGeneratorCycleView("primary")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${generatorCycleView === "primary"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  }`}
              >
                <Star className="h-3.5 w-3.5 fill-current text-yellow-300" />
                <span>Primary ({primarySession === "april" ? "Apr" : "Jul"})</span>
              </button>

              <button
                type="button"
                onClick={() => setGeneratorCycleView("alternate")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${generatorCycleView === "alternate"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  }`}
              >
                <span>Alternate ({alternateSession === "april" ? "Apr" : "Jul"})</span>
              </button>

              <button
                type="button"
                onClick={() => setGeneratorCycleView("all")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all shrink-0 ${generatorCycleView === "all"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/60 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
                  }`}
              >
                <span>All 4 Presets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Context Notification Banner */}
        {generatorCycleView === "primary" && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-indigo-50/90 via-blue-50/70 to-indigo-50/40 border border-indigo-200/70 p-3.5 text-xs dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-indigo-900/20 dark:border-indigo-800/60 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shrink-0">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <span>School Primary Academic Cycle:</span>
                  <span className="capitalize text-indigo-700 dark:text-indigo-300 font-extrabold underline decoration-indigo-400">
                    {primarySession === "april" ? "April to March (CBSE / ICSE)" : "July to June (State / International)"}
                  </span>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    Active School Policy
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                  Default Billing Frequency: <strong className="capitalize text-gray-900 dark:text-gray-200">{primaryFrequency}</strong> • Standard due date: 10th of cycle start with 5-day grace extension.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSettingsFormData({
                  feeSessionStart: schoolSettings?.feeSessionStart || "april",
                  feeFrequency: schoolSettings?.feeFrequency || "monthly",
                });
                setShowSettingsModal(true);
              }}
              className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs border border-indigo-200 hover:bg-indigo-50 transition active:scale-95 dark:bg-gray-800 dark:text-indigo-300 dark:border-indigo-800 shrink-0"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Change School Policy</span>
            </button>
          </div>
        )}

        {generatorCycleView === "alternate" && (
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs dark:bg-amber-950/30 dark:border-amber-800/60 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-amber-900 dark:text-amber-200">
                Viewing alternative <strong className="capitalize">{alternateSession}-Start</strong> academic schedule presets. This school's primary configured cycle is <strong className="capitalize">{primarySession}-Start</strong>.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGeneratorCycleView("primary")}
              className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-950 dark:text-amber-300 self-start sm:self-center shrink-0 underline decoration-amber-500"
            >
              Return to Primary Cycle ({primarySession === "april" ? "April" : "July"}-Start)
            </button>
          </div>
        )}

        {/* Generator Cards Grid */}
        <div
          className={`grid gap-4 ${generatorCycleView === "all"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2"
            }`}
        >
          {displayedPresets.map((preset) => {
            const isSchoolPrimaryCycle = preset.session === primarySession;
            const isRecommended = preset.session === primarySession && preset.format === primaryFrequency;

            return (
              <div
                key={preset.id}
                className={`group relative flex flex-col justify-between rounded-xl p-4 sm:p-5 transition-all ${isRecommended
                  ? "border-2 border-indigo-500 bg-gradient-to-br from-indigo-50/90 via-blue-50/60 to-purple-50/50 shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-purple-950/30"
                  : isSchoolPrimaryCycle
                    ? "border border-indigo-200 bg-gradient-to-br from-white to-indigo-50/30 hover:border-indigo-400 hover:shadow-md dark:border-indigo-900/50 dark:bg-gray-800/50 dark:hover:border-indigo-700"
                    : "border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-800/30 dark:hover:border-gray-700"
                  }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isRecommended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs tracking-wide uppercase">
                          <Star className="h-3 w-3 fill-white" />
                          Recommended for this School
                        </span>
                      ) : isSchoolPrimaryCycle ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                          <CheckCircle2 className="h-3 w-3" />
                          School Primary Cycle
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          Alternative Cycle
                        </span>
                      )}
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {preset.cycleLabel}
                      </span>
                    </div>
                    <span className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-bold text-gray-800 shadow-2xs border border-gray-200/70 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700 shrink-0">
                      {preset.duration}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="mt-2.5 text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                    {preset.title}
                    {isRecommended && (
                      <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400">
                        (Active Policy Match)
                      </span>
                    )}
                  </h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {preset.description}
                  </p>

                  {/* Mode of Payment (11 Installments as per School Start) */}
                  {(preset as any).coverage ? (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-750 dark:text-gray-300">
                        <span>Mode of Payment (11 Installments):</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">May Skipped (Vacation)</span>
                      </div>
                      <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-0.5">
                        {(preset as any).coverage.map((c: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded-lg bg-white/90 p-1.5 border border-gray-200 shadow-2xs dark:bg-gray-900/90 dark:border-gray-700 text-[10px]"
                          >
                            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                              <span className="font-bold text-gray-900 dark:text-gray-200">
                                {idx + 1}. {c.payable}
                              </span>
                              {c.mult === "2x" && (
                                <span className="rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                  2x Fee
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-medium text-indigo-700 dark:text-indigo-300 truncate mt-0.5" title={c.covers}>
                              → {c.covers}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : preset.months ? (
                    <div className="mt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Monthly Schedule Sequence:
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {preset.months.map((m, idx) => (
                          <span
                            key={m}
                            className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-gray-700 shadow-2xs border border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700"
                          >
                            {idx + 1}. {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {preset.quarters && (
                    <div className="mt-3">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                        Quarterly Multiplier Breakdown:
                      </div>
                      <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {preset.quarters.map((q) => (
                          <div
                            key={q.name}
                            className="rounded-lg bg-white p-1.5 text-center shadow-2xs border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
                          >
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{q.name}</div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400">{q.range}</div>
                            <div className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">3x Fee Rate</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rules & Policies Bar */}
                  <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 border-t border-gray-150 dark:border-gray-800 pt-3 text-[11px]">
                    <div className="rounded bg-white/60 p-1.5 border border-gray-100 dark:bg-gray-900/60 dark:border-gray-800">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Billing Rate</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">{preset.multiplier}</span>
                    </div>
                    <div className="rounded bg-white/60 p-1.5 border border-gray-100 dark:bg-gray-900/60 dark:border-gray-800">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Due Rule</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">31th of Month</span>
                    </div>
                    {/* <div className="rounded bg-white/60 p-1.5 border border-gray-100 dark:bg-gray-900/60 dark:border-gray-800 col-span-2 sm:col-span-1">
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Late Fee / Grace</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{preset.lateFee}</span>
                    </div> */}
                  </div>
                </div>

                {/* 1-Click Action Button */}
                <div className="mt-4 pt-2">
                  <button
                    disabled={isGenerating}
                    onClick={() => onGenerateDefaults(preset.session, preset.format)}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 ${isRecommended
                      ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white hover:shadow-md hover:from-indigo-700 hover:to-purple-700"
                      : isSchoolPrimaryCycle
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
                      }`}
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                    <span>
                      {isRecommended
                        ? `Apply Recommended ${preset.title} (${preset.duration})`
                        : `Apply ${preset.title} (${preset.duration})`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Schedules Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 px-5 py-4 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/40">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-500" />
              <span>Configured Payment Schedules & Due Dates</span>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {schedules.length} {schedules.length === 1 ? "Installment" : "Installments"}
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Active schedule installments used by the invoicing engine for fee generation and automated penalty calculations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            {onOpenGenerateInvoices && (
              <button
                onClick={() => {
                  onOpenGenerateInvoices({
                    isEntireYear: true,
                    sessionStart: primarySession,
                    format: primaryFrequency,
                  });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:from-indigo-700 hover:to-purple-700 transition active:scale-95 shrink-0"
                title="Generate fee invoices for the full academic year schedule"
              >
                <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                <span>Generate Entire Year Invoices</span>
              </button>
            )}

            <button
              onClick={() => handleOpenAdd(primarySession, primaryFrequency)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 text-xs font-semibold shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-700 transition active:scale-95 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom Installment</span>
            </button>
          </div>
        </div>
        {filteredSchedules.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-3 text-base font-semibold text-gray-900 dark:text-gray-100">
              No Payment Schedules Found
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Click one of the 1-click generator buttons above to instantly generate standard April-start or July-start monthly/quarterly schedules.
            </p>
            {/* <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => onGenerateDefaults("april", "monthly")}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700"
              >
                Generate April-Start Monthly Plan
              </button>
            </div> */}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/75 dark:border-gray-800 dark:bg-gray-800/40 text-gray-600 dark:text-gray-300 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 pl-4 pr-2 w-12 text-center"># Seq</th>
                  <th className="py-3.5 px-3">Installment / Period</th>
                  <th className="py-3.5 px-3">Session Cycle</th>
                  <th className="py-3.5 px-3">Billing Mode</th>
                  <th className="py-3.5 px-3">Months Covered & Term Fee</th>
                  <th className="py-3.5 px-3">Due Day</th>
                  <th className="py-3.5 px-3">Grace & Late Fee</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {filteredSchedules.map((item, idx) => {
                  const isApril = item.sessionStart === "april";
                  const isQuarterly = item.installmentFormat === "quarterly";

                  return (
                    <tr
                      key={item.id || idx}
                      className="transition-colors hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 group"
                    >
                      {/* Seq Number */}
                      <td className="py-3.5 pl-4 pr-2 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {item.orderSeq || idx + 1}
                        </span>
                      </td>

                      {/* Name / Period */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {item.monthPayable}
                        </div>
                        {item.scheduleName && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {item.scheduleName}
                          </div>
                        )}
                        {item.notes && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5 line-clamp-1 italic">
                            {item.notes}
                          </div>
                        )}
                      </td>

                      {/* Session Cycle */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold text-[11px] ${isApril
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isApril ? "bg-blue-600" : "bg-emerald-600"
                              }`}
                          />
                          {isApril ? "April Start (Apr-Mar)" : "July Start (Jul-Jun)"}
                        </span>
                      </td>

                      {/* Billing Mode */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium text-[11px] ${isQuarterly
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-bold"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            }`}
                        >
                          {isQuarterly ? "Quarterly (3x)" : "Monthly (1x)"}
                        </span>
                      </td>

                      {/* Months Covered & Term Fee */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1.5">
                          {/* Covered Months Badges */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.feeForMonths ? (
                              item.feeForMonths.split(",").map((m, mIdx) => {
                                const code = m.trim().padStart(2, "0");
                                const monthName = MONTH_NAMES_MAP[code] || `Month ${code}`;
                                return (
                                  <span
                                    key={mIdx}
                                    className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 font-medium text-[11px] text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                                  >
                                    <span className="font-semibold">{monthName}</span>
                                    <span className="text-[9px] font-mono opacity-70">({code})</span>
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-gray-400 italic text-[11px]">Regular Month</span>
                            )}
                          </div>

                          {/* Term Fee & Multiplier Indicators */}
                          <div className="flex flex-wrap items-center gap-1">
                            {(() => {
                              const notesLower = (item.notes || "").toLowerCase();
                              const nameLower = (item.monthPayable || "").toLowerCase();
                              const isTerm2 =
                                /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(notesLower) ||
                                /\b(term\s*2|term-2|ii\s*term|2nd\s*term|second\s*term)\b/i.test(nameLower);
                              const isTerm1 =
                                !isTerm2 && (
                                  /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(notesLower) ||
                                  /\b(term\s*1|term-1|1st\s*term|first\s*term)\b/i.test(nameLower) ||
                                  /(^|[^\w])i\s*term\b/i.test(notesLower) ||
                                  /(^|[^\w])i\s*term\b/i.test(nameLower)
                                );
                              const mult = Number(item.monthMultiplier || (item.feeForMonths?.includes(",") ? 2 : 1));

                              return (
                                <>
                                  {isTerm1 && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-300 dark:bg-amber-950/60 dark:border-amber-800 px-2 py-0.5 font-bold text-[10px] text-amber-700 dark:text-amber-300">
                                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                      ★ Term 1 Fee Applicable
                                    </span>
                                  )}
                                  {isTerm2 && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-800 px-2 py-0.5 font-bold text-[10px] text-emerald-700 dark:text-emerald-300">
                                      <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                                      ★ Term 2 Fee Applicable
                                    </span>
                                  )}
                                  {mult > 1 && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-300 dark:bg-purple-950/60 dark:border-purple-800 px-2 py-0.5 font-bold text-[10px] text-purple-700 dark:text-purple-300">
                                      ⚡ {mult}x Double Multiplier
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </td>

                      {/* Due Day */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span>Day {item.dueDay || 10}</span>
                        </div>
                        {item.dueDate && (
                          <div className="text-[10px] text-gray-500">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Grace & Late Fee */}
                      <td className="py-3.5 px-3">
                        <div className="text-gray-900 dark:text-gray-200 font-medium">
                          {item.lateFeeAmount > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              ₹{item.lateFeeAmount} fine
                            </span>
                          ) : (
                            <span className="text-gray-400">No late fee</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          Grace: {item.extensionDays || 5} days (Cutoff: Day {item.lateFeeDay || 15})
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${item.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {item.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                          {onOpenGenerateInvoices && (
                            <button
                              title="Generate invoices for this installment"
                              onClick={() => {
                                onOpenGenerateInvoices({
                                  scheduleId: item.id,
                                  installmentName: item.monthPayable,
                                  month: item.feeForMonths?.split(",")[0] || "",
                                  multiplier: item.monthMultiplier || (isQuarterly ? 3 : 1),
                                  sessionStart: item.sessionStart,
                                  format: item.installmentFormat,
                                });
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                            >
                              <FileText className="h-3 w-3" />
                              <span>Bill</span>
                            </button>
                          )}

                          <button
                            title="Edit Installment"
                            onClick={() => handleOpenEdit(item)}
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            title="Delete Installment"
                            onClick={() => {
                              if (confirm(`Delete installment "${item.monthPayable}"?`)) {
                                onDeleteScheduleItem(item.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Add Installment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 text-white">
              <h3 className="text-lg font-bold">
                {editingItem ? "Edit Schedule Installment" : "Create New Payment Installment"}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Define the installment title, due day, session cycle, and late fee policies.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Installment Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Installment Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.monthPayable}
                    onChange={(e) => setFormData({ ...formData, monthPayable: e.target.value })}
                    placeholder="e.g. April 2024 or Quarter 1 (Apr - Jun)"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Session Start */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Session Cycle Start *
                  </label>
                  <select
                    value={formData.sessionStart}
                    onChange={(e) => setFormData({ ...formData, sessionStart: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="april">April Start (April to March Session)</option>
                    <option value="july">July Start (July to June Session)</option>
                  </select>
                </div>

                {/* Installment Format */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Billing Frequency Format *
                  </label>
                  <select
                    value={formData.installmentFormat}
                    onChange={(e) => {
                      const fmt = e.target.value;
                      setFormData({
                        ...formData,
                        installmentFormat: fmt,
                        monthMultiplier: fmt === "quarterly" ? 3 : 1,
                      });
                    }}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="monthly">Monthly (1 Month Multiplier)</option>
                    <option value="quarterly">Quarterly (3 Months Multiplier)</option>
                    <option value="half_yearly">Half-Yearly / Bi-Annual (6 Months)</option>
                    <option value="annually">Annual / One-Time</option>
                  </select>
                </div>

                {/* Sequence Order */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Sequence Order # (1 to 12)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.orderSeq}
                    onChange={(e) => setFormData({ ...formData, orderSeq: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Month Multiplier */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Fee Multiplier
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.monthMultiplier}
                    onChange={(e) => setFormData({ ...formData, monthMultiplier: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  <p className="text-[10px] text-gray-400">1 for monthly, 3 for quarterly</p>
                </div>

                {/* Months Covered */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Months Covered (Comma separated digits)
                  </label>
                  <input
                    type="text"
                    value={formData.feeForMonths}
                    onChange={(e) => setFormData({ ...formData, feeForMonths: e.target.value })}
                    placeholder="e.g. 04 or 04,05,06 or 07,08,09"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono"
                  />
                </div>

                {/* Due Day */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Due Day of Month (1-31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Grace Days */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Grace Extension (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.extensionDays}
                    onChange={(e) => setFormData({ ...formData, extensionDays: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Late Fee Cutoff Day */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Late Fee Penalty Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.lateFeeDay}
                    onChange={(e) => setFormData({ ...formData, lateFeeDay: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Late Fee Amount */}
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Late Fee Fine Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.lateFeeAmount}
                    onChange={(e) => setFormData({ ...formData, lateFeeAmount: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Term Fee Applicability Quick Selector */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Term Fee Applicability</span>
                    <span className="text-[10px] text-gray-400 font-normal">Auto-attaches Term 1 / Term 2 fee structures</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const cleanNotes = formData.notes.replace(/\+?\s*(I|II|Term\s*[12])\s*Term/gi, "").trim();
                        setFormData({ ...formData, notes: cleanNotes });
                      }}
                      className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        !formData.notes.toLowerCase().includes("term 1") &&
                        !formData.notes.toLowerCase().includes("i term") &&
                        !formData.notes.toLowerCase().includes("term 2") &&
                        !formData.notes.toLowerCase().includes("ii term")
                          ? "border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900"
                          : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      None (Regular)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        let clean = formData.notes.replace(/\+?\s*(I|II|Term\s*[12])\s*Term/gi, "").trim();
                        clean = clean ? `${clean} + I Term` : "June + I Term";
                        setFormData({ ...formData, notes: clean });
                      }}
                      className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        formData.notes.toLowerCase().includes("term 1") || formData.notes.toLowerCase().includes("i term")
                          ? "border-amber-500 bg-amber-500 text-white"
                          : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}
                    >
                      <Star className="h-3 w-3 fill-current" /> ★ Term 1 Fee
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        let clean = formData.notes.replace(/\+?\s*(I|II|Term\s*[12])\s*Term/gi, "").trim();
                        clean = clean ? `${clean} + II Term` : "October + II Term";
                        setFormData({ ...formData, notes: clean });
                      }}
                      className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        formData.notes.toLowerCase().includes("term 2") || formData.notes.toLowerCase().includes("ii term")
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }`}
                    >
                      <Star className="h-3 w-3 fill-current" /> ★ Term 2 Fee
                    </button>
                  </div>
                </div>

                {/* Description Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Remarks / Term Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Term 1 Exam Fee included or Session Commencement fee"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                </div>

                {/* Active switch */}
                <div className="flex items-center gap-2 sm:col-span-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActiveCheck" className="font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    Installment is currently Active & open for billing
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow hover:bg-indigo-700 active:scale-95"
                >
                  {editingItem ? "Update Installment" : "Create Installment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Policy Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 dark:bg-gray-800 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                School Fee Policy Configuration
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Configure the primary calendar cycle and default billing frequency for this school.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Primary Academic Session Start Cycle
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${settingsFormData.feeSessionStart === "april"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">April Start</span>
                      <input
                        type="radio"
                        name="sessionStartRadio"
                        value="april"
                        checked={settingsFormData.feeSessionStart === "april"}
                        onChange={() => setSettingsFormData({ ...settingsFormData, feeSessionStart: "april" })}
                        className="text-indigo-600"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">
                      April to March (CBSE / ICSE standard)
                    </span>
                  </label>

                  <label
                    className={`flex flex-col p-3 rounded-xl border cursor-pointer transition ${settingsFormData.feeSessionStart === "july"
                      ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-500"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 dark:text-white">July Start</span>
                      <input
                        type="radio"
                        name="sessionStartRadio"
                        value="july"
                        checked={settingsFormData.feeSessionStart === "july"}
                        onChange={() => setSettingsFormData({ ...settingsFormData, feeSessionStart: "july" })}
                        className="text-emerald-600"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1">
                      July to June (State Boards / Intl)
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="font-semibold text-gray-700 dark:text-gray-300">
                  Default Fee Billing Frequency
                </label>
                <select
                  value={settingsFormData.feeFrequency}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, feeFrequency: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white font-medium"
                >
                  <option value="monthly">Monthly (12 installments)</option>
                  <option value="quarterly">Quarterly (4 installments per year)</option>
                </select>
                <p className="text-[10px] text-gray-400">
                  New student fee invoice wizards will default to this frequency.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="rounded-lg px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow hover:bg-indigo-700 active:scale-95"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
