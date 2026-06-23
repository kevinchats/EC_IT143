export const BUSINESS_TAGS = {
  uncategorized: { label: "Uncategorized", color: "#8b98a5" },
  accommodation: { label: "Student accommodation", color: "#00ba7c" },
  chatcom: { label: "Chatcom Telecoms", color: "#7856ff" },
} as const;

export type BusinessTag = keyof typeof BUSINESS_TAGS;

export function isBusinessTag(v: string): v is BusinessTag {
  return v in BUSINESS_TAGS;
}

/** Auto-tag from bank reference — only Chatcom-related; rest stays uncategorized for drag-sort. */
export function autoTag(counterparty: string): BusinessTag {
  const l = counterparty.toLowerCase();
  if (/session telecom|cursor|chatcom/.test(l)) return "chatcom";
  return "uncategorized";
}

export function paymentDedupeKey(
  direction: "in" | "out",
  date: string,
  amountCents: number,
  counterparty: string,
): string {
  const ref = counterparty.toLowerCase().replace(/\s+/g, " ").trim();
  return `${direction}|${date}|${amountCents}|${ref}`;
}
