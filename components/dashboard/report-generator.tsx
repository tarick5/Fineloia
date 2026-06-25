"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function ReportGenerator({ organizationId }: { organizationId: string }) {
  const [type, setType] = useState("Monthly Executive");
  const [periodStart, setPeriodStart] = useState(new Date().toISOString().slice(0, 10));
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    const response = await fetch("/api/reports/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId, type, periodStart, periodEnd }),
    });

    const json = (await response.json()) as { data?: { ai_analysis?: string }; error?: string };
    setResult(json.data?.ai_analysis ?? json.error ?? "Could not generate report.");
    setLoading(false);
  }

  function exportPdf() {
    if (!result) {
      return;
    }

    const reportWindow = window.open("", "_blank", "width=900,height=700");
    if (!reportWindow) {
      return;
    }

    const title = `${type} report`;
    reportWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>${escapeHtml(title)}</title>
          <style>
            body {
              color: #0b1a2b;
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 40px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 8px;
            }
            p {
              color: #44648a;
              margin-top: 0;
            }
            pre {
              font-family: Arial, sans-serif;
              white-space: pre-wrap;
              word-break: break-word;
            }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(periodStart)} to ${escapeHtml(periodEnd)}</p>
          <pre>${escapeHtml(result)}</pre>
        </body>
      </html>`);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Label>Type</Label>
            <Select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="Monthly Executive">Monthly Executive</option>
              <option value="Quarterly Detailed">Quarterly Detailed</option>
              <option value="Annual Full">Annual Full</option>
              <option value="Investor Report">Investor Report</option>
              <option value="Bank Report">Bank Report</option>
              <option value="Custom">Custom</option>
            </Select>
          </div>
          <div>
            <Label>Period start</Label>
            <Input type="date" value={periodStart} onChange={(event) => setPeriodStart(event.target.value)} />
          </div>
          <div>
            <Label>Period end</Label>
            <Input type="date" value={periodEnd} onChange={(event) => setPeriodEnd(event.target.value)} />
          </div>
          <div className="flex items-end">
            <Button disabled={loading} onClick={generateReport}>
              {loading ? "..." : "Generate"}
            </Button>
          </div>
        </div>
        {result ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={exportPdf}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
