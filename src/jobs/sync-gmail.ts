import { eq, or } from "drizzle-orm";
import { getDb } from "@/db";
import { gmailSyncState, payments } from "@/db/schema";
import {
  autoTag,
  isExpenseOnlyIncoming,
  paymentDedupeKey,
} from "@/lib/business-tags";
import {
  cleanupMirroredPayments,
  hasMirrorOut,
  retagUncategorized,
} from "@/lib/payment-cleanup";
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
  fullSync?: boolean;
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
      message: "Gmail not configured — set GMAIL_* in .env",
    };
  }

  const stateRows = await db.select().from(gmailSyncState).limit(1);
  const hasSyncedBefore = Boolean(stateRows[0]?.lastSyncAt);
  const backfillDays =
    options?.backfillDays ?? Number(process.env.GMAIL_BACKFILL_DAYS ?? 365);
  const fullSync = options?.fullSync ?? false;
  const unreadOnly = options?.unreadOnly ?? (hasSyncedBefore && !fullSync);

  let messages: Awaited<ReturnType<typeof listPaymentMessages>> = [];
  try {
    messages = await listPaymentMessages({
      unreadOnly,
      newerThanDays: fullSync ? undefined : hasSyncedBefore ? undefined : backfillDays,
      fetchAll: fullSync || !hasSyncedBefore,
      maxResults: fullSync ? undefined : 500,
    });

    if (!hasSyncedBefore && messages.length === 0 && backfillDays > 0) {
      messages = await listPaymentMessages({ unreadOnly: false, fetchAll: true });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      processed: 0,
      inserted: 0,
      skipped: 0,
      errors: [msg],
      message: `Gmail API error: ${msg}`,
    };
  }

  let inserted = 0;
  let skipped = 0;

  for (const msg of messages) {
    const parsed = parseGmailMessage(msg);
    if (!parsed) {
      skipped++;
      continue;
    }

    const label = parsed.counterpartyRef;

    if (parsed.direction === "in") {
      if (isExpenseOnlyIncoming(label)) {
        skipped++;
        continue;
      }
      if (await hasMirrorOut(db, parsed.paymentDate, parsed.amountCents, label)) {
        skipped++;
        continue;
      }
    }

    const dedupeKey = paymentDedupeKey(
      parsed.direction,
      parsed.paymentDate,
      parsed.amountCents,
      label,
    );

    const existing = await db
      .select({ id: payments.id })
      .from(payments)
      .where(
        or(
          eq(payments.gmailMessageId, msg.id),
          eq(payments.dedupeKey, dedupeKey),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    await db.insert(payments).values({
      payerLabel: label,
      businessTag: autoTag(label),
      direction: parsed.direction,
      amountCents: parsed.amountCents,
      paymentDate: parsed.paymentDate,
      gmailMessageId: msg.id,
      dedupeKey,
      subject: msg.subject,
      rawPreview: parsed.bodyPreview,
      source: "gmail",
    });

    inserted++;
    try {
      await markMessageRead(msg.id);
    } catch {
      errors.push(`Saved but could not mark read: ${msg.id}`);
    }
  }

  await cleanupMirroredPayments(db);
  await retagUncategorized(db);

  const now = new Date().toISOString();
  const stateUpdate = {
    lastSyncAt: now,
    lastError: errors.length ? errors.slice(0, 5).join("; ") : null,
    lastProcessedCount: messages.length,
    lastInsertedCount: inserted,
    lastSkippedCount: skipped,
  };

  if (stateRows.length === 0) {
    await db.insert(gmailSyncState).values(stateUpdate);
  } else {
    await db
      .update(gmailSyncState)
      .set(stateUpdate)
      .where(eq(gmailSyncState.id, stateRows[0].id));
  }

  return { ok: true, processed: messages.length, inserted, skipped, errors };
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
