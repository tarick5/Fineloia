import type { BillingCycle, PlanId } from "@/lib/constants/plans";

export type Severity = "info" | "warning" | "critical";

export type Organization = {
  id: string;
  name: string;
  country: string;
  currency: string;
  sector: string;
  size: string;
  plan: PlanId;
  billing_cycle: BillingCycle;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  trial_ends_at: string | null;
  created_at: string;
};

export type MemberRole = "owner" | "admin" | "viewer";

export type Member = {
  id: string;
  organization_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
};

export type Transaction = {
  id: string;
  organization_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  subcategory: string | null;
  account: string;
  currency: string;
  source: "manual" | "csv_import" | "api";
  created_at: string;
};

export type KPI = {
  id: string;
  organization_id: string;
  period: string;
  revenue: number;
  expenses: number;
  gross_margin: number;
  operating_margin: number;
  net_margin: number;
  cashflow: number;
  burn_rate: number;
  runway_months: number;
  arr: number;
  mrr: number;
  calculated_at: string;
};

export type Alert = {
  id: string;
  organization_id: string;
  type: string;
  severity: Severity;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};
