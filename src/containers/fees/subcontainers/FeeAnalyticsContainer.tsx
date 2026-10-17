import React, { useState, useEffect, useCallback } from "react";
import feeService, { FeeStatsResponse } from "../../../Services/fee.service";
import { FeeAnalyticsTab } from "../../../components/modules/fees/FeeAnalyticsTab";

export interface FeeAnalyticsContainerProps {
  schoolId: string;
  onNavigateToInvoices: (status?: string) => void;
  feeStats?: FeeStatsResponse | null;
  onStatsUpdated?: (stats: FeeStatsResponse) => void;
}

export const FeeAnalyticsContainer: React.FC<FeeAnalyticsContainerProps> = ({
  schoolId,
  onNavigateToInvoices,
  feeStats: propStats,
  onStatsUpdated,
}) => {
  const [localStats, setLocalStats] = useState<FeeStatsResponse | null>(propStats || null);

  const fetchFeeStats = useCallback(async () => {
    try {
      const data = await feeService.getFeeStats(schoolId);
      if (data) {
        setLocalStats(data);
        if (onStatsUpdated) onStatsUpdated(data);
      }
    } catch (err) {
      console.error("Failed to fetch fee stats:", err);
    }
  }, [schoolId, onStatsUpdated]);

  useEffect(() => {
    if (!propStats) {
      fetchFeeStats();
    } else {
      setLocalStats(propStats);
    }
  }, [propStats, fetchFeeStats]);

  return (
    <FeeAnalyticsTab
      stats={localStats}
      currencySymbol="₹"
      onNavigateToInvoices={onNavigateToInvoices}
    />
  );
};

export default FeeAnalyticsContainer;
