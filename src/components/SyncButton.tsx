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
        let msg = `Processed ${data.processed}, added ${data.inserted}, skipped ${data.skipped}`;
        if (data.errors?.length) {
          msg += ` — ${data.errors[0]}`;
        }
        setMessage(msg);
        if (data.inserted > 0) onDone?.();
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
