import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { payments } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const paymentId = Number(id);
  const body = await request.json();
  const db = getDb();

  const updates: Record<string, unknown> = {};
  if (body.payerLabel !== undefined) {
    const label = String(body.payerLabel).trim();
    if (!label) {
      return NextResponse.json({ error: "payerLabel cannot be empty" }, { status: 400 });
    }
    updates.payerLabel = label;
  }
  if (body.studentId !== undefined) {
    updates.studentId = body.studentId ? Number(body.studentId) : null;
  }

  const [row] = await db
    .update(payments)
    .set(updates)
    .where(eq(payments.id, paymentId))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}
