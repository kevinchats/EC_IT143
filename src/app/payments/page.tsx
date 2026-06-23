import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { payments } from "@/db/schema";
import { PaymentBoard } from "@/components/PaymentBoard";
import { centsToRand } from "@/lib/money";
import { ManualPaymentForm } from "./ManualPaymentForm";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const db = getDb();
  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.paymentDate), desc(payments.id));

  const inTotal = rows
    .filter((p) => p.direction === "in")
    .reduce((s, p) => s + p.amountCents, 0);
  const outTotal = rows
    .filter((p) => p.direction === "out")
    .reduce((s, p) => s + p.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-[var(--muted)]">
          Drag payments into a business category. Chatcom-related refs auto-tag on sync.
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
        <h2 className="mb-4 text-lg font-semibold">Categorise payments</h2>
        <PaymentBoard payments={rows} />
      </div>

      <details className="card">
        <summary className="cursor-pointer text-lg font-semibold">Add manual transaction</summary>
        <div className="mt-4 max-w-lg">
          <ManualPaymentForm />
        </div>
      </details>
    </div>
  );
}
