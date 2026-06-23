import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { payments } from "@/db/schema";
import { isBusinessTag } from "@/lib/business-tags";

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
  if (body.businessTag !== undefined) {
    const tag = String(body.businessTag);
    if (!isBusinessTag(tag)) {
      return NextResponse.json({ error: "Invalid business tag" }, { status: 400 });
    }
    updates.businessTag = tag;
  }

  const [row] = await db
    .update(payments)
    .set(updates)
    .where(eq(payments.id, paymentId))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const paymentId = Number(id);
  const db = getDb();
  const [row] = await db
    .select({ source: payments.source })
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (row.source !== "manual") {
    return NextResponse.json(
      { error: "Only manual transactions can be deleted" },
      { status: 400 },
    );
  }

  await db.delete(payments).where(eq(payments.id, paymentId));
  return NextResponse.json({ ok: true });
}
