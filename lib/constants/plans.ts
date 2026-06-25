export type PlanId = "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export type PlanLimit = {
  organizations: number;
  seats: number;
  reportsPerMonth: number | "fair-use" | "custom";
  aiMessagesPerMonth: number | "fair-use" | "custom";
  scenarios: 1 | 3;
  apiCallsPerMonth: number | "scoped";
};

export type Plan = {
  id: PlanId;
  name: string;
  monthlyPrice: number | null;
  annualMonthlyEquivalent: number | null;
  customPricing?: boolean;
  highlighted?: boolean;
  limits: PlanLimit;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 49,
    annualMonthlyEquivalent: 39,
    limits: {
      organizations: 1,
      seats: 2,
      reportsPerMonth: 3,
      aiMessagesPerMonth: 50,
      scenarios: 1,
      apiCallsPerMonth: 0,
    },
    features: [
      "1 organization",
      "2 seats",
      "CSV import + manual entries",
      "Up to 3 AI reports / month",
      "Basic treasury and margin alerts",
      "50 AI advisor messages / month",
      "1 forecast scenario",
      "PDF export",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 149,
    annualMonthlyEquivalent: 119,
    highlighted: true,
    limits: {
      organizations: 5,
      seats: 10,
      reportsPerMonth: "fair-use",
      aiMessagesPerMonth: "fair-use",
      scenarios: 3,
      apiCallsPerMonth: 0,
    },
    features: [
      "Up to 5 organizations",
      "10 seats",
      "Expanded AI report generation",
      "Fair-use AI advisor messages",
      "3 forecast scenarios",
      "Advanced treasury and margin alerts",
      "Benchmark-ready insights when data is available",
      "PDF export",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    annualMonthlyEquivalent: null,
    customPricing: true,
    limits: {
      organizations: Number.MAX_SAFE_INTEGER,
      seats: Number.MAX_SAFE_INTEGER,
      reportsPerMonth: "custom",
      aiMessagesPerMonth: "custom",
      scenarios: 3,
      apiCallsPerMonth: "scoped",
    },
    features: [
      "Custom organizations and seats",
      "Custom AI and report usage",
      "Scoped integrations and API access",
      "Advanced controls for larger teams",
      "PDF export",
      "Custom onboarding",
      "Priority implementation support",
      "Enterprise billing and contract",
    ],
  },
];

export function getPlanById(planId: PlanId) {
  return PLANS.find((plan) => plan.id === planId) ?? PLANS[0];
}
