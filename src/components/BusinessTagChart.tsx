"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  label: string;
  income: number;
  expenses: number;
};

export function BusinessTagChart({
  data,
  color,
  title,
}: {
  data: ChartPoint[];
  color: string;
  title: string;
}) {
  const hasData = data.some((d) => d.income > 0 || d.expenses > 0);
  if (!hasData) {
    return (
      <p className="text-sm text-[var(--muted)]">No activity yet for {title}.</p>
    );
  }

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3b4d" />
          <XAxis dataKey="label" stroke="#8b98a5" fontSize={11} />
          <YAxis stroke="#8b98a5" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "#1a2332",
              border: "1px solid #2f3b4d",
            }}
            formatter={(v: number) => `R ${v.toFixed(2)}`}
          />
          <Legend />
          <Bar dataKey="income" name="In" fill={color} radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Out" fill="#f4212e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
