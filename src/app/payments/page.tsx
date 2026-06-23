import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { payments, rooms, students } from "@/db/schema";
import { centsToRand, formatDate } from "@/lib/money";
import { ManualPaymentForm } from "./ManualPaymentForm";
import { PayerLabelEditor } from "./PayerLabelEditor";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const db = getDb();
  const rows = await db
    .select({
      payment: payments,
      student: students,
      room: rooms,
    })
    .from(payments)
    .leftJoin(students, eq(payments.studentId, students.id))
    .leftJoin(rooms, eq(students.roomId, rooms.id))
    .orderBy(desc(payments.paymentDate), desc(payments.id));

  const totalCents = rows.reduce((s, r) => s + r.payment.amountCents, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Money in</h1>
        <p className="text-[var(--muted)]">
          Rent and other payments from Standard Bank notifications. The bank reference becomes the payer name — click to edit.
        </p>
      </div>

      <div className="card">
        <p className="stat-label">Total recorded</p>
        <p className="stat-value text-[var(--positive)]">{centsToRand(totalCents)}</p>
      </div>

      <div className="card max-w-lg">
        <h2 className="mb-4 text-lg font-semibold">Add payment</h2>
        <ManualPaymentForm />
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-[var(--muted)]">
                  No payments yet
                </td>
              </tr>
            ) : (
              rows.map(({ payment }) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>
                    <PayerLabelEditor
                      paymentId={payment.id}
                      initialLabel={payment.payerLabel}
                    />
                  </td>
                  <td className="text-[var(--positive)]">
                    {centsToRand(payment.amountCents)}
                  </td>
                  <td>{payment.source}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
