import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function getPlanFromPriceId(priceId: string | null | undefined, env: ReturnType<typeof getServerEnv>) {
  if (!priceId) return { plan: "starter", billingCycle: "monthly" };

  if (priceId === env.STRIPE_STARTER_MONTHLY_PRICE_ID) return { plan: "starter", billingCycle: "monthly" };
  if (priceId === env.STRIPE_STARTER_ANNUAL_PRICE_ID) return { plan: "starter", billingCycle: "annual" };
  if (priceId === env.STRIPE_PRO_MONTHLY_PRICE_ID) return { plan: "pro", billingCycle: "monthly" };
  if (priceId === env.STRIPE_PRO_ANNUAL_PRICE_ID) return { plan: "pro", billingCycle: "annual" };
  if (priceId === env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID) return { plan: "enterprise", billingCycle: "monthly" };
  if (priceId === env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID) return { plan: "enterprise", billingCycle: "annual" };

  return { plan: "starter", billingCycle: "monthly" };
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const env = getServerEnv();
  const supabase = createSupabaseAdminClient();

  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid webhook signature",
      },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;

        if (organizationId) {
          await supabase
            .from("organizations")
            .update({
              stripe_customer_id: String(session.customer),
              stripe_subscription_id: String(session.subscription),
            })
            .eq("id", organizationId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        const mapping = getPlanFromPriceId(priceId, env);

        await supabase
          .from("organizations")
          .update({
            stripe_subscription_id: subscription.id,
            plan: mapping.plan,
            billing_cycle: mapping.billingCycle,
          })
          .eq("stripe_customer_id", String(subscription.customer));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from("organizations")
          .update({
            stripe_subscription_id: null,
            plan: "starter",
            billing_cycle: "monthly",
          })
          .eq("stripe_customer_id", String(subscription.customer));

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected webhook error",
      },
      { status: 500 },
    );
  }
}
