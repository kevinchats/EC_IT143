export function centsToRand(cents: number): string {
  return (cents / 100).toLocaleString("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  });
}

export function randToCents(input: string | number): number {
  if (typeof input === "number") return Math.round(input * 100);
  const n = parseFloat(String(input).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function formatDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}
