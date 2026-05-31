"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { randToCents, todayIso } from "@/lib/money";

type StudentOption = { id: number; name: string; studentRef: string };

export function ManualPaymentForm({ students }: { students: StudentOption[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(String(students[0]?.id ?? ""));
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
        studentId: Number(studentId),
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
    setAmount("");
    router.refresh();
    setLoading(false);
  }

  if (students.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Add a student first under Students & rooms.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm">
        Student
        <select
          className="mt-1"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.studentRef})
            </option>
          ))}
        </select>
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
