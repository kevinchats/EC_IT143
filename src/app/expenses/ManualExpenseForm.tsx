"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUSINESS_TAGS, type BusinessTag } from "@/lib/business-tags";
import { randToCents, todayIso } from "@/lib/money";

const TAG_OPTIONS = Object.keys(BUSINESS_TAGS) as BusinessTag[];

export function ManualExpenseForm() {
  const router = useRouter();
  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [businessTag, setBusinessTag] = useState<BusinessTag>("uncategorized");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expenseDate,
        amountCents: randToCents(amount),
        description,
        category: "other",
        businessTag,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      setLoading(false);
      return;
    }
    setAmount("");
    setDescription("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Description
        <input
          className="mt-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Amount (ZAR)
        <input
          className="mt-1"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Date
        <input
          className="mt-1"
          type="date"
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Business
        <select
          className="mt-1"
          value={businessTag}
          onChange={(e) => setBusinessTag(e.target.value as BusinessTag)}
        >
          {TAG_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {BUSINESS_TAGS[t].label}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Add expense"}
      </button>
    </form>
  );
}
