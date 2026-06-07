"use client";

import { expenseCategories } from "@/db/schema";
import { centsToRand, formatDate, randToCents, todayIso } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ExpenseRow = {
  id: number;
  expenseDate: string;
  amountCents: number;
  category: string;
  description: string;
  roomId: number | null;
  roomLabel: string | null;
};

type RoomOption = { id: number; label: string };

export function ExpenseManager({
  initialExpenses,
  rooms,
  categoryLabels,
}: {
  initialExpenses: ExpenseRow[];
  rooms: RoomOption[];
  categoryLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [expenseDate, setExpenseDate] = useState(todayIso());
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("utilities");
  const [description, setDescription] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function addExpense(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expenseDate,
        amountCents: randToCents(amount),
        category,
        description,
        roomId: roomId ? Number(roomId) : null,
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

  async function remove(id: number) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <>
      <div className="card max-w-lg">
        <h2 className="mb-4 text-lg font-semibold">Add expense</h2>
        <form onSubmit={addExpense} className="space-y-4">
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
            Category
            <select
              className="mt-1"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {expenseCategories.map((c) => (
                <option key={c} value={c}>
                  {categoryLabels[c] ?? c}
                </option>
              ))}
            </select>
          </label>
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
            Room (optional — leave shared)
            <select
              className="mt-1"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              <option value="">Shared / property-wide</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Saving…" : "Add expense"}
          </button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Room</th>
              <th>Amount</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {initialExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-[var(--muted)]">
                  No expenses yet
                </td>
              </tr>
            ) : (
              initialExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{formatDate(e.expenseDate)}</td>
                  <td>{categoryLabels[e.category] ?? e.category}</td>
                  <td>{e.description}</td>
                  <td>{e.roomLabel ?? "Shared"}</td>
                  <td className="text-[var(--negative)]">
                    {centsToRand(e.amountCents)}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger text-xs"
                      onClick={() => remove(e.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
