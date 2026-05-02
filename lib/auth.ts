import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getUserOrganizationIds(userId: string): Promise<string[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("members")
    .select("organization_id")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }

  return data.map((row) => row.organization_id);
}

export async function ensureOrganizationMember({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId: string;
}) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", userId)
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Unauthorized organization access");
  }

  return true;
}

export async function getPrimaryOrganization(userId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("members")
    .select(
      "organization_id, organizations(id, name, country, currency, sector, size, plan, billing_cycle, trial_ends_at)",
    )
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.organizations;
}
