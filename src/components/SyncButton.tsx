"use client";

import { useState } from "react";

export function SyncButton({
  label = "Sync Gmail now",
  backfill = false,
  onDone,
}: {
  label?: string;
  backfill?: boolean;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/sync/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backfill }),
      });
      const data = await res.json();
      if (!data.ok && data.message) {
        setMessage(data.message);
      } else {
        setMessage(
          `Processed ${data.processed}, added ${data.inserted}, skipped ${data.skipped}`,
        );
        onDone?.();
      }
      if (data.errors?.length) {
        setMessage((m) => `${m ?? ""} — ${data.errors[0]}`);
      }
    } catch {
      setMessage("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="btn btn-primary"
        disabled={loading}
        onClick={run}
      >
        {loading ? "Syncing…" : label}
      </button>
      {message && (
        <p className="text-sm text-[var(--muted)]">{message}</p>
      )}
    </div>
  );
}
