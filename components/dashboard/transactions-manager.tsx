"use client";

import { useMemo, useState } from "react";
import type { Transaction } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TransactionsManager({
  organizationId,
  initialTransactions,
}: {
  organizationId: string;
  initialTransactions: Transaction[];
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [csvText, setCsvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    category: "General",
    account: "Main",
    currency: "USD",
  });

  const sortedTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );

  async function handleCreateTransaction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      organizationId,
      date: form.date,
      description: form.description,
      amount: Number(form.amount),
      category: form.category,
      account: form.account,
      currency: form.currency,
    };

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = (await response.json()) as { data?: Transaction; error?: string };

    if (!response.ok || !json.data) {
      setError(json.error ?? "Could not create transaction.");
      setLoading(false);
      return;
    }

    setTransactions((prev) => [json.data!, ...prev]);
    setForm((prev) => ({ ...prev, description: "", amount: "" }));
    setLoading(false);
  }

  async function handleImportCsv() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/transactions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId,
        csv: csvText,
      }),
    });

    const json = (await response.json()) as {
      data?: Transaction[];
      error?: string;
    };

    if (!response.ok || !json.data) {
      setError(json.error ?? "Could not import CSV.");
      setLoading(false);
      return;
    }

    setTransactions((prev) => [...json.data!, ...prev]);
    setCsvText("");
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add transaction manually</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateTransaction}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={form.amount}
                    onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  required
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account</Label>
                  <Input
                    id="account"
                    value={form.account}
                    onChange={(event) => setForm((prev) => ({ ...prev, account: event.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    id="currency"
                    value={form.currency}
                    onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BRL">BRL</option>
                    <option value="AOA">AOA</option>
                  </Select>
                </div>
              </div>

              <Button disabled={loading} type="submit">
                {loading ? "..." : "Add transaction"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import CSV</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste CSV with headers `date,description,amount,category,account,currency`.
            </p>
            <textarea
              className="min-h-[220px] w-full rounded-md border border-input bg-background p-3 text-sm"
              value={csvText}
              onChange={(event) => setCsvText(event.target.value)}
              placeholder="date,description,amount,category,account,currency"
            />
            <Button disabled={loading || !csvText.trim()} onClick={handleImportCsv} type="button">
              {loading ? "..." : "Import CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.account}</TableCell>
                  <TableCell className="text-right">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
