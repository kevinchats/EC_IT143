import { eq, inArray } from "drizzle-orm";
import { payments } from "@/db/schema";
import {
  autoTag,
  mirrorDirectionToDrop,
  pairKey,
  type BusinessTag,
} from "./business-tags";
import type { getDb } from "@/db";

type Db = ReturnType<typeof getDb>;

/** Remove mirrored in/out pairs (e.g. Cursor expense + reversal credit). */
export async function cleanupMirroredPayments(db: Db): Promise<number> {
  const rows = await db.select().from(payments);
  const groups = new Map<string, typeof rows>();

  for (const p of rows) {
    const key = pairKey(p.paymentDate, p.amountCents, p.payerLabel);
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  const toDelete: number[] = [];
  for (const group of groups.values()) {
    const hasIn = group.some((p) => p.direction === "in");
    const hasOut = group.some((p) => p.direction === "out");
    if (!hasIn || !hasOut) continue;

    const tag = (group.find((p) => p.businessTag !== "uncategorized")?.businessTag ??
      autoTag(group[0].payerLabel)) as BusinessTag;
    const drop = mirrorDirectionToDrop(tag);
    for (const p of group.filter((x) => x.direction === drop)) {
      toDelete.push(p.id);
    }
  }

  if (toDelete.length === 0) return 0;
  await db.delete(payments).where(inArray(payments.id, toDelete));
  return toDelete.length;
}

/** Apply auto-tag rules to uncategorized rows. */
export async function retagUncategorized(db: Db): Promise<number> {
  const rows = await db
    .select()
    .from(payments)
    .where(eq(payments.businessTag, "uncategorized"));

  let updated = 0;
  for (const p of rows) {
    const tag = autoTag(p.payerLabel);
    if (tag === "uncategorized") continue;
    await db
      .update(payments)
      .set({ businessTag: tag })
      .where(eq(payments.id, p.id));
    updated++;
  }
  return updated;
}

export async function hasMirrorOut(
  db: Db,
  date: string,
  amountCents: number,
  counterparty: string,
): Promise<boolean> {
  const key = pairKey(date, amountCents, counterparty);
  const rows = await db.select().from(payments);
  return rows.some(
    (p) =>
      p.direction === "out" &&
      pairKey(p.paymentDate, p.amountCents, p.payerLabel) === key,
  );
}
