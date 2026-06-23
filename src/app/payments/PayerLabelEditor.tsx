"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayerLabelEditor({
  paymentId,
  initialLabel,
}: {
  paymentId: number;
  initialLabel: string;
}) {
  const router = useRouter();
  const [label, setLabel] = useState(initialLabel);
  const [saving, setSaving] = useState(false);

  async function save() {
    const trimmed = label.trim();
    if (!trimmed || trimmed === initialLabel) return;
    setSaving(true);
    await fetch(`/api/payments/${paymentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payerLabel: trimmed }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <input
      className="min-w-[10rem] bg-transparent border-b border-[var(--card-border)] py-0.5 text-sm focus:border-[var(--accent)] focus:outline-none"
      value={label}
      onChange={(e) => setLabel(e.target.value)}
      onBlur={save}
      disabled={saving}
      aria-label="Payer name"
    />
  );
}
