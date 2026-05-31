import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { students } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const studentId = Number(id);
  const body = await request.json();
  const db = getDb();

  const updates: Record<string, unknown> = {};
  if (body.studentRef !== undefined) updates.studentRef = String(body.studentRef).trim();
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.roomId !== undefined) updates.roomId = Number(body.roomId);
  if (body.monthlyRentCents !== undefined)
    updates.monthlyRentCents = Number(body.monthlyRentCents);
  if (body.leaseStart !== undefined) updates.leaseStart = String(body.leaseStart);
  if (body.active !== undefined) updates.active = Boolean(body.active);
  if (body.notes !== undefined) updates.notes = body.notes ? String(body.notes) : null;

  const [row] = await db
    .update(students)
    .set(updates)
    .where(eq(students.id, studentId))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const studentId = Number(id);
  const db = getDb();
  await db.delete(students).where(eq(students.id, studentId));
  return NextResponse.json({ ok: true });
}
