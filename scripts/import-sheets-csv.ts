/**
 * Optional helper: import students/payments from CSV exported from Google Sheets.
 *
 * Students CSV columns: Student ID, Name, Room label, Monthly rent (ZAR), Lease start (YYYY-MM-DD)
 * Payments CSV columns: Date, Student ID, Amount (ZAR)
 *
 * Usage: tsx scripts/import-sheets-csv.ts students.csv [payments.csv]
 */
import fs from "fs";
import { getDb } from "../src/db";
import { payments, rooms, students } from "../src/db/schema";
import { randToCents } from "../src/lib/money";

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuotes = !inQuotes;
    else if (c === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

async function main() {
  const studentsFile = process.argv[2];
  if (!studentsFile) {
    console.error("Usage: tsx scripts/import-sheets-csv.ts students.csv [payments.csv]");
    process.exit(1);
  }

  const db = getDb();
  const lines = fs.readFileSync(studentsFile, "utf8").split(/\r?\n/).filter(Boolean);
  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    header.forEach((h, idx) => {
      row[h] = cols[idx] ?? "";
    });

    const ref = row["student id"] || row["student_ref"];
    const name = row["name"];
    const roomLabel = row["room"] || row["room label"] || "Room";
    const rent = row["monthly rent"] || row["rent"];
    const leaseStart = row["lease start"] || row["lease_start"];

    const allRooms = await db.select().from(rooms);
    let room = allRooms.find((r) => r.label === roomLabel);
    if (!room) {
      const [created] = await db
        .insert(rooms)
        .values({ label: roomLabel, sortOrder: allRooms.length })
        .returning();
      room = created;
    }

    await db.insert(students).values({
      studentRef: ref,
      name,
      roomId: room.id,
      monthlyRentCents: randToCents(rent),
      leaseStart,
      active: true,
    });
    console.log(`Imported student ${ref}`);
  }

  const paymentsFile = process.argv[3];
  if (paymentsFile) {
    const pLines = fs.readFileSync(paymentsFile, "utf8").split(/\r?\n/).filter(Boolean);
    const pHeader = parseCsvLine(pLines[0]).map((h) => h.toLowerCase());
    const allStudents = await db.select().from(students);

    for (let i = 1; i < pLines.length; i++) {
      const cols = parseCsvLine(pLines[i]);
      const row: Record<string, string> = {};
      pHeader.forEach((h, idx) => {
        row[h] = cols[idx] ?? "";
      });
      const ref = row["student id"] || row["student_ref"];
      const student = allStudents.find(
        (s) => s.studentRef.toLowerCase() === ref.toLowerCase(),
      );
      if (!student) {
        console.warn(`Skip payment — unknown ref ${ref}`);
        continue;
      }
      await db.insert(payments).values({
        studentId: student.id,
        amountCents: randToCents(row["amount"]),
        paymentDate: row["date"],
        source: "import",
        subject: "CSV import",
      });
    }
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
