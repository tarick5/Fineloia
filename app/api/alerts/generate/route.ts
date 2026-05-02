import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { calculateKpis } from "@/lib/kpis";
import { evaluateAlertRules } from "@/lib/alerts/rules";
import { draftAlertText } from "@/lib/ai/advisor";
import { getResendClient } from "@/lib/resend";

async function processOrganization(organizationId: string, organizationName: string, ownerUserId?: string) {
  const supabase = createSupabaseAdminClient();

  const [transactionsResult, accountsResult, previousKpisResult, benchmarkResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("date, amount, category")
      .eq("organization_id", organizationId)
      .order("date", { ascending: false })
      .limit(2000),
    supabase.from("accounts").select("balance").eq("organization_id", organizationId),
    supabase
      .from("kpis")
      .select("net_margin")
      .eq("organization_id", organizationId)
      .order("calculated_at", { ascending: false })
      .limit(2),
    supabase.from("benchmarks").select("percentile_50").eq("metric", "net_margin").limit(1).maybeSingle(),
  ]);

  const transactions = transactionsResult.data ?? [];
  const cashBalance = (accountsResult.data ?? []).reduce(
    (sum, account) => sum + Number(account.balance ?? 0),
    0,
  );

  const kpis = calculateKpis({
    transactions: transactions.map((transaction) => ({
      date: transaction.date,
      amount: Number(transaction.amount),
      category: transaction.category,
    })),
    cashBalance,
  });

  const previousNetMargin = previousKpisResult.data?.[1]?.net_margin ?? kpis.net_margin;
  const currentNetMargin = kpis.net_margin;

  const expenseByCategory = transactions
    .filter((transaction) => Number(transaction.amount) < 0)
    .reduce((acc, transaction) => {
      const key = transaction.category || "General";
      acc.set(key, (acc.get(key) ?? 0) + Math.abs(Number(transaction.amount)));
      return acc;
    }, new Map<string, number>());

  const topExpense = Array.from(expenseByCategory.values()).sort((a, b) => b - a)[0] ?? 0;
  const secondExpense = Array.from(expenseByCategory.values()).sort((a, b) => b - a)[1] ?? 1;
  const expenseGrowthRate = secondExpense ? topExpense / secondExpense - 1 : 0;

  const alerts = evaluateAlertRules({
    runwayMonths: kpis.runway_months,
    currentNetMargin,
    previousNetMargin,
    expenseGrowthRate,
    hasAnomaly: false,
    hasIdleCapital: cashBalance > kpis.expenses * 4,
    belowBenchmark: currentNetMargin < Number(benchmarkResult.data?.percentile_50 ?? 0),
  });

  if (!alerts.length) {
    return 0;
  }

  const rows = await Promise.all(
    alerts.map(async (alert) => {
      const naturalText = await draftAlertText({
        rule: alert.title,
        companyName: organizationName,
        language: "English",
        metric: alert.triggerValue,
      });

      return {
        organization_id: organizationId,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        body: `${naturalText}\n\nTrigger: ${alert.triggerValue}. Recommendation: ${alert.recommendation}`,
      };
    }),
  );

  await supabase.from("alerts").insert(rows);

  if (ownerUserId) {
    try {
      const authUser = await supabase.auth.admin.getUserById(ownerUserId);
      const email = authUser.data.user?.email;
      if (email) {
        const resend = getResendClient();
        await resend.emails.send({
          from: "alerts@fineloia.ai",
          to: email,
          subject: `Fineloia alerts for ${organizationName}`,
          text: rows.map((row) => `- [${row.severity.toUpperCase()}] ${row.title}`).join("\n"),
        });
      }
    } catch {
      // Skip email failures, keep alert generation.
    }
  }

  return rows.length;
}

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const providedSecret = request.headers.get("x-cron-secret");

    if (cronSecret && cronSecret !== providedSecret) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: organizations, error } = await supabase
      .from("organizations")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    let generated = 0;

    for (const organization of organizations ?? []) {
      const { data: owner } = await supabase
        .from("members")
        .select("user_id")
        .eq("organization_id", organization.id)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      generated += await processOrganization(
        organization.id,
        organization.name,
        owner?.user_id,
      );
    }

    return NextResponse.json({ success: true, generated });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected alert generator error",
      },
      { status: 500 },
    );
  }
}
