import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { rooms } from "@/db/schema";

export async function GET() {
  const db = getDb();
  const rows = await db.select().from(rooms).orderBy(asc(rooms.sortOrder), asc(rooms.label));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const label = String(body.label ?? "").trim();
  if (!label) {
    return NextResponse.json({ error: "label is required" }, { status: 400 });
  }
  const db = getDb();
  const [row] = await db
    .insert(rooms)
    .values({
      label,
      sortOrder: Number(body.sortOrder ?? 0),
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
