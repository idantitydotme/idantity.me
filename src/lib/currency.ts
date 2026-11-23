export const BASE_CURRENCY = "BRL";

export interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

export const CURRENCIES: { code: string; label: string }[] = [
  { code: "BRL", label: "app.text.brl-brazilian-real-r" },
  { code: "USD", label: "app.text.usd-us-dollar" },
  { code: "CAD", label: "app.text.cad-canadian-dollar" },
  { code: "GBP", label: "app.text.gbp-british-pound" },
  { code: "EUR", label: "app.text.eur-euro" },
  { code: "RON", label: "app.text.ron-romanian-leu-lei" },
];

export const RATES_URL = `https://api.frankfurter.dev/v1/latest?from=${BASE_CURRENCY}&to=${CURRENCIES.filter(
  (c) => c.code !== BASE_CURRENCY,
)
  .map((c) => c.code)
  .join(",")}`;

export async function fetchRates(): Promise<ExchangeRates | null> {
  try {
    const res = await fetch(RATES_URL);
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    if (!data?.rates || typeof data.rates !== "object") return null;
    return {
      base: data.base || BASE_CURRENCY,
      date: data.date || "",
      rates: data.rates,
    };
  } catch {
    return null;
  }
}

// rates[code] = amount of `code` per 1 BASE_CURRENCY (BRL).
export function convertToBRL(
  amount: number,
  currency: string,
  rates: Record<string, number> | null | undefined,
): number | null {
  const from = (currency || BASE_CURRENCY).toUpperCase();
  if (from === BASE_CURRENCY) return amount;
  const rate = rates?.[from];
  if (!rate || rate <= 0) return null;
  return amount / rate;
}

export function convertBetween(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number> | null | undefined,
): number | null {
  const fromCode = (from || BASE_CURRENCY).toUpperCase();
  const toCode = (to || BASE_CURRENCY).toUpperCase();
  if (fromCode === toCode) return amount;
  const inBRL = convertToBRL(amount, fromCode, rates);
  if (inBRL === null) return null;
  if (toCode === BASE_CURRENCY) return inBRL;
  const toRate = rates?.[toCode];
  if (!toRate || toRate <= 0) return null;
  return inBRL * toRate;
}

export function formatAmount(amount: number): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

export function formatMoney(amount: number, currency: string): string {
  const code = (currency || BASE_CURRENCY).toUpperCase();
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
