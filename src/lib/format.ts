export function formatCurrency(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(cents / 100);
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "N/A";
  }

  const date = typeof value === "string" ? new Date(value) : value;

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

export function formatRelativeDays(days: number) {
  if (days === 1) {
    return "1 day";
  }

  return `${days} days`;
}

