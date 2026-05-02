import { requireUser } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/dashboard-data";
import { AdvisorChat } from "@/components/dashboard/advisor-chat";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdvisorPage() {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  let remainingMessages: number | "unlimited" = "unlimited";
  if (organization.plan === "starter") {
    const supabase = createSupabaseServerClient();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organization.id)
      .eq("user_id", user.id)
      .gte("created_at", monthStart.toISOString());

    remainingMessages = Math.max(0, 50 - (count ?? 0));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">AI Advisor</h1>
      <AdvisorChat organizationId={organization.id} remainingMessages={remainingMessages} />
    </div>
  );
}
