import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { payments, rooms, students } from "@/db/schema";
import { centsToRand, formatDate } from "@/lib/money";
import { ManualPaymentForm } from "./ManualPaymentForm";

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
    .innerJoin(students, eq(payments.studentId, students.id))
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .orderBy(desc(payments.paymentDate), desc(payments.id));

  const studentOptions = await db
    .select({ id: students.id, name: students.name, studentRef: students.studentRef })
    .from(students)
    .where(eq(students.active, true));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-[var(--muted)]">
          Automatic from Standard Bank Gmail confirmations; manual entries for corrections.
        </p>
      </div>

      <div className="card max-w-lg">
        <h2 className="mb-4 text-lg font-semibold">Add manual payment</h2>
        <ManualPaymentForm students={studentOptions} />
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Room</th>
              <th>Reference</th>
              <th>Amount</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-[var(--muted)]">
                  No payments recorded
                </td>
              </tr>
            ) : (
              rows.map(({ payment, student, room }) => (
                <tr key={payment.id}>
                  <td>{formatDate(payment.paymentDate)}</td>
                  <td>{student.name}</td>
                  <td>{room.label}</td>
                  <td className="font-mono text-sm">{student.studentRef}</td>
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
