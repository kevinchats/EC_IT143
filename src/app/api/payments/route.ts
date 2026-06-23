import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { payments } from "@/db/schema";
import { autoTag, isBusinessTag } from "@/lib/business-tags";

export async function GET() {
  const db = getDb();
  const rows = await db
    .select()
    .from(payments)
    .orderBy(desc(payments.paymentDate), desc(payments.id))
    .limit(500);
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const body = await request.json();
  const payerLabel = String(body.payerLabel ?? "").trim();
  const amountCents = Number(body.amountCents);
  const paymentDate = String(body.paymentDate ?? "").trim();
  const direction = body.direction === "out" ? "out" : "in";

  if (!payerLabel || !amountCents || !paymentDate) {
    return NextResponse.json(
      { error: "payerLabel, amountCents, and paymentDate are required" },
      { status: 400 },
    );
  }

  const businessTag =
    body.businessTag && isBusinessTag(String(body.businessTag))
      ? String(body.businessTag)
      : autoTag(payerLabel);

  const db = getDb();
  const [row] = await db
    .insert(payments)
    .values({
      payerLabel,
      businessTag,
      direction,
      amountCents,
      paymentDate,
      source: "manual",
      subject: "Manual entry",
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
