export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "AOA",
  "BRL",
  "MZN",
  "CVE",
  "STN",
  "GHS",
  "NGN",
  "KES",
  "ZAR",
  "MAD",
  "EGP",
  "INR",
  "JPY",
  "CNY",
  "AED",
  "SAR",
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export async function convertCurrency({
  amount,
  from,
  to,
}: {
  amount: number;
  from: string;
  to: string;
}) {
  if (from === to) {
    return amount;
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    return amount;
  }

  const response = await fetch(
    `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`,
    { next: { revalidate: 1800 } },
  );

  if (!response.ok) {
    return amount;
  }

  const result = (await response.json()) as { conversion_result?: number };
  return result.conversion_result ?? amount;
}
