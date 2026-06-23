"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUSINESS_TAGS, type BusinessTag } from "@/lib/business-tags";
import { centsToRand, formatDate } from "@/lib/money";

export type BoardItem = {
  id: number;
  kind: "payment" | "expense";
  title: string;
  businessTag: string;
  amountCents: number;
  date: string;
  direction?: string;
  manual?: boolean;
};

const TAG_ORDER: BusinessTag[] = ["uncategorized", "accommodation", "chatcom"];

export function BusinessTagBoard({
  items,
  emptyHint = "Drop items here",
}: {
  items: BoardItem[];
  emptyHint?: string;
}) {
  const router = useRouter();
  const [dragId, setDragId] = useState<string | null>(null);

  async function moveToTag(item: BoardItem, tag: BusinessTag) {
    if (item.businessTag === tag) return;
    const base = item.kind === "payment" ? "/api/payments" : "/api/expenses";
    await fetch(`${base}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessTag: tag }),
    });
    router.refresh();
  }

  async function removeItem(item: BoardItem) {
    if (!item.manual) return;
    if (!confirm(`Delete this manual ${item.kind}?`)) return;
    const base = item.kind === "payment" ? "/api/payments" : "/api/expenses";
    await fetch(`${base}/${item.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {TAG_ORDER.map((tag) => {
        const meta = BUSINESS_TAGS[tag];
        const column = items.filter((i) => i.businessTag === tag);
        const inTotal = column
          .filter((i) => i.kind === "payment" && i.direction === "in")
          .reduce((s, i) => s + i.amountCents, 0);
        const outTotal = column.reduce((s, i) => {
          if (i.kind === "expense") return s + i.amountCents;
          if (i.direction === "out") return s + i.amountCents;
          return s;
        }, 0);

        return (
          <div
            key={tag}
            className="tag-column"
            style={{ borderColor: meta.color }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData("boardItem");
              if (!raw) return;
              const item = JSON.parse(raw) as BoardItem;
              moveToTag(item, tag);
              setDragId(null);
            }}
          >
            <div className="tag-column-header" style={{ color: meta.color }}>
              <span>{meta.label}</span>
              <span className="text-xs text-[var(--muted)]">{column.length}</span>
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
              {column.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{emptyHint}</p>
              ) : (
                column.map((item) => {
                  const key = `${item.kind}-${item.id}`;
                  const isIn = item.kind === "payment" && item.direction === "in";
                  return (
                    <div
                      key={key}
                      draggable
                      className={`payment-card ${dragId === key ? "opacity-50" : ""}`}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("boardItem", JSON.stringify(item));
                        setDragId(key);
                      }}
                      onDragEnd={() => setDragId(null)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-snug">
                          {item.title}
                        </span>
                        <span
                          className={
                            isIn ? "text-[var(--positive)]" : "text-[var(--negative)]"
                          }
                        >
                          {isIn ? "+" : "−"}
                          {centsToRand(item.amountCents)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {formatDate(item.date)}
                        {item.kind === "expense"
                          ? " · manual expense"
                          : item.direction === "out"
                            ? " · out"
                            : " · in"}
                        {item.manual ? " · manual" : ""}
                      </p>
                      {item.manual && (
                        <button
                          type="button"
                          className="btn btn-danger mt-2 text-xs"
                          onClick={() => removeItem(item)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
