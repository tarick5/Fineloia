import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";

const schema = z.object({
  organizationId: z.string().uuid(),
  date: z.string().min(1),
  description: z.string().min(1),
  amount: z.number(),
  category: z.string().default("General"),
  account: z.string().default("Main"),
  currency: z.string().default("USD"),
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

    const body = schema.parse(await request.json());

    await ensureOrganizationMember({
      userId: user.id,
      organizationId: body.organizationId,
    });

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        organization_id: body.organizationId,
        date: body.date,
        description: body.description,
        amount: body.amount,
        category: body.category,
        account: body.account,
        currency: body.currency,
        source: "manual",
      })
      .select(
        "id, organization_id, date, description, amount, category, subcategory, account, currency, source, created_at",
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Could not create transaction." },
        { status: 400 },
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected error.",
      },
      { status: 500 },
    );
  }
}
