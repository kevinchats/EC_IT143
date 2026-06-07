import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { gmailSyncState } from "@/db/schema";
import { isGmailConfigured } from "@/lib/gmail";

export async function GET() {
  const db = getDb();
  const rows = await db.select().from(gmailSyncState).limit(1);
  return NextResponse.json({
    configured: isGmailConfigured(),
    state: rows[0] ?? null,
  });
}
