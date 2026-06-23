"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { randToCents, todayIso } from "@/lib/money";

export function ManualPaymentForm() {
  const router = useRouter();
  const [payerLabel, setPayerLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payerLabel,
        amountCents: randToCents(amount),
        paymentDate,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save");
      setLoading(false);
      return;
    }
    setPayerLabel("");
    setAmount("");
    router.refresh();
    setLoading(false);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Paid by (name or bank reference)
        <input
          className="mt-1"
          placeholder="e.g. Room 3 — Thabo"
          value={payerLabel}
          onChange={(e) => setPayerLabel(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Amount (ZAR)
        <input
          className="mt-1"
          type="text"
          inputMode="decimal"
          placeholder="3500.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>
      <label className="block text-sm">
        Payment date
        <input
          className="mt-1"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving…" : "Add payment"}
      </button>
    </form>
  );
}
