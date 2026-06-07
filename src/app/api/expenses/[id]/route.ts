import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { expenseCategories, expenses } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const expenseId = Number(id);
  const body = await request.json();
  const db = getDb();

  const updates: Record<string, unknown> = {};
  if (body.expenseDate !== undefined) updates.expenseDate = String(body.expenseDate);
  if (body.amountCents !== undefined) updates.amountCents = Number(body.amountCents);
  if (body.description !== undefined) updates.description = String(body.description);
  if (body.roomId !== undefined)
    updates.roomId = body.roomId ? Number(body.roomId) : null;
  if (body.category !== undefined) {
    if (
      !expenseCategories.includes(
        body.category as (typeof expenseCategories)[number],
      )
    ) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    updates.category = body.category;
  }

  const [row] = await db
    .update(expenses)
    .set(updates)
    .where(eq(expenses.id, expenseId))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const expenseId = Number(id);
  const db = getDb();
  await db.delete(expenses).where(eq(expenses.id, expenseId));
  return NextResponse.json({ ok: true });
}
