import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { rooms } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const roomId = Number(id);
  const body = await request.json();
  const db = getDb();

  const updates: Partial<{ label: string; sortOrder: number }> = {};
  if (body.label !== undefined) updates.label = String(body.label).trim();
  if (body.sortOrder !== undefined) updates.sortOrder = Number(body.sortOrder);

  const [row] = await db
    .update(rooms)
    .set(updates)
    .where(eq(rooms.id, roomId))
    .returning();

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const roomId = Number(id);
  const db = getDb();
  await db.delete(rooms).where(eq(rooms.id, roomId));
  return NextResponse.json({ ok: true });
}
