import { NextResponse } from "next/server";
import { syncGmailPayments } from "@/jobs/sync-gmail";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const backfill = Boolean(body.backfill);
  const result = await syncGmailPayments({
    backfillDays: backfill ? Number(process.env.GMAIL_BACKFILL_DAYS ?? 90) : undefined,
    unreadOnly: !backfill,
  });
  return NextResponse.json(result);
}
