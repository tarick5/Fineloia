import { requireUser } from "@/lib/auth";
import { getOrganizationForUser } from "@/lib/dashboard-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AlertsPage() {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("alerts")
    .select("id, title, body, severity, type, is_read, created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Alerts</h1>
      <div className="space-y-3">
        {(data ?? []).map((alert) => (
          <Card key={alert.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <span>{alert.title}</span>
                <Badge
                  variant={
                    alert.severity === "critical"
                      ? "critical"
                      : alert.severity === "warning"
                        ? "warning"
                        : "secondary"
                  }
                >
                  {alert.severity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{alert.body}</p>
              <p>
                Trigger type: <strong>{alert.type}</strong> · {new Date(alert.created_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
