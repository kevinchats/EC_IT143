import { NextResponse } from "next/server";
import { syncGmailPayments } from "@/jobs/sync-gmail";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const backfill = Boolean(body.backfill);
    const result = await syncGmailPayments({
      backfillDays: backfill
        ? Number(process.env.GMAIL_BACKFILL_DAYS ?? 365)
        : undefined,
      unreadOnly: !backfill,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, processed: 0, inserted: 0, skipped: 0, errors: [message], message },
      { status: 500 },
    );
  }
}
