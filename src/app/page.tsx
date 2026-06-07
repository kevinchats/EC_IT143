import Link from "next/link";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { SyncButton } from "@/components/SyncButton";
import {
  getChartData,
  getMonthlyTotals,
  getRecentExpenses,
  getRecentPayments,
  getRoomDashboardRows,
} from "@/lib/dashboard-data";
import { centsToRand, formatDate } from "@/lib/money";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [totals, roomRows, recentPayments, recentExpenses, chartData] =
    await Promise.all([
      getMonthlyTotals(),
      getRoomDashboardRows(),
      getRecentPayments(10),
      getRecentExpenses(10),
      getChartData(6),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-[var(--muted)]">
            {totals.month} — income, expenses, and room balances
          </p>
        </div>
        <SyncButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="stat-label">Income this month</p>
          <p className="stat-value text-[var(--positive)]">
            {centsToRand(totals.incomeCents)}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Expenses this month</p>
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
        <h2 className="mb-4 text-lg font-semibold">Income vs expenses</h2>
        <IncomeExpenseChart data={chartData} />
      </div>

      <div className="card overflow-x-auto">
        <h2 className="mb-4 text-lg font-semibold">Rooms</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Room</th>
              <th>Student</th>
              <th>Reference</th>
              <th>Last payment</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {roomRows.map((row) => (
              <tr key={row.room.id}>
                <td>{row.room.label}</td>
                <td>{row.student?.name ?? "—"}</td>
                <td className="font-mono text-sm">
                  {row.student?.studentRef ?? "—"}
                </td>
                <td>
                  {row.lastPaymentDate
                    ? formatDate(row.lastPaymentDate)
                    : "—"}
                </td>
                <td
                  className={
                    row.balanceCents > 0
                      ? "text-[var(--negative)]"
                      : "text-[var(--positive)]"
                  }
                >
                  {row.student ? centsToRand(row.balanceCents) : "—"}
                </td>
                <td>
                  {!row.student ? (
                    <span className="text-[var(--muted)]">Vacant</span>
                  ) : row.overdue ? (
                    <span className="badge badge-overdue">Overdue</span>
                  ) : (
                    <span className="badge badge-ok">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent payments</h2>
            <Link href="/payments" className="text-sm">
              View all
            </Link>
          </div>
          <table className="data">
            <tbody>
              {recentPayments.length === 0 ? (
                <tr>
                  <td className="text-[var(--muted)]">No payments yet</td>
                </tr>
              ) : (
                recentPayments.map(({ payment, student, room }) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.paymentDate)}</td>
                    <td>
                      {student.name}{" "}
                      <span className="text-[var(--muted)]">({room.label})</span>
                    </td>
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
            <h2 className="text-lg font-semibold">Recent expenses</h2>
            <Link href="/expenses" className="text-sm">
              View all
            </Link>
          </div>
          <table className="data">
            <tbody>
              {recentExpenses.length === 0 ? (
                <tr>
                  <td className="text-[var(--muted)]">No expenses yet</td>
                </tr>
              ) : (
                recentExpenses.map(({ expense, room }) => (
                  <tr key={expense.id}>
                    <td>{formatDate(expense.expenseDate)}</td>
                    <td>
                      {EXPENSE_CATEGORY_LABELS[expense.category] ??
                        expense.category}
                      {room ? ` · ${room.label}` : " · Shared"}
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
