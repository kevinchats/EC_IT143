import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses } from "@/db/schema";
import {
  BusinessTagBoard,
  type BoardItem,
} from "@/components/BusinessTagBoard";
import { centsToRand } from "@/lib/money";
import { ManualExpenseForm } from "./ManualExpenseForm";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const db = getDb();
  const expenseRows = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.expenseDate), desc(expenses.id));

  const boardItems: BoardItem[] = expenseRows.map((e) => ({
    id: e.id,
    kind: "expense" as const,
    title: e.description,
    businessTag: e.businessTag,
    amountCents: e.amountCents,
    date: e.expenseDate,
    manual: true,
  }));

  const totalCents = expenseRows.reduce((s, e) => s + e.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Manual expenses</h1>
        <p className="text-[var(--muted)]">
          Drag expenses into a business category, or remove them entirely.
        </p>
      </div>

      <div className="card">
        <p className="stat-label">Total manual expenses</p>
        <p className="stat-value text-[var(--negative)]">{centsToRand(totalCents)}</p>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Categorise expenses</h2>
        <BusinessTagBoard items={boardItems} emptyHint="Drop expenses here" />
      </div>

      <details className="card" open>
        <summary className="cursor-pointer text-lg font-semibold">Add manual expense</summary>
        <div className="mt-4 max-w-lg">
          <ManualExpenseForm />
        </div>
      </details>
    </div>
  );
}
