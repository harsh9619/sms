import React from "react";
import { FeesContainer } from "../../containers/fees/FeesContainer";

export function FeeReportPage() {
  return (
    <div className="space-y-6">
      <FeesContainer isMyFees={false} />
    </div>
  );
}

export default FeeReportPage;
