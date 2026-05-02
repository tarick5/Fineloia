import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string;
  change?: string;
};

export function MetricCard({ title, value, change }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {change ? <p className="mt-1 text-xs text-muted-foreground">{change}</p> : null}
      </CardContent>
    </Card>
  );
}
