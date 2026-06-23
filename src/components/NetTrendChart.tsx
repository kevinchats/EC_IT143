"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type NetPoint = {
  label: string;
  net: number;
  cumulative: number;
};

export function NetTrendChart({ data }: { data: NetPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No data yet for chart.</p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3b4d" />
          <XAxis dataKey="label" stroke="#8b98a5" fontSize={12} />
          <YAxis stroke="#8b98a5" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#1a2332",
              border: "1px solid #2f3b4d",
            }}
            formatter={(v: number, name: string) => [
              `R ${v.toFixed(2)}`,
              name === "cumulative" ? "Running net" : "Monthly net",
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="net"
            name="Monthly net"
            stroke="#1d9bf0"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="cumulative"
            name="Running net"
            stroke="#00ba7c"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
