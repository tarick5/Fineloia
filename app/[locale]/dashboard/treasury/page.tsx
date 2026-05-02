import { requireUser } from "@/lib/auth";
import { getDashboardSnapshot, getOrganizationForUser } from "@/lib/dashboard-data";
import { CashProjectionChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TreasuryPage() {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  const snapshot = await getDashboardSnapshot(organization.id);

  const projection = Array.from({ length: 90 }).map((_, index) => ({
    day: `${index + 1}`,
    balance: snapshot.cashBalance + snapshot.kpis.cashflow * (index / 30),
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Treasury</h1>

      <Card>
        <CardHeader>
          <CardTitle>90-day cash projection</CardTitle>
        </CardHeader>
        <CardContent>
          <CashProjectionChart data={projection} />
        </CardContent>
      </Card>

      {snapshot.kpis.runway_months < 3 ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm text-red-900">
            Runway is below 3 months. Review fixed costs and accelerate receivables.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
