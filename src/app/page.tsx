import Link from "next/link";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { NetTrendChart } from "@/components/NetTrendChart";
import { PayerTotalsChart } from "@/components/PayerTotalsChart";
import { PaymentCountChart } from "@/components/PaymentCountChart";
import { SyncButton } from "@/components/SyncButton";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import {
  getAllTimeTotals,
  getChartData,
  getExpenseTotalsByCategory,
  getMonthlyPaymentCount,
  getMonthlyTotals,
  getNetTrend,
  getPaymentsByPayer,
  getRecentExpenses,
  getRecentPayments,
} from "@/lib/dashboard-data";
import { centsToRand, formatDate } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [
    totals,
    allTime,
    recentPayments,
    recentExpenses,
    chartData,
    netTrend,
    paymentCounts,
    byPayer,
    byCategory,
  ] = await Promise.all([
    getMonthlyTotals(),
    getAllTimeTotals(),
    getRecentPayments(10),
    getRecentExpenses(10),
    getChartData(12),
    getNetTrend(12),
    getMonthlyPaymentCount(12),
    getPaymentsByPayer(8),
    getExpenseTotalsByCategory(),
  ]);

  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const payerChartData = byPayer.map((p) => ({
    payer: p.payer,
    total: p.totalCents / 100,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--muted)]">
            Cash flow trends and payments by bank reference — {totals.month}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SyncButton label="Sync new payments" />
          <SyncButton label="Sync all from Gmail" backfill />
        </div>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Money in vs money out</h2>
          <IncomeExpenseChart data={chartData} />
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Net cash flow trend</h2>
          <NetTrendChart data={netTrend} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Payments by reference</h2>
            <Link href="/payments" className="text-sm">
              View all
            </Link>
          </div>
          <PayerTotalsChart data={payerChartData} />
          {byPayer.length > 0 && (
            <table className="data mt-4">
              <thead>
                <tr>
                  <th>Reference / payer</th>
                  <th>Payments</th>
                  <th>Total</th>
                  <th>Last</th>
                </tr>
              </thead>
              <tbody>
                {byPayer.map((p) => (
                  <tr key={p.payer}>
                    <td>{p.payer}</td>
                    <td>{p.count}</td>
                    <td className="text-[var(--positive)]">
                      {centsToRand(p.totalCents)}
                    </td>
                    <td>{p.lastDate ? formatDate(p.lastDate) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Payment volume trend</h2>
          <PaymentCountChart data={paymentCounts} />
        </div>
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
                <th>Reference</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-[var(--muted)]">
                    No payments yet — use Sync all from Gmail above
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
