"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function ForecastGenerator({ organizationId }: { organizationId: string }) {
  const [type, setType] = useState("Revenue");
  const [horizon, setHorizon] = useState("12");
  const [scenario, setScenario] = useState("realistic");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateForecast() {
    setLoading(true);

    const response = await fetch("/api/forecasts/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        type,
        period: `${horizon} months`,
        scenario,
      }),
    });

    const json = (await response.json()) as {
      data?: { data?: Array<{ month: number; value: number }> };
      error?: string;
    };

    if (json.data?.data?.length) {
      const preview = json.data.data
        .slice(0, 3)
        .map((row) => `M${row.month}: ${row.value}`)
        .join(" · ");
      setResult(`Forecast generated. Preview: ${preview}`);
    } else {
      setResult(json.error ?? "Could not generate forecast.");
    }

    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate forecast</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Type</Label>
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="Revenue">Revenue</option>
              <option value="Expenses">Expenses</option>
              <option value="Treasury">Treasury</option>
              <option value="Growth">Growth</option>
            </Select>
          </div>
          <div>
            <Label>Horizon (months)</Label>
            <Select value={horizon} onChange={(event) => setHorizon(event.target.value)}>
              <option value="3">3</option>
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
            </Select>
          </div>
          <div>
            <Label>Scenario</Label>
            <Select value={scenario} onChange={(event) => setScenario(event.target.value)}>
              <option value="conservative">Conservative</option>
              <option value="realistic">Realistic</option>
              <option value="optimistic">Optimistic</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button disabled={loading} onClick={generateForecast}>
              {loading ? "..." : "Generate"}
            </Button>
          </div>
        </div>

        {result ? <p className="text-sm text-muted-foreground">{result}</p> : null}
      </CardContent>
    </Card>
  );
}
