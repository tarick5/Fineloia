import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { calculateKpis } from "@/lib/kpis";
import { enforceRateLimit } from "@/lib/rate-limit";
import { enforceReportPlanLimit } from "@/lib/plan-enforcement";

const schema = z.object({
  organizationId: z.string().uuid(),
  type: z.string().min(2),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
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

    enforceRateLimit({
      key: `reports:${user.id}`,
      limit: 15,
      windowMs: 60 * 60 * 1000,
    });

    const payload = schema.parse(await request.json());

    await ensureOrganizationMember({
      userId: user.id,
      organizationId: payload.organizationId,
    });
    await enforceReportPlanLimit(payload.organizationId);

    const { data: organization } = await supabase
      .from("organizations")
      .select("name, currency")
      .eq("id", payload.organizationId)
      .single();

    const { data: transactions } = await supabase
      .from("transactions")
      .select("date, amount, category, description")
      .eq("organization_id", payload.organizationId)
      .gte("date", payload.periodStart)
      .lte("date", payload.periodEnd)
      .limit(4000);

    const kpis = calculateKpis({
      transactions: (transactions ?? []).map((item) => ({
        date: item.date,
        amount: Number(item.amount),
        category: item.category,
      })),
      cashBalance: 0,
    });

    const reportPrompt = `Create a ${payload.type} financial report for ${organization?.name ?? "the company"} between ${payload.periodStart} and ${payload.periodEnd}. Include executive summary, KPI interpretation, risk notes, and 5 clear action recommendations. Use simple language and numbers.`;

    const aiResult = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      prompt: `${reportPrompt}\n\nKPI Context: ${JSON.stringify(kpis)}`,
    });

    const { data: report, error } = await supabase
      .from("reports")
      .insert({
        organization_id: payload.organizationId,
        type: payload.type,
        period_start: payload.periodStart,
        period_end: payload.periodEnd,
        content: {
          generated_at: new Date().toISOString(),
          kpis,
        },
        ai_analysis: aiResult.text,
      })
      .select("*")
      .single();

    if (error || !report) {
      return NextResponse.json({ error: error?.message ?? "Could not create report" }, { status: 400 });
    }

    return NextResponse.json({ data: report });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected report error",
      },
      { status: 500 },
    );
  }
}
