import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureOrganizationMember } from "@/lib/auth";
import { calculateKpis } from "@/lib/kpis";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const organizationId = url.searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureOrganizationMember({ userId: user.id, organizationId });

    const [transactionsResult, accountsResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("date, amount, category")
        .eq("organization_id", organizationId)
        .limit(2000),
      supabase.from("accounts").select("balance").eq("organization_id", organizationId),
    ]);

    const transactions = transactionsResult.data ?? [];
    const cashBalance = (accountsResult.data ?? []).reduce(
      (sum, account) => sum + Number(account.balance ?? 0),
      0,
    );

    const kpis = calculateKpis({
      transactions: transactions.map((item) => ({
        date: item.date,
        amount: Number(item.amount),
        category: item.category,
      })),
      cashBalance,
    });

    await supabase.from("kpis").upsert({
      organization_id: organizationId,
      period: kpis.period,
      revenue: kpis.revenue,
      expenses: kpis.expenses,
      gross_margin: kpis.gross_margin,
      operating_margin: kpis.operating_margin,
      net_margin: kpis.net_margin,
      cashflow: kpis.cashflow,
      burn_rate: kpis.burn_rate,
      runway_months: kpis.runway_months,
      arr: kpis.arr,
      mrr: kpis.mrr,
    });

    return NextResponse.json({ data: kpis });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unexpected KPI error",
      },
      { status: 500 },
    );
  }
}
