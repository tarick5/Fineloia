import { requireUser } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TransactionsManager } from "@/components/dashboard/transactions-manager";

export default async function TransactionsPage() {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("transactions")
    .select("id, organization_id, date, description, amount, category, subcategory, account, currency, source, created_at")
    .eq("organization_id", organization.id)
    .order("date", { ascending: false })
    .limit(500);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Transactions</h1>
      <TransactionsManager organizationId={organization.id} initialTransactions={data ?? []} />
    </div>
  );
}
