import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { payments } from "@/db/schema";
import {
  BusinessTagBoard,
  type BoardItem,
} from "@/components/BusinessTagBoard";
import { centsToRand } from "@/lib/money";
import { ManualPaymentForm } from "./ManualPaymentForm";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const db = getDb();
  const paymentRows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.paymentDate), desc(payments.id));

  const boardItems: BoardItem[] = paymentRows.map((p) => ({
    id: p.id,
    kind: "payment",
    title: p.payerLabel,
    businessTag: p.businessTag,
    amountCents: p.amountCents,
    date: p.paymentDate,
    direction: p.direction,
    manual: p.source === "manual",
  }));

  const inTotal = paymentRows
    .filter((p) => p.direction === "in")
    .reduce((s, p) => s + p.amountCents, 0);
  const outTotal = paymentRows
    .filter((p) => p.direction === "out")
    .reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-[var(--muted)]">
          Drag bank and manual transactions into a business. Manual items can be removed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="stat-label">Bank money in</p>
          <p className="stat-value text-[var(--positive)]">{centsToRand(inTotal)}</p>
        </div>
        <div className="card">
          <p className="stat-label">Bank money out</p>
          <p className="stat-value text-[var(--negative)]">{centsToRand(outTotal)}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Bank & manual transactions</h2>
        <BusinessTagBoard items={boardItems} emptyHint="Drop transactions here" />
      </div>

      <details className="card">
        <summary className="cursor-pointer text-lg font-semibold">
          Add manual transaction
        </summary>
        <div className="mt-4 max-w-lg">
          <ManualPaymentForm />
        </div>
      </details>
    </div>
  );
}
