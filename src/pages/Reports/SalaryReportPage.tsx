import React from "react";
import { SalaryContainer } from "../../containers/salary/SalaryContainer";

export function SalaryReportPage() {
  return (
    <div className="space-y-6">
      <SalaryContainer isMySalary={false} />
    </div>
  );
}

export default SalaryReportPage;
