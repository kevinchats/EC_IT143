import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { expenseCategories, expenses, rooms } from "@/db/schema";

export async function GET() {
  const db = getDb();
  const rows = await db
    .select({
      expense: expenses,
      room: rooms,
    })
    .from(expenses)
    .leftJoin(rooms, eq(expenses.roomId, rooms.id))
    .orderBy(desc(expenses.expenseDate), desc(expenses.id));
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const expenseDate = String(body.expenseDate ?? "").trim();
  const amountCents = Number(body.amountCents);
  const category = String(body.category ?? "other");
  const description = String(body.description ?? "").trim();
  const roomId = body.roomId ? Number(body.roomId) : null;

  if (!expenseDate || !amountCents || !description) {
    return NextResponse.json(
      { error: "expenseDate, amountCents, and description are required" },
      { status: 400 },
    );
  }

  if (!expenseCategories.includes(category as (typeof expenseCategories)[number])) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .insert(expenses)
    .values({
      expenseDate,
      amountCents,
      category: category as (typeof expenseCategories)[number],
      description,
      roomId,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
