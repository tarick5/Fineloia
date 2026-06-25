import { NextResponse } from "next/server";
import { z } from "zod";
import type { PlanId } from "@/lib/constants/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  userId: z.string().uuid(),
  companyName: z.string().min(2),
  country: z.string().min(2).default("Portugal"),
  sector: z.string().min(2).default("Technology"),
  size: z.string().min(1).default("1-10"),
  currency: z.string().min(3).default("EUR"),
});

const planPriority: Record<PlanId, number> = {
  starter: 0,
  pro: 1,
  enterprise: 2,
};

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());

    const serverSupabase = createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await serverSupabase.auth.getUser();

    if (userError || !user || user.id !== payload.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: memberships, error: membershipError } = await supabase
      .from("members")
      .select("organization_id")
      .eq("user_id", payload.userId);

    if (membershipError) {
      return NextResponse.json({ error: membershipError.message }, { status: 400 });
    }

    const organizationIds = memberships?.map((membership) => membership.organization_id) ?? [];

    let effectivePlan: PlanId = "starter";
    let billingCycle: "monthly" | "annual" = "monthly";

    if (organizationIds.length > 0) {
      const { data: existingOrganizations, error: organizationsError } = await supabase
        .from("organizations")
        .select("id, plan, billing_cycle")
        .in("id", organizationIds);

      if (organizationsError) {
        return NextResponse.json({ error: organizationsError.message }, { status: 400 });
      }

      const highestPlan = (existingOrganizations ?? []).reduce<PlanId>((bestPlan, organization) => {
        const plan = (organization.plan as PlanId | undefined) ?? "starter";
        return planPriority[plan] > planPriority[bestPlan] ? plan : bestPlan;
      }, "starter");

      effectivePlan = highestPlan;

      const currentOrganization = (existingOrganizations ?? []).find(
        (organization) => (organization.plan as PlanId | undefined) === effectivePlan,
      );

      if (currentOrganization?.billing_cycle) {
        billingCycle = currentOrganization.billing_cycle as "monthly" | "annual";
      }
    }

    const maxOrganizations = effectivePlan === "enterprise" ? Number.MAX_SAFE_INTEGER : effectivePlan === "pro" ? 2 : 1;

    if (organizationIds.length >= maxOrganizations) {
      return NextResponse.json(
        { error: "This plan already allows the maximum number of companies." },
        { status: 403 },
      );
    }

    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .insert({
        name: payload.companyName,
        country: payload.country,
        currency: payload.currency,
        sector: payload.sector,
        size: payload.size,
        plan: effectivePlan,
        billing_cycle: billingCycle,
        trial_ends_at: trialEndsAt,
      })
      .select("id")
      .single();

    if (organizationError || !organization) {
      return NextResponse.json(
        { error: organizationError?.message ?? "Could not create company." },
        { status: 400 },
      );
    }

    const { error: memberError } = await supabase.from("members").insert({
      organization_id: organization.id,
      user_id: payload.userId,
      role: "owner",
    });

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 400 });
    }

    await supabase.from("accounts").insert({
      organization_id: organization.id,
      name: "Main Account",
      type: "bank",
      currency: payload.currency,
      balance: 0,
    });

    return NextResponse.json({ organizationId: organization.id });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected organization creation error.",
      },
      { status: 500 },
    );
  }
}
