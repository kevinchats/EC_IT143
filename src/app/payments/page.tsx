import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { expenses, payments } from "@/db/schema";
import {
  BusinessTagBoard,
  type BoardItem,
} from "@/components/BusinessTagBoard";
import { centsToRand } from "@/lib/money";
import { ManualExpenseForm } from "./ManualExpenseForm";
import { ManualPaymentForm } from "./ManualPaymentForm";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const db = getDb();
  const [paymentRows, expenseRows] = await Promise.all([
    db.select().from(payments).orderBy(desc(payments.paymentDate), desc(payments.id)),
    db.select().from(expenses).orderBy(desc(expenses.expenseDate), desc(expenses.id)),
  ]);

  const paymentItems: BoardItem[] = paymentRows.map((p) => ({
    id: p.id,
    kind: "payment",
    title: p.payerLabel,
    businessTag: p.businessTag,
    amountCents: p.amountCents,
    date: p.paymentDate,
    direction: p.direction,
    manual: p.source === "manual",
  }));

  const expenseItems: BoardItem[] = expenseRows.map((e) => ({
    id: e.id,
    kind: "expense",
    title: e.description,
    businessTag: e.businessTag,
    amountCents: e.amountCents,
    date: e.expenseDate,
    manual: true,
  }));

  const boardItems = [...paymentItems, ...expenseItems].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  const bankIn = paymentRows
    .filter((p) => p.direction === "in")
    .reduce((s, p) => s + p.amountCents, 0);
  const bankOut = paymentRows
    .filter((p) => p.direction === "out")
    .reduce((s, p) => s + p.amountCents, 0);
  const manualExpenseTotal = expenseRows.reduce((s, e) => s + e.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-[var(--muted)]">
          Bank sync plus manual entries — drag into a business category. Manual items can be removed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="stat-label">Bank money in</p>
          <p className="stat-value text-[var(--positive)]">{centsToRand(bankIn)}</p>
        </div>
        <div className="card">
          <p className="stat-label">Bank money out</p>
          <p className="stat-value text-[var(--negative)]">{centsToRand(bankOut)}</p>
        </div>
        <div className="card">
          <p className="stat-label">Manual expenses</p>
          <p className="stat-value text-[var(--negative)]">
            {centsToRand(manualExpenseTotal)}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">All transactions</h2>
        <BusinessTagBoard items={boardItems} emptyHint="Drop items here" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <details className="card">
          <summary className="cursor-pointer text-lg font-semibold">
            Add manual transaction
          </summary>
          <div className="mt-4">
            <ManualPaymentForm />
          </div>
        </details>
        <details className="card">
          <summary className="cursor-pointer text-lg font-semibold">
            Add manual expense
          </summary>
          <div className="mt-4">
            <ManualExpenseForm />
          </div>
        </details>
      </div>
    </div>
  );
}
