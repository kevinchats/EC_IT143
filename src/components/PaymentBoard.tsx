"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUSINESS_TAGS, type BusinessTag } from "@/lib/business-tags";
import { centsToRand, formatDate } from "@/lib/money";

export type BoardPayment = {
  id: number;
  payerLabel: string;
  businessTag: string;
  direction: string;
  amountCents: number;
  paymentDate: string;
};

const TAG_ORDER: BusinessTag[] = ["uncategorized", "accommodation", "chatcom"];

export function PaymentBoard({ payments }: { payments: BoardPayment[] }) {
  const router = useRouter();
  const [dragId, setDragId] = useState<number | null>(null);

  async function moveToTag(paymentId: number, tag: BusinessTag) {
    const p = payments.find((x) => x.id === paymentId);
    if (!p || p.businessTag === tag) return;
    await fetch(`/api/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessTag: tag }),
    });
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {TAG_ORDER.map((tag) => {
        const meta = BUSINESS_TAGS[tag];
        const items = payments.filter((p) => p.businessTag === tag);
        const inTotal = items
          .filter((p) => p.direction === "in")
          .reduce((s, p) => s + p.amountCents, 0);
        const outTotal = items
          .filter((p) => p.direction === "out")
          .reduce((s, p) => s + p.amountCents, 0);

        return (
          <div
            key={tag}
            className="tag-column"
            style={{ borderColor: meta.color }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = Number(e.dataTransfer.getData("paymentId"));
              if (id) moveToTag(id, tag);
              setDragId(null);
            }}
          >
            <div className="tag-column-header" style={{ color: meta.color }}>
              <span>{meta.label}</span>
              <span className="text-xs text-[var(--muted)]">{items.length}</span>
            </div>
            <p className="mb-3 text-xs text-[var(--muted)]">
              {inTotal > 0 && (
                <span className="text-[var(--positive)]">+{centsToRand(inTotal)} </span>
              )}
              {outTotal > 0 && (
                <span className="text-[var(--negative)]">−{centsToRand(outTotal)}</span>
              )}
            </p>
            <div className="space-y-2">
              {items.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">Drop payments here</p>
              ) : (
                items.map((p) => (
                  <div
                    key={p.id}
                    draggable
                    className={`payment-card ${dragId === p.id ? "opacity-50" : ""}`}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("paymentId", String(p.id));
                      setDragId(p.id);
                    }}
                    onDragEnd={() => setDragId(null)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">
                        {p.payerLabel}
                      </span>
                      <span
                        className={
                          p.direction === "in"
                            ? "text-[var(--positive)]"
                            : "text-[var(--negative)]"
                        }
                      >
                        {p.direction === "in" ? "+" : "−"}
                        {centsToRand(p.amountCents)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {formatDate(p.paymentDate)}
                      {p.direction === "out" ? " · out" : " · in"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
