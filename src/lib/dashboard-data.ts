import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses, payments, rooms, students } from "@/db/schema";
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

  const incomeCents = paymentRows
    .filter((p) => monthKey(p.paymentDate) === month)
    .reduce((s, p) => s + p.amountCents, 0);

  const expenseCents = expenseRows
    .filter((e) => monthKey(e.expenseDate) === month)
    .reduce((s, e) => s + e.amountCents, 0);

  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents, month };
}

export async function getAllTimeTotals() {
  const db = getDb();
  const [paymentSum] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amountCents}), 0)` })
    .from(payments);
  const [expenseSum] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)` })
    .from(expenses);
  const incomeCents = Number(paymentSum?.total ?? 0);
  const expenseCents = Number(expenseSum?.total ?? 0);
  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents };
}

export async function getChartData(monthsBack = 6) {
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
    const income = paymentRows
      .filter((p) => monthKey(p.paymentDate) === month)
      .reduce((s, p) => s + p.amountCents, 0);
    const expense = expenseRows
      .filter((e) => monthKey(e.expenseDate) === month)
      .reduce((s, e) => s + e.amountCents, 0);
    return {
      month,
      label: new Date(month + "-01T12:00:00").toLocaleDateString("en-ZA", {
        month: "short",
        year: "2-digit",
      }),
      income: income / 100,
      expenses: expense / 100,
    };
  });
}

export async function getRecentPayments(limit = 10) {
  const db = getDb();
  return db
    .select({
      payment: payments,
      student: students,
      room: rooms,
    })
    .from(payments)
    .leftJoin(students, eq(payments.studentId, students.id))
    .leftJoin(rooms, eq(students.roomId, rooms.id))
    .orderBy(desc(payments.paymentDate), desc(payments.id))
    .limit(limit);
}

export async function getRecentExpenses(limit = 10) {
  const db = getDb();
  return db
    .select({
      expense: expenses,
      room: rooms,
    })
    .from(expenses)
    .leftJoin(rooms, eq(expenses.roomId, rooms.id))
    .orderBy(desc(expenses.expenseDate), desc(expenses.id))
    .limit(limit);
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

export async function getPaymentsByPayer(limit = 10) {
  const db = getDb();
  const rows = await db
    .select({
      payerLabel: payments.payerLabel,
      totalCents: sql<number>`sum(${payments.amountCents})`,
      count: sql<number>`count(*)`,
      lastDate: sql<string | null>`max(${payments.paymentDate})`,
    })
    .from(payments)
    .groupBy(payments.payerLabel)
    .orderBy(desc(sql`sum(${payments.amountCents})`))
    .limit(limit);

  return rows.map((r) => ({
    payer: r.payerLabel,
    totalCents: Number(r.totalCents ?? 0),
    count: Number(r.count ?? 0),
    lastDate: r.lastDate,
  }));
}

export async function getNetTrend(monthsBack = 12) {
  const chart = await getChartData(monthsBack);
  let cumulative = 0;
  return chart.map((m) => {
    cumulative += m.income - m.expenses;
    return {
      label: m.label,
      month: m.month,
      net: (m.income - m.expenses),
      cumulative,
    };
  });
}

export async function getMonthlyPaymentCount(monthsBack = 12) {
  const db = getDb();
  const paymentRows = await db.select().from(payments);
  const now = new Date();
  const keys: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  }
  return keys.map((month) => ({
    month,
    label: new Date(month + "-01T12:00:00").toLocaleDateString("en-ZA", {
      month: "short",
      year: "2-digit",
    }),
    count: paymentRows.filter((p) => monthKey(p.paymentDate) === month).length,
  }));
}
