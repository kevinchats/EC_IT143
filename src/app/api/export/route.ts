import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { expenses, payments, rooms, students } from "@/db/schema";
import { centsToRand } from "@/lib/money";

function csvEscape(v: string | number | null | undefined): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "all";
  const db = getDb();

  const lines: string[] = [];

  if (type === "payments" || type === "all") {
    const rows = await db
      .select({
        payment: payments,
        student: students,
        room: rooms,
      })
      .from(payments)
      .innerJoin(students, eq(payments.studentId, students.id))
      .innerJoin(rooms, eq(students.roomId, rooms.id))
      .orderBy(desc(payments.paymentDate));

    lines.push("--- PAYMENTS ---");
    lines.push(
      ["Date", "Student", "Reference", "Room", "Amount", "Source", "Gmail ID"].join(","),
    );
    for (const r of rows) {
      lines.push(
        [
          r.payment.paymentDate,
          r.student.name,
          r.student.studentRef,
          r.room.label,
          centsToRand(r.payment.amountCents),
          r.payment.source,
          r.payment.gmailMessageId ?? "",
        ]
          .map(csvEscape)
          .join(","),
      );
    }
    lines.push("");
  }

  if (type === "expenses" || type === "all") {
    const rows = await db
      .select({
        expense: expenses,
        room: rooms,
      })
      .from(expenses)
      .leftJoin(rooms, eq(expenses.roomId, rooms.id))
      .orderBy(desc(expenses.expenseDate));

    lines.push("--- EXPENSES ---");
    lines.push(
      ["Date", "Category", "Description", "Room", "Amount"].join(","),
    );
    for (const r of rows) {
      lines.push(
        [
          r.expense.expenseDate,
          r.expense.category,
          r.expense.description,
          r.room?.label ?? "Shared",
          centsToRand(r.expense.amountCents),
        ]
          .map(csvEscape)
          .join(","),
      );
    }
  }

  const filename =
    type === "payments"
      ? "payments-export.csv"
      : type === "expenses"
        ? "expenses-export.csv"
        : "rental-export.csv";

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
