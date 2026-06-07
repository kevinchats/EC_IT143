import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { payments, rooms, students } from "@/db/schema";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const db = getDb();

  const base = db
    .select({
      payment: payments,
      student: students,
      room: rooms,
    })
    .from(payments)
    .innerJoin(students, eq(payments.studentId, students.id))
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .orderBy(desc(payments.paymentDate), desc(payments.id));

  const rows = studentId
    ? await base.where(eq(payments.studentId, Number(studentId))).limit(500)
    : await base.limit(500);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const studentId = Number(body.studentId);
  const amountCents = Number(body.amountCents);
  const paymentDate = String(body.paymentDate ?? "").trim();

  if (!studentId || !amountCents || !paymentDate) {
    return NextResponse.json(
      { error: "studentId, amountCents, and paymentDate are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  const [row] = await db
    .insert(payments)
    .values({
      studentId,
      amountCents,
      paymentDate,
      source: "manual",
      subject: body.subject ? String(body.subject) : "Manual entry",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
