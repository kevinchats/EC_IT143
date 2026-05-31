"use client";

import { centsToRand, randToCents, todayIso } from "@/lib/money";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Room = { id: number; label: string; sortOrder: number };

type StudentRow = {
  id: number;
  name: string;
  studentRef: string;
  roomId: number;
  roomLabel: string;
  monthlyRentCents: number;
  leaseStart: string;
  active: boolean;
  notes: string | null;
};

export function StudentsManager({
  rooms,
  students,
}: {
  rooms: Room[];
  students: StudentRow[];
}) {
  const router = useRouter();
  const [roomLabel, setRoomLabel] = useState("");
  const [name, setName] = useState("");
  const [studentRef, setStudentRef] = useState("");
  const [roomId, setRoomId] = useState(String(rooms[0]?.id ?? ""));
  const [rent, setRent] = useState("");
  const [leaseStart, setLeaseStart] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);

  async function addRoom(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: roomLabel, sortOrder: rooms.length }),
    });
    setRoomLabel("");
    router.refresh();
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        studentRef,
        roomId: Number(roomId),
        monthlyRentCents: randToCents(rent),
        leaseStart,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed");
      return;
    }
    setName("");
    setStudentRef("");
    setRent("");
    router.refresh();
  }

  async function removeStudent(id: number) {
    if (!confirm("Delete this student? Payments must be removed first.")) return;
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (!res.ok) alert("Could not delete — student may have payments.");
    router.refresh();
  }

  async function removeRoom(id: number) {
    if (!confirm("Delete this room?")) return;
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (!res.ok) alert("Could not delete room — it may have students.");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Add room</h2>
        <form onSubmit={addRoom} className="flex gap-2">
          <input
            placeholder="Room 1"
            value={roomLabel}
            onChange={(e) => setRoomLabel(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-secondary shrink-0">
            Add
          </button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {rooms.map((r) => (
            <li key={r.id} className="flex justify-between">
              <span>{r.label}</span>
              <button
                type="button"
                className="text-[var(--negative)]"
                onClick={() => removeRoom(r.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Add student</h2>
        {rooms.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Add a room first.</p>
        ) : (
          <form onSubmit={addStudent} className="space-y-3">
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              placeholder="Bank reference (Student ID)"
              value={studentRef}
              onChange={(e) => setStudentRef(e.target.value)}
              required
            />
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <input
              placeholder="Monthly rent (ZAR)"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              required
            />
            <label className="block text-sm">
              Lease start
              <input
                className="mt-1"
                type="date"
                value={leaseStart}
                onChange={(e) => setLeaseStart(e.target.value)}
                required
              />
            </label>
            {error && <p className="text-sm text-[var(--negative)]">{error}</p>}
            <button type="submit" className="btn btn-primary">
              Add student
            </button>
          </form>
        )}
        <ul className="mt-4 space-y-2 text-sm">
          {students.map((s) => (
            <li key={s.id} className="flex justify-between gap-2">
              <span>
                {s.name} · {s.roomLabel} · {centsToRand(s.monthlyRentCents)}
              </span>
              <button
                type="button"
                className="text-[var(--negative)] shrink-0"
                onClick={() => removeStudent(s.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
