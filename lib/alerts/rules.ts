import type { Severity } from "@/types/domain";

type Inputs = {
  runwayMonths: number;
  currentNetMargin: number;
  previousNetMargin: number;
  expenseGrowthRate: number;
  hasAnomaly: boolean;
  hasIdleCapital: boolean;
  belowBenchmark: boolean;
};

export type GeneratedAlert = {
  type: string;
  severity: Severity;
  title: string;
  triggerValue: string;
  recommendation: string;
};

export function evaluateAlertRules(input: Inputs): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = [];

  if (input.runwayMonths < 2) {
    alerts.push({
      type: "treasury",
      severity: "critical",
      title: "Cash runway below 60 days",
      triggerValue: `${input.runwayMonths.toFixed(1)} months`,
      recommendation: "Review fixed costs and prioritize receivables this week.",
    });
  }

  if (input.previousNetMargin - input.currentNetMargin > 0.05) {
    alerts.push({
      type: "margin",
      severity: "warning",
      title: "Net margin dropped more than 5pp",
      triggerValue: `${((input.previousNetMargin - input.currentNetMargin) * 100).toFixed(1)}pp`,
      recommendation: "Identify top cost drivers and adjust pricing or spend.",
    });
  }

  if (input.expenseGrowthRate > 0.3) {
    alerts.push({
      type: "expenses",
      severity: "warning",
      title: "Expense category grew above 30%",
      triggerValue: `${(input.expenseGrowthRate * 100).toFixed(1)}%`,
      recommendation: "Audit the category and set a weekly budget cap.",
    });
  }

  if (input.hasAnomaly) {
    alerts.push({
      type: "anomaly",
      severity: "warning",
      title: "Transaction anomaly detected",
      triggerValue: "Unusual amount pattern",
      recommendation: "Validate outlier transactions and category mapping.",
    });
  }

  if (input.hasIdleCapital) {
    alerts.push({
      type: "opportunity",
      severity: "info",
      title: "Idle capital detected",
      triggerValue: "Large static cash balance",
      recommendation: "Reassess short-term treasury allocation strategy.",
    });
  }

  if (input.belowBenchmark) {
    alerts.push({
      type: "benchmark",
      severity: "info",
      title: "Margin below sector benchmark",
      triggerValue: "Under median benchmark",
      recommendation: "Compare pricing and COGS efficiency against peers.",
    });
  }

  return alerts;
}
