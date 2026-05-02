import { createSupabaseServerClient } from "@/lib/supabase/server";
import { calculateKpis } from "@/lib/kpis";
import type { Organization } from "@/types/domain";

export async function getOrganizationForUser(
  userId: string,
): Promise<Organization | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("members")
    .select("organization_id, organizations(*)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error || !data || !data.organizations) {
    return null;
  }

  const organization = Array.isArray(data.organizations)
    ? data.organizations[0]
    : data.organizations;

  if (!organization) {
    return null;
  }

  return organization as Organization;
}

export async function getDashboardSnapshot(organizationId: string) {
  const supabase = createSupabaseServerClient();

  const [transactionsResult, accountsResult, alertsResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("id, organization_id, date, description, amount, category, subcategory, account, currency, source, created_at")
      .eq("organization_id", organizationId)
      .order("date", { ascending: false })
      .limit(1000),
    supabase
      .from("accounts")
      .select("balance")
      .eq("organization_id", organizationId),
    supabase
      .from("alerts")
      .select("id, organization_id, type, severity, title, body, is_read, created_at")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const transactions = transactionsResult.data ?? [];
  const accounts = accountsResult.data ?? [];
  const alerts = alertsResult.data ?? [];

  const cashBalance = accounts.reduce((sum, account) => sum + Number(account.balance ?? 0), 0);

  const kpis = calculateKpis({
    transactions: transactions.map((transaction) => ({
      date: transaction.date,
      amount: Number(transaction.amount),
      category: transaction.category,
    })),
    cashBalance,
  });

  return {
    transactions,
    alerts,
    kpis,
    cashBalance,
  };
}
