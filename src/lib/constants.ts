export const OVERDUE_DAYS = Number(process.env.OVERDUE_DAYS ?? 35);

export const GMAIL_SEARCH_QUERY =
  'from:noreply@standardbank.co.za subject:"Payment confirmation"';

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  utilities: "Utilities",
  maintenance: "Maintenance",
  insurance: "Insurance",
  rates: "Rates & taxes",
  cleaning: "Cleaning",
  other: "Other",
};
