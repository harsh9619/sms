import React, { useState } from "react";
import { FeesContainer } from "../../containers/fees/FeesContainer";
import { SalaryContainer } from "../../containers/salary/SalaryContainer";

export function FeeSalaryReportPage() {
  const [activeTab, setActiveTab] = useState<"fees" | "salaries">("fees");

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-border/60 text-left">
        <button
          onClick={() => setActiveTab("fees")}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "fees"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Fees Management & Ledgers
        </button>
        <button
          onClick={() => setActiveTab("salaries")}
          className={`px-4 py-2.5 font-bold text-sm border-b-2 transition-colors ${
            activeTab === "salaries"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Salary Payroll Registries
        </button>
      </div>

      {/* Modular Containers */}
      {activeTab === "fees" ? (
        <FeesContainer isMyFees={false} />
      ) : (
        <SalaryContainer isMySalary={false} />
      )}
    </div>
  );
}

export default FeeSalaryReportPage;
