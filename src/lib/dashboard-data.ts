import { desc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  expenses,
  payments,
  rooms,
  students,
} from "@/db/schema";
import {
  computeBalanceCents,
  computeExpectedCents,
  isOverdue,
} from "./balances";
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
    .groupBy(payments.studentId);

  return new Map(
    rows.map((r) => [
      r.studentId,
      {
        totalCents: Number(r.totalCents ?? 0),
        lastPaymentDate: r.lastPaymentDate,
      },
    ]),
  );
}

export async function getRoomDashboardRows() {
  const db = getDb();
  const roomRows = await db
    .select()
    .from(rooms)
    .orderBy(rooms.sortOrder, rooms.label);
  const studentRows = await db
    .select()
    .from(students)
    .where(eq(students.active, true));
  const paidMap = await getPaymentTotalsByStudent();
  const today = todayIso();

  return roomRows.map((room) => {
    const student = studentRows.find((s) => s.roomId === room.id);
    if (!student) {
      return {
        room,
        student: null,
        expectedCents: 0,
        paidCents: 0,
        balanceCents: 0,
        lastPaymentDate: null,
        overdue: false,
      };
    }
    const paid = paidMap.get(student.id)?.totalCents ?? 0;
    const lastPaymentDate = paidMap.get(student.id)?.lastPaymentDate ?? null;
    const balanceCents = computeBalanceCents(student, paid, today);
    return {
      room,
      student,
      expectedCents: computeExpectedCents(student, today),
      paidCents: paid,
      balanceCents,
      lastPaymentDate,
      overdue: isOverdue(balanceCents, lastPaymentDate, today),
    };
  });
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
    .innerJoin(students, eq(payments.studentId, students.id))
    .innerJoin(rooms, eq(students.roomId, rooms.id))
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
