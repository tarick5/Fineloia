export type PlanId = "starter" | "pro" | "enterprise";
export type BillingCycle = "monthly" | "annual";

export type PlanLimit = {
  organizations: number;
  seats: number;
  reportsPerMonth: number | "unlimited";
  aiMessagesPerMonth: number | "unlimited";
  scenarios: 1 | 3;
  apiCallsPerMonth: number | "unlimited";
};

export type Plan = {
  id: PlanId;
  name: string;
  monthlyPrice: number;
  annualMonthlyEquivalent: number;
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
      "Up to 3 automatic monthly reports",
      "Basic treasury and margin alerts",
      "50 AI advisor messages / month",
      "Single forecast scenario",
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
      reportsPerMonth: "unlimited",
      aiMessagesPerMonth: "unlimited",
      scenarios: 3,
      apiCallsPerMonth: 100_000,
    },
    features: [
      "Up to 5 organizations",
      "10 seats",
      "Unlimited reports",
      "Advanced anomaly and benchmark alerts",
      "Unlimited AI advisor messages",
      "3 forecast scenarios",
      "What-if analysis",
      "Benchmarking by country and sector",
      "Read-only API (100k calls / month)",
      "Priority chat support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 499,
    annualMonthlyEquivalent: 399,
    limits: {
      organizations: Number.MAX_SAFE_INTEGER,
      seats: Number.MAX_SAFE_INTEGER,
      reportsPerMonth: "unlimited",
      aiMessagesPerMonth: "unlimited",
      scenarios: 3,
      apiCallsPerMonth: "unlimited",
    },
    features: [
      "Unlimited organizations and seats",
      "White-label customization",
      "ERP webhooks (SAP, Primavera, Quickbooks, Oracle)",
      "Realtime alerts via Slack, Teams, and email",
      "Unlimited API",
      "99.9% SLA",
      "Dedicated account manager",
      "Custom onboarding",
      "24/7 support",
    ],
  },
];

export function getPlanById(planId: PlanId) {
  return PLANS.find((plan) => plan.id === planId) ?? PLANS[0];
}
