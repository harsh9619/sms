import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import feeService, {
  ClassFeeStructureItem,
  FeePaymentScheduleItem,
} from "../../../Services/fee.service";
import { GenerateInvoicesModal } from "../../../components/modules/fees/GenerateInvoicesModal";

export interface GenerateInvoicesModalContainerProps {
  showGenerateModal: boolean;
  setShowGenerateModal: (show: boolean) => void;
  schoolId: string;
  classes: any[];
  students: any[];
  classFeeStructures: ClassFeeStructureItem[];
  feeSchedules: FeePaymentScheduleItem[];
  preset?: {
    scheduleId?: string;
    installmentName?: string;
    month?: string;
    multiplier?: number;
    sessionStart?: string;
    format?: string;
    isEntireYear?: boolean;
  } | null;
  defaultSessionStart?: string;
  defaultFormat?: string;
  onSuccess?: () => void;
}

export const GenerateInvoicesModalContainer: React.FC<GenerateInvoicesModalContainerProps> = ({
  showGenerateModal,
  setShowGenerateModal,
  schoolId,
  classes = [],
  students = [],
  classFeeStructures = [],
  feeSchedules = [],
  preset,
  defaultSessionStart = "april",
  defaultFormat = "monthly",
  onSuccess,
}) => {
  const [generateClassId, setGenerateClassId] = useState("");
  const [generateDueDate, setGenerateDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generateScheduleId, setGenerateScheduleId] = useState("");
  const [generateInstallmentName, setGenerateInstallmentName] = useState("");
  const [generateMultiplier, setGenerateMultiplier] = useState(1);
  const [generateSessionStart, setGenerateSessionStart] = useState(defaultSessionStart);
  const [generateFormat, setGenerateFormat] = useState(defaultFormat);
  const [generateIsEntireYear, setGenerateIsEntireYear] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Apply preset when opened or when preset changes
  useEffect(() => {
    if (preset) {
      if (preset.isEntireYear) {
        setGenerateIsEntireYear(true);
        setGenerateScheduleId("entire_year");
        if (preset.sessionStart) setGenerateSessionStart(preset.sessionStart);
        if (preset.format) setGenerateFormat(preset.format);
      } else {
        setGenerateIsEntireYear(false);
        setGenerateScheduleId(preset.scheduleId || "");
        setGenerateInstallmentName(preset.installmentName || "");
        if (preset.month) {
          const yr = new Date().getFullYear();
          setGenerateMonth(`${yr}-${preset.month}`);
        }
        if (preset.multiplier) setGenerateMultiplier(preset.multiplier);
        if (preset.sessionStart) setGenerateSessionStart(preset.sessionStart);
        if (preset.format) setGenerateFormat(preset.format);
      }
    }
  }, [preset]);

  const handleCloseGenerateModal = useCallback(() => {
    setGenerateClassId("");
    setGenerateDueDate("");
    setGenerateScheduleId("");
    setGenerateInstallmentName("");
    setGenerateIsEntireYear(false);
    setShowGenerateModal(false);
  }, [setShowGenerateModal]);

  const handleGenerateInvoices = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await feeService.generateClassInvoices(schoolId, {
        classMasterId: generateClassId || "all",
        dueDate: generateDueDate,
        month: generateMonth,
        scheduleId: generateScheduleId || undefined,
        installmentName: generateInstallmentName || undefined,
        sessionStart: generateSessionStart || undefined,
        installmentFormat: generateFormat || undefined,
        multiplier: generateMultiplier,
        isEntireYear: generateIsEntireYear || generateScheduleId === "entire_year",
      });

      toast.success(res.message || "Generated invoices successfully!");
      handleCloseGenerateModal();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast.error("Failed to generate class invoices");
    } finally {
      setIsGenerating(false);
    }
  }, [
    schoolId,
    generateClassId,
    generateDueDate,
    generateMonth,
    generateScheduleId,
    generateInstallmentName,
    generateSessionStart,
    generateFormat,
    generateMultiplier,
    generateIsEntireYear,
    handleCloseGenerateModal,
    onSuccess,
  ]);

  if (!showGenerateModal) return null;

  return (
    <GenerateInvoicesModal
      showGenerateModal={showGenerateModal}
      setShowGenerateModal={setShowGenerateModal}
      generateClassId={generateClassId}
      setGenerateClassId={setGenerateClassId}
      generateDueDate={generateDueDate}
      setGenerateDueDate={setGenerateDueDate}
      generateMonth={generateMonth}
      setGenerateMonth={setGenerateMonth}
      generateScheduleId={generateScheduleId}
      setGenerateScheduleId={setGenerateScheduleId}
      generateInstallmentName={generateInstallmentName}
      setGenerateInstallmentName={setGenerateInstallmentName}
      generateMultiplier={generateMultiplier}
      setGenerateMultiplier={setGenerateMultiplier}
      generateSessionStart={generateSessionStart}
      setGenerateSessionStart={setGenerateSessionStart}
      generateFormat={generateFormat}
      setGenerateFormat={setGenerateFormat}
      generateIsEntireYear={generateIsEntireYear}
      setGenerateIsEntireYear={setGenerateIsEntireYear}
      handleGenerateInvoices={handleGenerateInvoices}
      isGenerating={isGenerating}
      classes={classes}
      classFeeStructures={classFeeStructures}
      feeSchedules={feeSchedules}
      students={students}
      handleCloseGenerateModal={handleCloseGenerateModal}
    />
  );
};

export default GenerateInvoicesModalContainer;
