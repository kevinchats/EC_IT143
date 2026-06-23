"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PayerPoint = {
  payer: string;
  total: number;
};

export function PayerTotalsChart({ data }: { data: PayerPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No payments yet — sync Gmail to import bank notifications.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    shortLabel: d.payer.length > 22 ? `${d.payer.slice(0, 20)}…` : d.payer,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3b4d" />
          <XAxis type="number" stroke="#8b98a5" fontSize={12} />
          <YAxis
            type="category"
            dataKey="shortLabel"
            stroke="#8b98a5"
            fontSize={11}
            width={120}
          />
          <Tooltip
            contentStyle={{
              background: "#1a2332",
              border: "1px solid #2f3b4d",
            }}
            formatter={(v: number) => `R ${v.toFixed(2)}`}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.payer ?? ""
            }
          />
          <Bar dataKey="total" name="Total received" fill="#00ba7c" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
