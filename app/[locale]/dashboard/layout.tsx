import { requireUser } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/dashboard-data";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return (
      <div className="container py-20">
        <Card className="mx-auto max-w-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold">No organization found</h2>
            <p className="mt-2 text-muted-foreground">
              Complete onboarding to create your first organization.
            </p>
            <Link href="/register" className="mt-6 inline-block">
              <Button>Create organization</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const { count } = await supabase
    .from("alerts")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organization.id)
    .eq("is_read", false);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-[#f8fbff] to-[#edf4ff]">
      <DashboardSidebar alertCount={count ?? 0} organizationName={organization.name} />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[#d3e2fb] bg-white/80 px-6 py-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Organization</p>
              <p className="font-semibold text-[#0b1a2b]">{organization.name}</p>
            </div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
