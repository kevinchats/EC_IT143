import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { payments, rooms, students } from "@/db/schema";

export async function GET() {
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
    .orderBy(desc(payments.paymentDate), desc(payments.id))
    .limit(500);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const payerLabel = String(body.payerLabel ?? "").trim();
  const amountCents = Number(body.amountCents);
  const paymentDate = String(body.paymentDate ?? "").trim();

  if (!payerLabel || !amountCents || !paymentDate) {
    return NextResponse.json(
      { error: "payerLabel, amountCents, and paymentDate are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const [row] = await db
    .insert(payments)
    .values({
      payerLabel,
      studentId: body.studentId ? Number(body.studentId) : null,
      amountCents,
      paymentDate,
      source: "manual",
      subject: body.subject ? String(body.subject) : "Manual entry",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
