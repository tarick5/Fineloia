import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  userId: z.string().uuid(),
  companyName: z.string().min(2),
  country: z.string().min(2),
  sector: z.string().min(2),
  size: z.string().min(1),
  currency: z.string().min(3),
  plan: z.enum(["starter", "pro", "enterprise"]).default("starter"),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());
    const supabase = createSupabaseAdminClient();

    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(payload.userId);

    if (authError || !authUser.user) {
      return NextResponse.json({ error: "Invalid user." }, { status: 400 });
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
        plan: payload.plan,
        billing_cycle: payload.billingCycle,
        trial_ends_at: trialEndsAt,
      })
      .select("id")
      .single();

    if (organizationError || !organization) {
      return NextResponse.json(
        { error: organizationError?.message ?? "Could not create organization." },
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
        error: error instanceof Error ? error.message : "Unexpected bootstrap error.",
      },
      { status: 500 },
    );
  }
}
