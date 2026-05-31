import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses, rooms } from "@/db/schema";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { ExpenseManager } from "./ExpenseManager";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const db = getDb();
  const expenseRows = await db
    .select({
      expense: expenses,
      room: rooms,
    })
    .from(expenses)
    .leftJoin(rooms, eq(expenses.roomId, rooms.id))
    .orderBy(desc(expenses.expenseDate), desc(expenses.id));

  const roomRows = await db
    .select()
    .from(rooms)
    .orderBy(asc(rooms.sortOrder), asc(rooms.label));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Expenses</h1>
        <p className="text-[var(--muted)]">
          Manually record property costs. Leave room empty for shared expenses.
        </p>
      </div>

      <ExpenseManager
        initialExpenses={expenseRows.map((r) => ({
          id: r.expense.id,
          expenseDate: r.expense.expenseDate,
          amountCents: r.expense.amountCents,
          category: r.expense.category,
          description: r.expense.description,
          roomId: r.expense.roomId,
          roomLabel: r.room?.label ?? null,
        }))}
        rooms={roomRows.map((r) => ({ id: r.id, label: r.label }))}
        categoryLabels={EXPENSE_CATEGORY_LABELS}
      />
    </div>
  );
}
