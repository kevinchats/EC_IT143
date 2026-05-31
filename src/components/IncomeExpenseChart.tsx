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

export function IncomeExpenseChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">No data yet for chart.</p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2f3b4d" />
          <XAxis dataKey="label" stroke="#8b98a5" fontSize={12} />
          <YAxis stroke="#8b98a5" fontSize={12} />
          <Tooltip
            contentStyle={{
              background: "#1a2332",
              border: "1px solid #2f3b4d",
            }}
            formatter={(v: number) => `R ${v.toFixed(2)}`}
          />
          <Legend />
          <Bar dataKey="income" name="Income" fill="#00ba7c" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Expenses" fill="#f4212e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
