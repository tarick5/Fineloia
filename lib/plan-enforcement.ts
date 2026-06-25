import { startOfMonth } from "date-fns";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getOrganizationPlan(organizationId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("organizations")
    .select("plan, billing_cycle")
    .eq("id", organizationId)
    .single();

  return {
    plan: data?.plan ?? "starter",
    billingCycle: data?.billing_cycle ?? "monthly",
  };
}

export async function enforceChatPlanLimit({
  organizationId,
  userId,
}: {
  organizationId: string;
  userId: string;
}) {
  const supabase = createSupabaseServerClient();
  const { plan } = await getOrganizationPlan(organizationId);

  if (plan !== "starter") {
    return { remaining: "fair-use" as const };
  }

  const monthStart = startOfMonth(new Date()).toISOString();
  const { count } = await supabase
    .from("conversations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("user_id", userId)
    .gte("created_at", monthStart);

  const used = count ?? 0;
  const remaining = Math.max(0, 50 - used);

  if (remaining <= 0) {
    throw new Error("Starter plan limit reached: 50 AI messages per month.");
  }

  return { remaining };
}

export async function enforceReportPlanLimit(organizationId: string) {
  const supabase = createSupabaseServerClient();
  const { plan } = await getOrganizationPlan(organizationId);

  if (plan !== "starter") {
    return;
  }

  const monthStart = startOfMonth(new Date()).toISOString();
  const { count } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("created_at", monthStart);

  if ((count ?? 0) >= 3) {
    throw new Error("Starter plan limit reached: maximum 3 reports per month.");
  }
}

export async function enforceForecastScenarioLimit({
  organizationId,
  scenario,
}: {
  organizationId: string;
  scenario: string;
}) {
  const { plan } = await getOrganizationPlan(organizationId);

  if (plan === "starter" && scenario !== "realistic") {
    throw new Error("Starter plan only supports realistic forecast scenario.");
  }
}
