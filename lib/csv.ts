import Papa from "papaparse";

export type ParsedTransactionRow = {
  date: string;
  description: string;
  amount: number;
  category: string;
  account: string;
  currency: string;
};

function autoCategory(description: string): string {
  const value = description.toLowerCase();

  if (value.includes("salary") || value.includes("payroll")) return "Payroll";
  if (value.includes("rent")) return "Rent";
  if (value.includes("ads") || value.includes("marketing")) return "Marketing";
  if (value.includes("tax")) return "Tax";
  if (value.includes("sale") || value.includes("invoice")) return "Revenue";

  return "General";
}

export function parseTransactionsCsv(csv: string): ParsedTransactionRow[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row) => {
    const description = row.description ?? row.Description ?? "";
    const rawAmount = row.amount ?? row.Amount ?? "0";
    const amount = Number(String(rawAmount).replace(/,/g, ""));

    return {
      date: row.date ?? row.Date ?? new Date().toISOString().slice(0, 10),
      description,
      amount: Number.isFinite(amount) ? amount : 0,
      category: row.category ?? row.Category ?? autoCategory(description),
      account: row.account ?? row.Account ?? "Default",
      currency: row.currency ?? row.Currency ?? "USD",
    };
  });
}
