import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  gmailSyncState,
  payments,
  students,
} from "@/db/schema";
import {
  isGmailConfigured,
  listPaymentMessages,
  markMessageRead,
  parseGmailMessage,
} from "@/lib/gmail";
export type SyncResult = {
  ok: boolean;
  processed: number;
  inserted: number;
  skipped: number;
  errors: string[];
  message?: string;
};

export async function syncGmailPayments(options?: {
  backfillDays?: number;
  unreadOnly?: boolean;
}): Promise<SyncResult> {
  const db = getDb();
  const errors: string[] = [];

  if (!isGmailConfigured()) {
    return {
      ok: false,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors: [],
      message: "Gmail not configured — set GMAIL_* in .env and run npm run gmail:auth",
    };
  }

  const stateRows = await db.select().from(gmailSyncState).limit(1);
  const hasSyncedBefore = Boolean(stateRows[0]?.lastSyncAt);
  const backfillDays = options?.backfillDays ?? Number(process.env.GMAIL_BACKFILL_DAYS ?? 90);
  const unreadOnly = options?.unreadOnly ?? hasSyncedBefore;

  const messages = await listPaymentMessages({
    unreadOnly,
    newerThanDays: hasSyncedBefore ? undefined : backfillDays,
    maxResults: 100,
  });

  const studentRows = await db.select().from(students);
  const refMap = new Map(
    studentRows.map((s) => [s.studentRef.toLowerCase(), s]),
  );

  let inserted = 0;
  let skipped = 0;

  for (const msg of messages) {
    const parsed = parseGmailMessage(msg);
    if (!parsed) {
      skipped++;
      errors.push(`Could not parse message ${msg.id}`);
      continue;
    }

    const student = refMap.get(parsed.studentId.toLowerCase());
    if (!student) {
      skipped++;
      errors.push(`No student for reference "${parsed.studentId}" (message ${msg.id})`);
      continue;
    }

    const existing = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.gmailMessageId, msg.id))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(payments).values({
      studentId: student.id,
      amountCents: parsed.amountCents,
      paymentDate: parsed.paymentDate,
      gmailMessageId: msg.id,
      subject: msg.subject,
      rawPreview: parsed.bodyPreview,
      source: "gmail",
    });

    inserted++;
    try {
      await markMessageRead(msg.id);
    } catch {
      errors.push(`Payment saved but could not mark read: ${msg.id}`);
    }
  }

  const now = new Date().toISOString();
  if (stateRows.length === 0) {
    await db.insert(gmailSyncState).values({
      lastSyncAt: now,
      lastError: errors.length ? errors.slice(0, 5).join("; ") : null,
      lastProcessedCount: messages.length,
      lastInsertedCount: inserted,
      lastSkippedCount: skipped,
    });
  } else {
    await db
      .update(gmailSyncState)
      .set({
        lastSyncAt: now,
        lastError: errors.length ? errors.slice(0, 5).join("; ") : null,
        lastProcessedCount: messages.length,
        lastInsertedCount: inserted,
        lastSkippedCount: skipped,
      })
      .where(eq(gmailSyncState.id, stateRows[0].id));
  }

  return {
    ok: true,
    processed: messages.length,
    inserted,
    skipped,
    errors,
  };
}

export function startGmailCron() {
  const cronExpr = process.env.GMAIL_SYNC_CRON ?? "*/5 * * * *";
  if (process.env.DISABLE_GMAIL_CRON === "true") return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cron = require("node-cron") as typeof import("node-cron");
  if (!cron.validate(cronExpr)) {
    console.warn(`Invalid GMAIL_SYNC_CRON: ${cronExpr}`);
    return;
  }

  cron.schedule(cronExpr, () => {
    syncGmailPayments().catch((err) => {
      console.error("Gmail sync failed:", err);
    });
  });

  console.log(`Gmail sync scheduled: ${cronExpr}`);
}
