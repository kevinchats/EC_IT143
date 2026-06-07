import { asc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { rooms, students } from "@/db/schema";
import { getPaymentTotalsByStudent } from "@/lib/dashboard-data";
import {
  computeBalanceCents,
  isOverdue,
} from "@/lib/balances";
import { centsToRand, formatDate, todayIso } from "@/lib/money";
import { StudentsManager } from "./StudentsManager";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  const db = getDb();
  const roomRows = await db
    .select()
    .from(rooms)
    .orderBy(asc(rooms.sortOrder), asc(rooms.label));

  const studentRows = await db
    .select({
      student: students,
      room: rooms,
    })
    .from(students)
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .orderBy(asc(rooms.sortOrder), asc(students.name));

  const paidMap = await getPaymentTotalsByStudent();
  const today = todayIso();

  const enriched = studentRows.map(({ student, room }) => {
    const paid = paidMap.get(student.id)?.totalCents ?? 0;
    const lastPaymentDate = paidMap.get(student.id)?.lastPaymentDate ?? null;
    const balanceCents = computeBalanceCents(student, paid, today);
    return {
      student,
      room,
      paidCents: paid,
      balanceCents,
      lastPaymentDate,
      overdue: isOverdue(balanceCents, lastPaymentDate, today),
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Students & rooms</h1>
        <p className="text-[var(--muted)]">
          Bank payment reference must match <strong>Student reference</strong> exactly.
        </p>
      </div>

      <StudentsManager
        rooms={roomRows}
        students={enriched.map((e) => ({
          id: e.student.id,
          name: e.student.name,
          studentRef: e.student.studentRef,
          roomId: e.student.roomId,
          roomLabel: e.room.label,
          monthlyRentCents: e.student.monthlyRentCents,
          leaseStart: e.student.leaseStart,
          active: e.student.active,
          notes: e.student.notes,
          balanceCents: e.balanceCents,
          lastPaymentDate: e.lastPaymentDate,
          overdue: e.overdue,
        }))}
      />

      <div className="card overflow-x-auto">
        <h2 className="mb-4 text-lg font-semibold">Summary</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Room</th>
              <th>Student</th>
              <th>Reference</th>
              <th>Rent / month</th>
              <th>Lease start</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((e) => (
              <tr key={e.student.id}>
                <td>{e.room.label}</td>
                <td>{e.student.name}</td>
                <td className="font-mono text-sm">{e.student.studentRef}</td>
                <td>{centsToRand(e.student.monthlyRentCents)}</td>
                <td>{formatDate(e.student.leaseStart)}</td>
                <td
                  className={
                    e.balanceCents > 0
                      ? "text-[var(--negative)]"
                      : "text-[var(--positive)]"
                  }
                >
                  {centsToRand(e.balanceCents)}
                </td>
                <td>
                  {e.overdue ? (
                    <span className="badge badge-overdue">Overdue</span>
                  ) : (
                    <span className="badge badge-ok">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
