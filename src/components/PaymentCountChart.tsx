"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CountPoint = {
  label: string;
  count: number;
};

export function PaymentCountChart({ data }: { data: CountPoint[] }) {
  if (data.every((d) => d.count === 0)) {
    return (
      <p className="text-sm text-[var(--muted)]">No payment activity yet.</p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3b4d" />
          <XAxis dataKey="label" stroke="#8b98a5" fontSize={12} />
          <YAxis stroke="#8b98a5" fontSize={12} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#1a2332",
              border: "1px solid #2f3b4d",
            }}
            formatter={(v: number) => [`${v}`, "Payments"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            name="Payments"
            stroke="#7856ff"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
