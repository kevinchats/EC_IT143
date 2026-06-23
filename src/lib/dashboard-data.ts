import { desc, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses, payments } from "@/db/schema";
import { BUSINESS_TAGS, type BusinessTag } from "./business-tags";
import { monthKey, todayIso } from "./money";

export async function getPaymentTotalsByStudent() {
  const db = getDb();
  const rows = await db
    .select({
      studentId: payments.studentId,
      totalCents: sql<number>`sum(${payments.amountCents})`,
      lastPaymentDate: sql<string | null>`max(${payments.paymentDate})`,
    })
    .from(payments)
    .where(sql`${payments.studentId} is not null`)
    .groupBy(payments.studentId);

  return new Map(
    rows.map((r) => [
      r.studentId!,
      {
        totalCents: Number(r.totalCents ?? 0),
        lastPaymentDate: r.lastPaymentDate,
      },
    ]),
  );
}

export async function getMonthlyTotals(month = monthKey(todayIso())) {
  const db = getDb();
  const paymentRows = await db.select().from(payments);
  const expenseRows = await db.select().from(expenses);

  const monthPayments = paymentRows.filter((p) => monthKey(p.paymentDate) === month);
  const incomeCents = monthPayments
    .filter((p) => p.direction === "in")
    .reduce((s, p) => s + p.amountCents, 0);
  const bankOutCents = monthPayments
    .filter((p) => p.direction === "out")
    .reduce((s, p) => s + p.amountCents, 0);
  const manualExpenseCents = expenseRows
    .filter((e) => monthKey(e.expenseDate) === month)
    .reduce((s, e) => s + e.amountCents, 0);

  const expenseCents = bankOutCents + manualExpenseCents;
  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents, month };
}

export async function getAllTimeTotals() {
  const db = getDb();
  const paymentRows = await db.select().from(payments);
  const expenseRows = await db.select().from(expenses);

  const incomeCents = paymentRows
    .filter((p) => p.direction === "in")
    .reduce((s, p) => s + p.amountCents, 0);
  const bankOutCents = paymentRows
    .filter((p) => p.direction === "out")
    .reduce((s, p) => s + p.amountCents, 0);
  const manualExpenseCents = expenseRows.reduce((s, e) => s + e.amountCents, 0);
  const expenseCents = bankOutCents + manualExpenseCents;

  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents };
}

export async function getChartData(monthsBack = 12) {
  const db = getDb();
  const paymentRows = await db.select().from(payments);
  const expenseRows = await db.select().from(expenses);

  const now = new Date();
  const keys: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  return keys.map((month) => {
    const monthPayments = paymentRows.filter((p) => monthKey(p.paymentDate) === month);
    const income = monthPayments
      .filter((p) => p.direction === "in")
      .reduce((s, p) => s + p.amountCents, 0);
    const bankOut = monthPayments
      .filter((p) => p.direction === "out")
      .reduce((s, p) => s + p.amountCents, 0);
    const manual = expenseRows
      .filter((e) => monthKey(e.expenseDate) === month)
      .reduce((s, e) => s + e.amountCents, 0);
    return {
      month,
      label: new Date(month + "-01T12:00:00").toLocaleDateString("en-ZA", {
        month: "short",
        year: "2-digit",
      }),
      income: income / 100,
      expenses: (bankOut + manual) / 100,
    };
  });
}

export async function getRecentPayments(limit = 10) {
  const db = getDb();
  return db
    .select()
    .from(payments)
    .orderBy(desc(payments.paymentDate), desc(payments.id))
    .limit(limit);
}

export async function getRecentExpenses(limit = 10) {
  const db = getDb();
  return db.select().from(expenses).orderBy(desc(expenses.expenseDate)).limit(limit);
}

export async function getExpenseTotalsByCategory(month = monthKey(todayIso())) {
  const db = getDb();
  const rows = await db.select().from(expenses);
  const map = new Map<string, number>();
  for (const e of rows) {
    if (monthKey(e.expenseDate) !== month) continue;
    map.set(e.category, (map.get(e.category) ?? 0) + e.amountCents);
  }
  return map;
}

export type BusinessTagSummary = {
  tag: BusinessTag;
  label: string;
  color: string;
  inCents: number;
  outCents: number;
  netCents: number;
  count: number;
};

export async function getBusinessTagSummaries(
  month = monthKey(todayIso()),
): Promise<BusinessTagSummary[]> {
  const db = getDb();
  const rows = await db.select().from(payments);
  const monthRows = rows.filter((p) => monthKey(p.paymentDate) === month);

  return (Object.keys(BUSINESS_TAGS) as BusinessTag[]).map((tag) => {
    const tagged = monthRows.filter((p) => p.businessTag === tag);
    const inCents = tagged
      .filter((p) => p.direction === "in")
      .reduce((s, p) => s + p.amountCents, 0);
    const outCents = tagged
      .filter((p) => p.direction === "out")
      .reduce((s, p) => s + p.amountCents, 0);
    return {
      tag,
      label: BUSINESS_TAGS[tag].label,
      color: BUSINESS_TAGS[tag].color,
      inCents,
      outCents,
      netCents: inCents - outCents,
      count: tagged.length,
    };
  });
}

export async function getNetTrend(monthsBack = 12) {
  const chart = await getChartData(monthsBack);
  let cumulative = 0;
  return chart.map((m) => {
    cumulative += m.income - m.expenses;
    return {
      label: m.label,
      month: m.month,
      net: m.income - m.expenses,
      cumulative,
    };
  });
}
