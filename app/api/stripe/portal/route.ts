import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";

const schema = z.object({
  organizationId: z.string().uuid(),
});

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

    const { data: organization } = await supabase
      .from("organizations")
      .select("stripe_customer_id")
      .eq("id", payload.organizationId)
      .single();

    if (!organization?.stripe_customer_id) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
    }

    const stripe = getStripeClient();
    const env = getServerEnv();

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected portal error",
      },
      { status: 500 },
    );
  }
}
