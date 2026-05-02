import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/rate-limit";
import { enforceForecastScenarioLimit } from "@/lib/plan-enforcement";

const schema = z.object({
  organizationId: z.string().uuid(),
  type: z.string().min(1),
  period: z.string().min(1),
  scenario: z.enum(["conservative", "realistic", "optimistic"]).optional(),
});

function fallbackForecast(periodMonths: number, scenario: string) {
  const growthRate = scenario === "optimistic" ? 0.12 : scenario === "conservative" ? 0.03 : 0.07;

  return Array.from({ length: periodMonths }).map((_, index) => {
    const month = index + 1;
    return {
      month,
      value: Number((100000 * Math.pow(1 + growthRate, month)).toFixed(2)),
      lower: Number((95000 * Math.pow(1 + growthRate - 0.03, month)).toFixed(2)),
      upper: Number((105000 * Math.pow(1 + growthRate + 0.03, month)).toFixed(2)),
    };
  });
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

    enforceRateLimit({
      key: `forecast:${user.id}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });

    const payload = schema.parse(await request.json());
    const scenario = payload.scenario ?? "realistic";

    await ensureOrganizationMember({
      userId: user.id,
      organizationId: payload.organizationId,
    });
    await enforceForecastScenarioLimit({
      organizationId: payload.organizationId,
      scenario,
    });

    const periodMonths = Number(payload.period.match(/\d+/)?.[0] ?? "12");

    let forecastData = fallbackForecast(periodMonths, scenario);

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const aiResult = await generateText({
          model: anthropic("claude-sonnet-4-20250514"),
          prompt: `Return JSON array only. Build a ${scenario} ${payload.type} monthly forecast for ${periodMonths} months with keys: month,value,lower,upper.`,
        });

        const parsed = JSON.parse(aiResult.text) as Array<{
          month: number;
          value: number;
          lower: number;
          upper: number;
        }>;

        if (Array.isArray(parsed) && parsed.length > 0) {
          forecastData = parsed;
        }
      } catch {
        // Keep fallback forecast
      }
    }

    const { data, error } = await supabase
      .from("forecasts")
      .insert({
        organization_id: payload.organizationId,
        type: payload.type,
        period: payload.period,
        scenario,
        data: forecastData,
      })
      .select("*")
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Could not store forecast" }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected forecast error" },
      { status: 500 },
    );
  }
}
