import { startOfMonth, endOfMonth, format } from "date-fns";

type InputTransaction = {
  date: string;
  amount: number;
  category: string;
};

type KPIResult = {
  period: string;
  revenue: number;
  expenses: number;
  gross_margin: number;
  operating_margin: number;
  net_margin: number;
  cashflow: number;
  burn_rate: number;
  runway_months: number;
  arr: number;
  mrr: number;
};

function safeDiv(numerator: number, denominator: number) {
  if (!denominator) {
    return 0;
  }
  return numerator / denominator;
}

export function calculateKpis({
  transactions,
  cashBalance,
  periodDate,
}: {
  transactions: InputTransaction[];
  cashBalance: number;
  periodDate?: Date;
}): KPIResult {
  const referenceDate = periodDate ?? new Date();
  const periodStart = startOfMonth(referenceDate);
  const periodEnd = endOfMonth(referenceDate);

  const monthlyTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date >= periodStart && date <= periodEnd;
  });

  const revenue = monthlyTransactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const expenses = Math.abs(
    monthlyTransactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  );

  const cogs = Math.abs(
    monthlyTransactions
      .filter((transaction) => transaction.category.toLowerCase() === "cmv")
      .reduce((sum, transaction) => sum + Math.min(transaction.amount, 0), 0),
  );

  const grossProfit = revenue - cogs;
  const operatingProfit = revenue - expenses * 0.85;
  const netProfit = revenue - expenses;

  const burnRate = expenses;
  const runwayMonths = burnRate ? cashBalance / burnRate : 0;

  const mrr = revenue;
  const arr = mrr * 12;

  return {
    period: format(periodStart, "yyyy-MM-dd"),
    revenue,
    expenses,
    gross_margin: safeDiv(grossProfit, revenue),
    operating_margin: safeDiv(operatingProfit, revenue),
    net_margin: safeDiv(netProfit, revenue),
    cashflow: revenue - expenses,
    burn_rate: burnRate,
    runway_months: runwayMonths,
    arr,
    mrr,
  };
}

export function buildMonthlySeries(transactions: InputTransaction[], months = 12) {
  const today = new Date();

  return Array.from({ length: months }).map((_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (months - 1 - index), 1);
    const monthKey = format(date, "yyyy-MM");

    const monthTransactions = transactions.filter(
      (transaction) => transaction.date.slice(0, 7) === monthKey,
    );

    const revenue = monthTransactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const expenses = Math.abs(
      monthTransactions
        .filter((transaction) => transaction.amount < 0)
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    );

    return {
      month: format(date, "LLL yy"),
      revenue,
      expenses,
    };
  });
}
