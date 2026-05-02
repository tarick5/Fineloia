import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";

const schema = z.object({
  organizationId: z.string().uuid(),
  plan: z.enum(["starter", "pro", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
});

function resolvePriceId(plan: "starter" | "pro" | "enterprise", billingCycle: "monthly" | "annual") {
  const env = getServerEnv();

  if (plan === "starter" && billingCycle === "monthly") return env.STRIPE_STARTER_MONTHLY_PRICE_ID;
  if (plan === "starter" && billingCycle === "annual") return env.STRIPE_STARTER_ANNUAL_PRICE_ID;
  if (plan === "pro" && billingCycle === "monthly") return env.STRIPE_PRO_MONTHLY_PRICE_ID;
  if (plan === "pro" && billingCycle === "annual") return env.STRIPE_PRO_ANNUAL_PRICE_ID;
  if (plan === "enterprise" && billingCycle === "monthly") return env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID;
  return env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID;
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = schema.parse(await request.json());

    await ensureOrganizationMember({ userId: user.id, organizationId: payload.organizationId });

    const { data: organization, error } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", payload.organizationId)
      .single();

    if (error || !organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const stripe = getStripeClient();
    const env = getServerEnv();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: organization.stripe_customer_id ?? undefined,
      line_items: [
        {
          price: resolvePriceId(payload.plan, payload.billingCycle),
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings?checkout=success`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings?checkout=cancel`,
      metadata: {
        organizationId: payload.organizationId,
        plan: payload.plan,
        billingCycle: payload.billingCycle,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected checkout error" },
      { status: 500 },
    );
  }
}
