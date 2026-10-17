import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useSchool } from "../../../context/SchoolContext";
import feeService, {
  FeePaymentScheduleItem,
  SchoolFeeSettings,
} from "../../../Services/fee.service";
import { FeeSchedulesTab } from "../../../components/modules/fees/FeeSchedulesTab";

export interface FeeSchedulesContainerProps {
  schoolId: string;
  onOpenGenerateInvoices?: (preset?: {
    scheduleId?: string;
    installmentName?: string;
    month?: string;
    multiplier?: number;
    sessionStart?: string;
    format?: string;
    isEntireYear?: boolean;
  }) => void;
  onSchedulesUpdated?: (schedules: FeePaymentScheduleItem[]) => void;
  onSettingsUpdated?: (settings: SchoolFeeSettings) => void;
}

export const FeeSchedulesContainer: React.FC<FeeSchedulesContainerProps> = ({
  schoolId,
  onOpenGenerateInvoices,
  onSchedulesUpdated,
  onSettingsUpdated,
}) => {
  const { activeSchool } = useSchool();
  const [feeSchedules, setFeeSchedules] = useState<FeePaymentScheduleItem[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<SchoolFeeSettings | null>(null);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  const fetchFeeSchedules = useCallback(async () => {
    try {
      const data = await feeService.getFeeSchedules(schoolId);
      if (Array.isArray(data)) {
        setFeeSchedules(data);
        if (onSchedulesUpdated) onSchedulesUpdated(data);
      }
    } catch (err) {
      console.error("Failed to fetch fee schedules:", err);
    }
  }, [schoolId, onSchedulesUpdated]);

  const fetchSchoolSettings = useCallback(async () => {
    try {
      const data = await feeService.getSchoolFeeSettings(schoolId);
      if (data) {
        setSchoolSettings(data);
        if (onSettingsUpdated) onSettingsUpdated(data);
      }
    } catch (err) {
      console.error("Failed to fetch school fee settings:", err);
    }
  }, [schoolId, onSettingsUpdated]);

  useEffect(() => {
    fetchFeeSchedules();
    fetchSchoolSettings();
  }, [fetchFeeSchedules, fetchSchoolSettings]);

  const handleGenerateDefaultSchedule = useCallback(
    async (sessionStart: "april" | "july", format: "monthly" | "quarterly") => {
      setIsGeneratingSchedule(true);
      try {
        const res = await feeService.generateDefaultSchedule(schoolId, {
          sessionStart,
          format,
          academicYear: activeSchool?.academicYear || (activeSchool as any)?.academic_year || "2024-25",
        });
        toast.success(res.message || "Schedule generated successfully!");
        fetchFeeSchedules();
      } catch (err) {
        toast.error("Failed to generate default schedule.");
      } finally {
        setIsGeneratingSchedule(false);
      }
    },
    [schoolId, activeSchool, fetchFeeSchedules]
  );

  const handleSaveScheduleItem = useCallback(
    async (itemData: any) => {
      try {
        await feeService.saveFeeSchedule(schoolId, itemData);
        toast.success(itemData.id ? "Schedule installment updated" : "Schedule installment created");
        fetchFeeSchedules();
      } catch (err) {
        toast.error("Failed to save schedule installment.");
      }
    },
    [schoolId, fetchFeeSchedules]
  );

  const handleDeleteScheduleItem = useCallback(
    async (id: string) => {
      try {
        await feeService.deleteFeeSchedule(schoolId, id);
        toast.info("Schedule installment deleted");
        fetchFeeSchedules();
      } catch (err) {
        toast.error("Failed to delete schedule installment.");
      }
    },
    [schoolId, fetchFeeSchedules]
  );

  const handleUpdateSchoolSettings = useCallback(
    async (settingsData: any) => {
      try {
        const res = await feeService.updateSchoolFeeSettings(schoolId, settingsData);
        setSchoolSettings(res);
        if (onSettingsUpdated) onSettingsUpdated(res);
        toast.success("School fee policy updated successfully!");
      } catch (err) {
        toast.error("Failed to update school fee policy.");
      }
    },
    [schoolId, onSettingsUpdated]
  );

  return (
    <FeeSchedulesTab
      schedules={feeSchedules}
      schoolSettings={schoolSettings}
      onGenerateDefaults={handleGenerateDefaultSchedule}
      onSaveScheduleItem={handleSaveScheduleItem}
      onDeleteScheduleItem={handleDeleteScheduleItem}
      onUpdateSchoolSettings={handleUpdateSchoolSettings}
      onOpenGenerateInvoices={onOpenGenerateInvoices}
      isGenerating={isGeneratingSchedule}
    />
  );
};

export default FeeSchedulesContainer;
