import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { rooms, students } from "@/db/schema";

export async function GET() {
  const db = getDb();
  const rows = await db
    .select({
      student: students,
      room: rooms,
    })
    .from(students)
    .innerJoin(rooms, eq(students.roomId, rooms.id))
    .orderBy(asc(rooms.sortOrder), asc(students.name));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const studentRef = String(body.studentRef ?? "").trim();
  const name = String(body.name ?? "").trim();
  const roomId = Number(body.roomId);
  const monthlyRentCents = Number(body.monthlyRentCents);
  const leaseStart = String(body.leaseStart ?? "").trim();

  if (!studentRef || !name || !roomId || !leaseStart) {
    return NextResponse.json(
      { error: "studentRef, name, roomId, and leaseStart are required" },
      { status: 400 },
    );
  }

  const db = getDb();
  try {
    const [row] = await db
      .insert(students)
      .values({
        studentRef,
        name,
        roomId,
        monthlyRentCents: monthlyRentCents || 0,
        leaseStart,
        active: body.active !== false,
        notes: body.notes ? String(body.notes) : null,
      })
      .returning();
    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create student (duplicate reference?)" },
      { status: 409 },
    );
  }
}
