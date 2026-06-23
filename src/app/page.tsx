import Link from "next/link";
import { BusinessTagChart } from "@/components/BusinessTagChart";
import { IncomeExpenseChart } from "@/components/IncomeExpenseChart";
import { NetTrendChart } from "@/components/NetTrendChart";
import { SyncButton } from "@/components/SyncButton";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { BUSINESS_TAGS, type BusinessTag } from "@/lib/business-tags";
import {
  getAllTimeTotals,
  getBusinessChartData,
  getBusinessTagSummaries,
  getChartData,
  getExpenseTotalsByCategory,
  getMonthlyTotals,
  getNetTrend,
  getRecentExpenses,
  getRecentPayments,
} from "@/lib/dashboard-data";
import { centsToRand, formatDate } from "@/lib/money";

export const dynamic = "force-dynamic";

const CHART_TAGS: BusinessTag[] = ["accommodation", "chatcom"];

export default async function DashboardPage() {
  const [
    totals,
    allTime,
    recentPayments,
    recentExpenses,
    chartData,
    netTrend,
    tagSummaries,
    businessCharts,
    byCategory,
  ] = await Promise.all([
    getMonthlyTotals(),
    getAllTimeTotals(),
    getRecentPayments(8),
    getRecentExpenses(8),
    getChartData(12),
    getNetTrend(12),
    getBusinessTagSummaries(),
    getBusinessChartData(6),
    getExpenseTotalsByCategory(),
  ]);

  const topCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-[var(--muted)]">
            Business cash flow by category — {totals.month}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <SyncButton label="Sync new" />
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

      <div>
        <h2 className="mb-3 text-lg font-semibold">By business</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {tagSummaries.map((t) => (
            <div
              key={t.tag}
              className="card border-l-4"
              style={{ borderLeftColor: t.color }}
            >
              <p className="font-medium" style={{ color: t.color }}>
                {t.label}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {t.count} transaction{t.count === 1 ? "" : "s"} this month
              </p>
              <p className="mt-2 text-lg font-semibold">
                <span className="text-[var(--positive)]">
                  {centsToRand(t.inCents)}
                </span>
                {" · "}
                <span className="text-[var(--negative)]">
                  {centsToRand(t.outCents)}
                </span>
              </p>
              <p
                className={`text-sm ${t.netCents >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}
              >
                Net {centsToRand(t.netCents)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Business trends</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {CHART_TAGS.map((tag) => (
            <div key={tag} className="card">
              <h3
                className="mb-4 text-base font-semibold"
                style={{ color: BUSINESS_TAGS[tag].color }}
              >
                {BUSINESS_TAGS[tag].label}
              </h3>
              <BusinessTagChart
                data={businessCharts[tag]}
                color={BUSINESS_TAGS[tag].color}
                title={BUSINESS_TAGS[tag].label}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <p className="stat-label">All-time net</p>
        <p
          className={`text-xl font-semibold ${allTime.netCents >= 0 ? "text-[var(--positive)]" : "text-[var(--negative)]"}`}
        >
          {centsToRand(allTime.netCents)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Overall money in vs out</h2>
          <IncomeExpenseChart data={chartData} />
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Net trend</h2>
          <NetTrendChart data={netTrend} />
        </div>
      </div>

      {topCategories.length > 0 && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold">Manual expenses this month</h2>
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
          <div className="mb-3 flex justify-between">
            <h2 className="text-lg font-semibold">Recent transactions</h2>
            <Link href="/payments">Categorise</Link>
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
                    Sync Gmail to import bank transactions
                  </td>
                </tr>
              ) : (
                recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.paymentDate)}</td>
                    <td>{p.payerLabel}</td>
                    <td
                      className={
                        p.direction === "in"
                          ? "text-[var(--positive)]"
                          : "text-[var(--negative)]"
                      }
                    >
                      {p.direction === "in" ? "+" : "−"}
                      {centsToRand(p.amountCents)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="mb-3 flex justify-between">
            <h2 className="text-lg font-semibold">Recent manual expenses</h2>
            <Link href="/expenses">View all</Link>
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
                    No manual expenses
                  </td>
                </tr>
              ) : (
                recentExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDate(e.expenseDate)}</td>
                    <td>{e.description}</td>
                    <td className="text-[var(--negative)]">
                      {centsToRand(e.amountCents)}
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
