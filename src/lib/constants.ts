export const OVERDUE_DAYS = Number(process.env.OVERDUE_DAYS ?? 35);

/** Gmail searches for Standard Bank payment notifications (in + out). */
export const GMAIL_SEARCH_QUERIES = [
  'from:information@standardbank.co.za "was paid to Standard Bank account"',
  'from:information@standardbank.co.za "was paid from Standard Bank account"',
] as const;

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  utilities: "Utilities",
  maintenance: "Maintenance",
  insurance: "Insurance",
  rates: "Rates & taxes",
  cleaning: "Cleaning",
  other: "Other",
};
