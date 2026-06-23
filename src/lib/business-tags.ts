export const BUSINESS_TAGS = {
  uncategorized: { label: "Uncategorized", color: "#8b98a5" },
  accommodation: { label: "Student accommodation", color: "#00ba7c" },
  chatcom: { label: "Chatcom Telecoms", color: "#7856ff" },
} as const;

export type BusinessTag = keyof typeof BUSINESS_TAGS;

export function isBusinessTag(v: string): v is BusinessTag {
  return v in BUSINESS_TAGS;
}

/** Collapse noisy bank refs so duplicates pair correctly (e.g. Cursor variants). */
export function normalizeCounterparty(counterparty: string): string {
  const l = counterparty.toLowerCase().replace(/\s+/g, " ").trim();
  if (/cursor/.test(l)) return "cursor";
  if (/session telecom/.test(l)) return "session telecoms";
  if (/chatcom|vhatt?com/.test(l)) return "chatcom";
  if (/city of johannesburg|johannesburg metro/.test(l)) return "city of johannesburg";
  if (/dudumashe/.test(l)) return "e dudumashe";
  if (/damoyi/.test(l)) return "p damoyi";
  if (/mihle/.test(l)) return "mihle";
  if (/songezo/.test(l)) return "songezo";
  if (/mike.*rent|\bmike\b/.test(l)) return "mike rent";
  return l;
}

export function autoTag(counterparty: string): BusinessTag {
  const n = normalizeCounterparty(counterparty);
  if (
    /session telecom|cursor|chatcom|vhatt?com|^business$|business loan/.test(n) ||
    (/\bbusiness\b/.test(n) && !/business account/.test(n))
  ) {
    return "chatcom";
  }
  if (
    /dudumashe|songezo|mike|damoyi|mihle|\brent\b|city of johannesburg|capitec|absa|gerry/.test(
      n,
    )
  ) {
    return "accommodation";
  }
  return "uncategorized";
}

/** Incoming alerts that are never real income — card reversals / mirror notifications. */
export function isExpenseOnlyIncoming(counterparty: string): boolean {
  const n = normalizeCounterparty(counterparty);
  return /cursor/.test(n);
}

export function pairKey(
  date: string,
  amountCents: number,
  counterparty: string,
): string {
  return `${date}|${amountCents}|${normalizeCounterparty(counterparty)}`;
}

export function paymentDedupeKey(
  direction: "in" | "out",
  date: string,
  amountCents: number,
  counterparty: string,
): string {
  return `${direction}|${pairKey(date, amountCents, counterparty)}`;
}

/** When both in+out exist for the same transfer, which direction to drop. */
export function mirrorDirectionToDrop(tag: BusinessTag): "in" | "out" {
  return tag === "accommodation" ? "out" : "in";
}
