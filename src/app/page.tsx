import Link from "next/link";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { SyncButton } from "@/components/SyncButton";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import {
  getAllTimeTotals,
  getChartData,
  getExpenseTotalsByCategory,
  getMonthlyTotals,
  getRecentExpenses,
  getRecentPayments,
} from "@/lib/dashboard-data";
import { centsToRand, formatDate } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [totals, allTime, recentPayments, recentExpenses, chartData, byCategory] =
    await Promise.all([
      getMonthlyTotals(),
      getAllTimeTotals(),
      getRecentPayments(10),
      getRecentExpenses(10),
      getChartData(6),
      getExpenseTotalsByCategory(),
    ]);

  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Cash flow</h1>
          <p className="text-[var(--muted)]">
            What came in vs what went out — {totals.month}
          </p>
        </div>
        <SyncButton label="Sync bank payments" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="stat-label">Money in this month</p>
          <p className="stat-value text-[var(--positive)]">
            {centsToRand(totals.incomeCents)}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Money out this month</p>
          <p className="stat-value text-[var(--negative)]">
            {centsToRand(totals.expenseCents)}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Net this month</p>
          <p
            className={`stat-value ${totals.netCents >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}
          >
            {centsToRand(totals.netCents)}
          </p>
        </div>
      </div>

      <div className="card">
        <p className="stat-label">All-time net position</p>
        <p
          className={`text-xl font-semibold ${allTime.netCents >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}
        >
          {centsToRand(allTime.netCents)}{" "}
          <span className="text-base font-normal text-[var(--muted)]">
            ({centsToRand(allTime.incomeCents)} in · {centsToRand(allTime.expenseCents)} out)
          </span>
        </p>
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Money in vs money out</h2>
        <IncomeExpenseChart data={chartData} />
      </div>

      {topCategories.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Spending this month by category</h2>
          <ul className="space-y-2">
            {topCategories.map(([cat, cents]) => (
              <li key={cat} className="flex justify-between text-sm">
                <span>{EXPENSE_CATEGORY_LABELS[cat] ?? cat}</span>
                <span className="text-[var(--negative)]">{centsToRand(cents)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent money in</h2>
            <Link href="/payments" className="text-sm">
              View all
            </Link>
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-[var(--muted)]">
                    No payments yet — sync Gmail or add manually
                  </td>
                </tr>
              ) : (
                recentPayments.map(({ payment }) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>{payment.payerLabel}</td>
                    <td className="text-[var(--positive)]">
                      {centsToRand(payment.amountCents)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent money out</h2>
            <Link href="/expenses" className="text-sm">
              View all
            </Link>
          </div>
          <table className="data">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentExpenses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-[var(--muted)]">
                    No expenses yet
                  </td>
                </tr>
              ) : (
                recentExpenses.map(({ expense, room }) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.expenseDate)}</td>
                    <td>
                      {expense.description}
                      {room ? ` · ${room.label}` : ""}
                    </td>
                    <td className="text-[var(--negative)]">
                      {centsToRand(expense.amountCents)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
