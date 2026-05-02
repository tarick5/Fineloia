import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/auth";
import { getDashboardSnapshot, getOrganizationForUser } from "@/lib/dashboard-data";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { buildMonthlySeries } from "@/lib/kpis";
import { MetricCard } from "@/components/dashboard/metric-card";
import {
  RevenueExpensesChart,
  RevenueSourceChart,
  TopExpensesChart,
} from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

export default async function DashboardOverviewPage({
  params,
}: {
  params: { locale: string };
}) {
  const t = await getTranslations("dashboard.overview");
  const user = await requireUser();
  const organization = await getOrganizationForUser(user.id);

  if (!organization) {
    return null;
  }

  const snapshot = await getDashboardSnapshot(organization.id);
  const locale = params.locale === "ar" ? "ar" : params.locale;

  const monthlySeries = buildMonthlySeries(
    snapshot.transactions.map((transaction) => ({
      date: transaction.date,
      amount: Number(transaction.amount),
      category: transaction.category,
    })),
  );

  const topExpenseCategories = Array.from(
    snapshot.transactions
      .filter((transaction) => Number(transaction.amount) < 0)
      .reduce((acc, transaction) => {
        const key = transaction.category || "General";
        acc.set(key, (acc.get(key) ?? 0) + Math.abs(Number(transaction.amount)));
        return acc;
      }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  const revenueSources = Array.from(
    snapshot.transactions
      .filter((transaction) => Number(transaction.amount) > 0)
      .reduce((acc, transaction) => {
        const key = transaction.category || "Revenue";
        acc.set(key, (acc.get(key) ?? 0) + Number(transaction.amount));
        return acc;
      }, new Map<string, number>()),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, value]) => ({ source, value }));

  const kpis = snapshot.kpis;

  const recommendation =
    kpis.runway_months < 3
      ? "Reduce fixed burn by at least 15% and accelerate receivables collection in the next 2 weeks."
      : "Protect margin by reviewing the top 2 expense categories and set weekly spend thresholds.";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex gap-2">
          <Select defaultValue={organization.currency} className="w-[120px]">
            <option value={organization.currency}>{organization.currency}</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </Select>
          <Select defaultValue="month" className="w-[160px]">
            <option value="month">Month</option>
            <option value="quarter">Quarter</option>
            <option value="year">Year</option>
            <option value="custom">Custom</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Revenue"
          value={formatCurrency(kpis.revenue, organization.currency, locale)}
          change="Current period"
        />
        <MetricCard
          title="Expenses"
          value={formatCurrency(kpis.expenses, organization.currency, locale)}
          change="Current period"
        />
        <MetricCard title="Net Margin" value={formatPercent(kpis.net_margin)} />
        <MetricCard
          title="Treasury"
          value={formatCurrency(snapshot.cashBalance, organization.currency, locale)}
        />
        <MetricCard title="Runway" value={`${kpis.runway_months.toFixed(1)} months`} />
        <MetricCard
          title="Active Clients"
          value={String(new Set(snapshot.transactions.filter((row) => row.amount > 0).map((row) => row.account)).size)}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Expenses (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueExpensesChart data={monthlySeries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 expense categories</CardTitle>
          </CardHeader>
          <CardContent>
            <TopExpensesChart data={topExpenseCategories} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue source distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueSourceChart data={revenueSources} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("latestAlerts")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent alerts.</p>
            ) : (
              snapshot.alerts.map((alert) => (
                <div key={alert.id} className="rounded-lg border border-border p-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{alert.title}</p>
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
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.body}</p>
                </div>
              ))
            )}
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
              <p className="text-xs font-semibold uppercase text-primary">{t("recommendation")}</p>
              <p className="mt-1 text-sm">{recommendation}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
