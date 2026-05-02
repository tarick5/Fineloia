import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getDashboardSnapshot } from "@/lib/dashboard-data";
import { getAdvisorSystemPrompt } from "@/lib/ai/advisor";
import { enforceChatPlanLimit } from "@/lib/plan-enforcement";

const schema = z.object({
  organizationId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export const maxDuration = 30;

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
      key: `chat:${user.id}`,
      limit: 120,
      windowMs: 60 * 60 * 1000,
    });

    const payload = schema.parse(await request.json());

    await ensureOrganizationMember({
      userId: user.id,
      organizationId: payload.organizationId,
    });

    await enforceChatPlanLimit({
      organizationId: payload.organizationId,
      userId: user.id,
    });

    const { data: organization } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", payload.organizationId)
      .single();

    const snapshot = await getDashboardSnapshot(payload.organizationId);

    const topExpenseCategories = Array.from(
      snapshot.transactions
        .filter((transaction) => Number(transaction.amount) < 0)
        .reduce((acc, transaction) => {
          const key = transaction.category || "General";
          acc.set(key, (acc.get(key) ?? 0) + Math.abs(Number(transaction.amount)));
          return acc;
        }, new Map<string, number>()),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);

    const systemPrompt = getAdvisorSystemPrompt({
      companyName: organization?.name ?? "company",
      language: "user locale",
      context: {
        revenue: snapshot.kpis.revenue,
        expenses: snapshot.kpis.expenses,
        netMargin: snapshot.kpis.net_margin,
        cash: snapshot.cashBalance,
        runwayMonths: snapshot.kpis.runway_months,
        topExpenseCategories,
        growthVsPreviousMonth: 0,
      },
    });

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages: payload.messages,
      temperature: 0.2,
      maxOutputTokens: 500,
      onFinish: async ({ text }) => {
        await supabase.from("conversations").insert({
          organization_id: payload.organizationId,
          user_id: user.id,
          messages: [...payload.messages, { role: "assistant", content: text }],
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected chat error",
      },
      { status: 500 },
    );
  }
}
