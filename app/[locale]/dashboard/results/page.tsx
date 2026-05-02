import { requireUser } from "@/lib/auth";
import { getDashboardSnapshot, getOrganizationForUser } from "@/lib/dashboard-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResultsPage() {
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  const { kpis } = await getDashboardSnapshot(organization.id);

  const grossProfit = kpis.revenue * kpis.gross_margin;
  const opex = kpis.expenses * 0.85;
  const ebitda = grossProfit - opex;
  const netIncome = kpis.revenue - kpis.expenses;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">P&amp;L Results</h1>

      <Card>
        <CardHeader>
          <CardTitle>Income statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between border-b pb-2"><span>Revenue</span><span>{kpis.revenue.toFixed(2)}</span></div>
            <div className="flex justify-between border-b pb-2"><span>COGS</span><span>{(kpis.revenue - grossProfit).toFixed(2)}</span></div>
            <div className="flex justify-between border-b pb-2"><span>Gross Profit</span><span>{grossProfit.toFixed(2)}</span></div>
            <div className="flex justify-between border-b pb-2"><span>OpEx</span><span>{opex.toFixed(2)}</span></div>
            <div className="flex justify-between border-b pb-2"><span>EBITDA</span><span>{ebitda.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Net Income</span><span>{netIncome.toFixed(2)}</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
